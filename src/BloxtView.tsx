import { ItemView, WorkspaceLeaf, MarkdownView } from "obsidian";
import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { BlockEditor } from "./components/BlockEditor";
import BloxtPlugin from "../main";

export const BLOXT_VIEW_TYPE = "bloxt-view";

export class BloxtView extends ItemView {
	private reactRoot: Root | null = null;
	private plugin: BloxtPlugin;
	private refreshCounter = 0;
	private targetMarkdownView: MarkdownView | null = null;
	private lastFileContent = "";
	private contentCheckInterval: NodeJS.Timeout | null = null;

	constructor(leaf: WorkspaceLeaf, plugin: BloxtPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return BLOXT_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Bloxt Editor";
	}

	getIcon(): string {
		return "blocks";
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();

		// Add refresh button
		const headerDiv = container.createDiv("bloxt-header");
		const refreshButton = headerDiv.createEl("button", {
			text: "🔄 Refresh",
			cls: "mod-cta",
		});
		refreshButton.addEventListener("click", () => {
			this.refreshCounter++;
			this.renderBlockEditor();
		});

		// Create wrapper div for React
		const reactContainer = container.createDiv();
		reactContainer.addClass("bloxt-view-container");

		this.reactRoot = createRoot(reactContainer);
		this.renderBlockEditor();

		// Start automatic content checking
		this.startContentMonitoring();

		// Listen for file switches
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				// Only refresh if the new active leaf is different from our stored one
				const activeLeaf =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeLeaf && activeLeaf !== this.targetMarkdownView) {
					this.renderBlockEditor();
				}
			})
		);
	}

	async onClose(): Promise<void> {
		if (this.reactRoot) {
			this.reactRoot.unmount();
			this.reactRoot = null;
		}
		this.targetMarkdownView = null;
		this.stopContentMonitoring();
	}

	private renderBlockEditor(): void {
		if (!this.reactRoot) return;

		// Try to get the active markdown view, or use the stored one
		let activeLeaf = this.app.workspace.getActiveViewOfType(MarkdownView);

		// If no active markdown view but we have a stored one, use it
		if (!activeLeaf && this.targetMarkdownView) {
			activeLeaf = this.targetMarkdownView;
		}

		// If we found an active leaf, store it for future refreshes
		if (activeLeaf && activeLeaf.file) {
			this.targetMarkdownView = activeLeaf;
		}

		if (!activeLeaf || !activeLeaf.file) {
			this.reactRoot.render(
				createElement(
					"div",
					{ className: "bloxt-no-file" },
					"Open a markdown file to use Bloxt editor"
				)
			);
			return;
		}

		const content = activeLeaf.getViewData();

		// Update the last known content
		this.lastFileContent = content;

		const handleContentChange = (newContent: string) => {
			if (content !== newContent && activeLeaf) {
				this.lastFileContent = newContent; // Update when content changes via drag & drop
				activeLeaf.setViewData(newContent, false);
			}
		};

		this.reactRoot.render(
			createElement(BlockEditor, {
				key: `bloxt-editor-${this.refreshCounter}`, // Force re-mount on refresh
				content,
				onContentChange: handleContentChange,
				settings: this.plugin.settings, // Pass settings to BlockEditor
			})
		);
	}

	private startContentMonitoring(): void {
		// Check for content changes every 1.5 seconds
		this.contentCheckInterval = setInterval(() => {
			this.checkForContentChanges();
		}, 1500);
	}

	private stopContentMonitoring(): void {
		if (this.contentCheckInterval) {
			clearInterval(this.contentCheckInterval);
			this.contentCheckInterval = null;
		}
	}

	private checkForContentChanges(): void {
		if (!this.targetMarkdownView || !this.targetMarkdownView.file) {
			return;
		}

		const currentContent = this.targetMarkdownView.getViewData();

		// Only refresh if content actually changed and view is visible
		if (
			currentContent !== this.lastFileContent &&
			this.containerEl.isShown()
		) {
			this.lastFileContent = currentContent;
			this.renderBlockEditor();
		}
	}

	refresh(): void {
		this.renderBlockEditor();
	}
}
