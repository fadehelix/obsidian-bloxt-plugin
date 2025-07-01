export interface MarkdownBlock {
	id: string;
	type: "header" | "paragraph";
	content: string;
	level?: number; // for headers (1-6)
	startLine: number;
	endLine: number;
}

export interface BloxtPluginSettings {
	enabled: boolean;
}
