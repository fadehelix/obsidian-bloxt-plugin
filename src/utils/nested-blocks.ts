import { MarkdownBlock, BloxtPluginSettings } from "../types";

/**
 * Creates a hierarchical structure of blocks based on header levels
 * Headers include their subsequent content (paragraphs and lower-level headers)
 */
export function createNestedBlocks(
	flatBlocks: MarkdownBlock[],
	settings: BloxtPluginSettings
): MarkdownBlock[] {
	if (!settings.enableNestedBlocks) {
		return flatBlocks.map((block) => ({
			...block,
			isDraggable: isBlockDraggable(block, settings),
		}));
	}

	const nestedBlocks: MarkdownBlock[] = [];
	const stack: MarkdownBlock[] = [];

	for (const block of flatBlocks) {
		block.isDraggable = isBlockDraggable(block, settings);

		if (block.type === "header") {
			// Pop headers from stack that are at the same or lower level
			while (
				stack.length > 0 &&
				stack[stack.length - 1].type === "header" &&
				stack[stack.length - 1].level! >= block.level!
			) {
				stack.pop();
			}

			// Add children property if it doesn't exist
			if (!block.children) {
				block.children = [];
			}

			// If there's a parent header in the stack, add this as its child
			if (stack.length > 0 && stack[stack.length - 1].type === "header") {
				if (!stack[stack.length - 1].children) {
					stack[stack.length - 1].children = [];
				}
				stack[stack.length - 1].children!.push(block);
			} else {
				// This is a top-level header
				nestedBlocks.push(block);
			}

			stack.push(block);
		} else {
			// This is a paragraph or other content
			if (stack.length > 0 && stack[stack.length - 1].type === "header") {
				// Add to the current header's children
				if (!stack[stack.length - 1].children) {
					stack[stack.length - 1].children = [];
				}
				stack[stack.length - 1].children!.push(block);
			} else {
				// This is a top-level paragraph
				nestedBlocks.push(block);
			}
		}
	}

	return nestedBlocks;
}

/**
 * Flattens nested blocks back into a flat array for markdown reconstruction
 */
export function flattenNestedBlocks(
	nestedBlocks: MarkdownBlock[]
): MarkdownBlock[] {
	const flatBlocks: MarkdownBlock[] = [];

	function traverse(blocks: MarkdownBlock[]) {
		for (const block of blocks) {
			// Add the block itself (without children in the flat version)
			const flatBlock = { ...block };
			delete flatBlock.children;
			flatBlocks.push(flatBlock);

			// Recursively add children
			if (block.children && block.children.length > 0) {
				traverse(block.children);
			}
		}
	}

	traverse(nestedBlocks);
	return flatBlocks;
}

/**
 * Determines if a block should be draggable based on settings
 */
function isBlockDraggable(
	block: MarkdownBlock,
	settings: BloxtPluginSettings
): boolean {
	if (block.type === "header" && block.level) {
		const headerKey =
			`h${block.level}` as keyof typeof settings.excludeFromDragging;
		return !settings.excludeFromDragging[headerKey];
	}

	if (block.type === "paragraph") {
		return !settings.excludeFromDragging.paragraphs;
	}

	return true;
}

/**
 * Moves a nested block and all its children to a new position
 */
export function moveNestedBlock(
	blocks: MarkdownBlock[],
	sourceId: string,
	targetId: string
): MarkdownBlock[] {
	// Find the source block and remove it from its current position
	let sourceBlock: MarkdownBlock | null = null;

	function removeBlock(blockList: MarkdownBlock[], id: string): boolean {
		for (let i = 0; i < blockList.length; i++) {
			if (blockList[i].id === id) {
				sourceBlock = blockList.splice(i, 1)[0];
				return true;
			}
			if (
				blockList[i].children &&
				removeBlock(blockList[i].children!, id)
			) {
				return true;
			}
		}
		return false;
	}

	function insertBlock(
		blockList: MarkdownBlock[],
		targetId: string,
		block: MarkdownBlock
	): boolean {
		for (let i = 0; i < blockList.length; i++) {
			if (blockList[i].id === targetId) {
				blockList.splice(i + 1, 0, block);
				return true;
			}
			if (
				blockList[i].children &&
				insertBlock(blockList[i].children!, targetId, block)
			) {
				return true;
			}
		}
		return false;
	}

	// Make a deep copy to avoid mutations
	const newBlocks = JSON.parse(JSON.stringify(blocks));

	if (removeBlock(newBlocks, sourceId) && sourceBlock) {
		if (!insertBlock(newBlocks, targetId, sourceBlock)) {
			// If we can't find the target, add to the end
			newBlocks.push(sourceBlock);
		}
	}

	return newBlocks;
}
