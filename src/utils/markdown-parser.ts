import { MarkdownBlock, BloxtPluginSettings } from "../types";
import { v4 as uuidv4 } from "uuid";

export function parseMarkdownBlocks(
	content: string,
	settings?: BloxtPluginSettings
): MarkdownBlock[] {
	const lines = content.split("\n");
	const blocks: MarkdownBlock[] = [];
	let currentBlock: MarkdownBlock | null = null;
	let frontmatterEnd = 0;

	// Check for frontmatter (YAML between --- markers) and skip it
	// Frontmatter should not be included as draggable blocks
	if (lines[0]?.trim() === "---") {
		for (let i = 1; i < lines.length; i++) {
			if (lines[i]?.trim() === "---") {
				frontmatterEnd = i + 1;
				break;
			}
		}
	}

	// Skip frontmatter if excluded in settings
	if (settings?.excludeFromDragging.frontmatter !== false) {
		// Frontmatter is excluded by default
	}

	// Process lines starting after frontmatter
	lines.slice(frontmatterEnd).forEach((line, index) => {
		const actualIndex = index + frontmatterEnd;
		const trimmedLine = line.trim();

		// Header detection
		const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
		if (headerMatch) {
			if (currentBlock) {
				blocks.push(currentBlock);
			}
			currentBlock = {
				id: uuidv4(),
				type: "header",
				content: line,
				level: headerMatch[1].length,
				startLine: actualIndex,
				endLine: actualIndex,
			};
			return;
		}

		// Skip empty lines
		if (!trimmedLine) {
			if (currentBlock) {
				currentBlock.endLine = actualIndex - 1;
				blocks.push(currentBlock);
				currentBlock = null;
			}
			return;
		}

		// Paragraph content
		if (!currentBlock || currentBlock.type === "header") {
			if (currentBlock && currentBlock.type === "header") {
				blocks.push(currentBlock);
			}
			currentBlock = {
				id: uuidv4(),
				type: "paragraph",
				content: line,
				startLine: actualIndex,
				endLine: actualIndex,
			};
		} else {
			// Continue current paragraph
			currentBlock.content += "\n" + line;
			currentBlock.endLine = actualIndex;
		}
	});

	// Add the last block if exists
	if (currentBlock) {
		blocks.push(currentBlock);
	}

	return blocks;
}

export function blocksToMarkdown(
	blocks: MarkdownBlock[],
	originalContent?: string
): string {
	let result = "";

	// Preserve frontmatter if it exists in the original content
	// This ensures frontmatter stays at the top and is not affected by block reordering
	if (originalContent) {
		const lines = originalContent.split("\n");
		if (lines[0]?.trim() === "---") {
			for (let i = 0; i < lines.length; i++) {
				result += lines[i] + "\n";
				if (i > 0 && lines[i]?.trim() === "---") {
					result += "\n"; // Add extra newline after frontmatter
					break;
				}
			}
		}
	}

	// Add the reordered blocks
	const blockContent = blocks.map((block) => block.content).join("\n\n");
	result += blockContent;

	return result;
}
