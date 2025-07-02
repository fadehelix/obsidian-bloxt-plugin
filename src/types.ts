export interface MarkdownBlock {
	id: string;
	type: "header" | "paragraph";
	content: string;
	level?: number; // for headers (1-6)
	startLine: number;
	endLine: number;
	children?: MarkdownBlock[]; // nested blocks for hierarchical structure
	isDraggable?: boolean; // whether this block can be dragged
	displayLevel?: number; // visual indentation level for nested display
}

export interface BloxtPluginSettings {
	enabled: boolean;
	excludeFromDragging: {
		h1: boolean;
		h2: boolean;
		h3: boolean;
		h4: boolean;
		h5: boolean;
		h6: boolean;
		frontmatter: boolean;
		paragraphs: boolean;
	};
	enableNestedBlocks: boolean;
}
