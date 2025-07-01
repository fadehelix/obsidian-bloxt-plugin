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
import { MarkdownBlock } from "../types";
import { DraggableBlock } from "./DraggableBlock";
import {
	parseMarkdownBlocks,
	blocksToMarkdown,
} from "../utils/markdown-parser";
import { DEBOUNCE_DELAYS } from "../utils/debounce";

interface BlockEditorProps {
	content: string;
	onContentChange: (newContent: string) => void;
}

export const BlockEditor = ({ content, onContentChange }: BlockEditorProps) => {
	const [blocks, setBlocks] = useState<MarkdownBlock[]>([]);
	const [lastContent, setLastContent] = useState<string>("");
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
					const parsedBlocks = parseMarkdownBlocks(content);
					setBlocks(parsedBlocks);
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
				const oldIndex = items.findIndex(
					(item) => item.id === active.id
				);
				const newIndex = items.findIndex(
					(item) => item.id === over?.id
				);

				const newBlocks = arrayMove(items, oldIndex, newIndex);
				const newContent = blocksToMarkdown(newBlocks, content);
				onContentChange(newContent);

				return newBlocks;
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

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={closestCenter}
			onDragEnd={handleDragEnd}
		>
			<SortableContext
				items={blocks.map((b) => b.id)}
				strategy={verticalListSortingStrategy}
			>
				<div className="bloxt-editor">
					{blocks.length === 0 ? (
						<div className="bloxt-no-blocks">
							No blocks found. Try adding some headers or
							paragraphs to your document.
						</div>
					) : (
						blocks.map((block) => (
							<DraggableBlock key={block.id} block={block}>
								{renderBlock(block)}
							</DraggableBlock>
						))
					)}
				</div>
			</SortableContext>
		</DndContext>
	);
};
