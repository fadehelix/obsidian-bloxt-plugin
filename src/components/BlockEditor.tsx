import { useState, useEffect, useRef } from "react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MarkdownBlock, BloxtPluginSettings } from "../types";
import { DraggableBlock } from "./DraggableBlock";
import {
	parseMarkdownBlocks,
	blocksToMarkdown,
} from "../utils/markdown-parser";
import {
	createNestedBlocks,
	flattenNestedBlocks,
} from "../utils/nested-blocks";
import { DEBOUNCE_DELAYS } from "../utils/debounce";

interface BlockEditorProps {
	content: string;
	onContentChange: (newContent: string) => void;
	settings: BloxtPluginSettings;
}

export const BlockEditor = ({
	content,
	onContentChange,
	settings,
}: BlockEditorProps) => {
	const [blocks, setBlocks] = useState<MarkdownBlock[]>([]);
	const [lastContent, setLastContent] = useState<string>("");
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	// Default settings fallback
	const defaultSettings: BloxtPluginSettings = {
		enabled: true,
		excludeFromDragging: {
			h1: true,
			h2: false,
			h3: false,
			h4: false,
			h5: false,
			h6: false,
			frontmatter: true,
			paragraphs: false,
		},
		enableNestedBlocks: true,
	};

	const currentSettings = settings || defaultSettings;

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8, // Require 8px movement before dragging starts
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	useEffect(() => {
		// Clear any existing debounce timer
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		// Always update on first render or when content changes
		if (lastContent === "" || content !== lastContent) {
			// Debounce the content parsing to avoid excessive re-renders
			debounceRef.current = setTimeout(
				() => {
					const parsedBlocks = parseMarkdownBlocks(
						content,
						currentSettings
					);
					const nestedBlocks = createNestedBlocks(
						parsedBlocks,
						currentSettings
					);
					setBlocks(nestedBlocks);
					setLastContent(content);
				},
				lastContent === "" ? 0 : DEBOUNCE_DELAYS.CONTENT_PARSING
			); // No delay on first render
		}

		// Cleanup function to clear timeout on unmount
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [content, lastContent]);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (active.id !== over?.id) {
			setBlocks((items) => {
				// For nested blocks, we need to flatten first, then reorder, then restructure
				const flatBlocks = currentSettings.enableNestedBlocks
					? flattenNestedBlocks(items)
					: items;

				const oldIndex = flatBlocks.findIndex(
					(item) => item.id === active.id
				);
				const newIndex = flatBlocks.findIndex(
					(item) => item.id === over?.id
				);

				const reorderedBlocks = arrayMove(
					flatBlocks,
					oldIndex,
					newIndex
				);

				// Reconstruct nested structure if enabled
				const finalBlocks = currentSettings.enableNestedBlocks
					? createNestedBlocks(reorderedBlocks, currentSettings)
					: reorderedBlocks;

				const newContent = blocksToMarkdown(reorderedBlocks, content);
				onContentChange(newContent);

				return finalBlocks;
			});
		}
	};

	const renderBlock = (block: MarkdownBlock) => {
		const content = block.content.trim();

		if (block.type === "header") {
			const headerLevel = block.level || 1;
			const headerText = content.replace(/^#{1,6}\s+/, "");

			// Create header element based on level
			switch (headerLevel) {
				case 1:
					return <h1 className="bloxt-header">{headerText}</h1>;
				case 2:
					return <h2 className="bloxt-header">{headerText}</h2>;
				case 3:
					return <h3 className="bloxt-header">{headerText}</h3>;
				case 4:
					return <h4 className="bloxt-header">{headerText}</h4>;
				case 5:
					return <h5 className="bloxt-header">{headerText}</h5>;
				case 6:
					return <h6 className="bloxt-header">{headerText}</h6>;
				default:
					return <h1 className="bloxt-header">{headerText}</h1>;
			}
		}

		return (
			<div className="bloxt-paragraph">
				{content.split("\n").map((line, index) => (
					<p key={index}>{line}</p>
				))}
			</div>
		);
	};

	const renderDraggableBlock = (block: MarkdownBlock) => {
		if (block.isDraggable === false) {
			// Non-draggable blocks are rendered without drag functionality
			return (
				<div key={block.id} className="bloxt-non-draggable">
					{renderBlock(block)}
				</div>
			);
		}

		return (
			<DraggableBlock key={block.id} block={block}>
				{renderBlock(block)}
			</DraggableBlock>
		);
	};

	// Get all draggable block IDs (including nested ones)
	// Flatten blocks for display while maintaining visual hierarchy info
	const flattenBlocksForDisplay = (
		blocks: MarkdownBlock[],
		level = 0
	): MarkdownBlock[] => {
		const flattened: MarkdownBlock[] = [];

		for (const block of blocks) {
			// Add visual hierarchy level to the block
			const displayBlock = { ...block, displayLevel: level };
			flattened.push(displayBlock);

			// Add children at the next level
			if (block.children && block.children.length > 0) {
				flattened.push(
					...flattenBlocksForDisplay(block.children, level + 1)
				);
			}
		}

		return flattened;
	};

	const displayBlocks = currentSettings.enableNestedBlocks
		? flattenBlocksForDisplay(blocks)
		: blocks;

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={displayBlocks
					.filter((b) => b.isDraggable !== false)
					.map((b) => b.id)}
				strategy={verticalListSortingStrategy}
			>
				<div className="bloxt-editor">
					{displayBlocks.length === 0 ? (
						<div className="bloxt-no-blocks">
							No blocks found. Try adding some headers or
							paragraphs to your document.
						</div>
					) : (
						displayBlocks.map((block) => (
							<div
								key={block.id}
								style={{
									marginLeft: `${
										(block.displayLevel || 0) * 20
									}px`,
									opacity:
										(block.displayLevel || 0) > 0 ? 0.9 : 1,
								}}
								className={`bloxt-display-block ${
									(block.displayLevel || 0) > 0
										? "bloxt-nested-display"
										: ""
								}`}
							>
								{renderDraggableBlock(block)}
							</div>
						))
					)}
				</div>
			</SortableContext>
		</DndContext>
	);
};
