import {
	App,
	Plugin,
	WorkspaceLeaf,
	PluginSettingTab,
	Setting,
} from "obsidian";
import { BloxtView, BLOXT_VIEW_TYPE } from "./src/BloxtView";
import { BloxtPluginSettings } from "./src/types";

const DEFAULT_SETTINGS: BloxtPluginSettings = {
	enabled: true,
	excludeFromDragging: {
		h1: true, // H1 excluded by default
		h2: false,
		h3: false,
		h4: false,
		h5: false,
		h6: false,
		frontmatter: true, // Frontmatter excluded by default
		paragraphs: false,
	},
	enableNestedBlocks: true,
};

export default class BloxtPlugin extends Plugin {
	settings: BloxtPluginSettings;

	async onload() {
		await this.loadSettings();

		// Register the custom view
		this.registerView(
			BLOXT_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new BloxtView(leaf, this)
		);

		// Add ribbon icon to open Bloxt view
		this.addRibbonIcon("blocks", "Open Bloxt Editor", () => {
			this.activateBloxtView();
		});

		// Add command to open Bloxt view
		this.addCommand({
			id: "open-bloxt-view",
			name: "Open Bloxt Editor",
			callback: () => {
				this.activateBloxtView();
			},
		});

		// Add settings tab
		this.addSettingTab(new BloxtSettingTab(this.app, this));
	}

	onunload() {
		// Clean up views
		this.app.workspace.detachLeavesOfType(BLOXT_VIEW_TYPE);
	}

	async activateBloxtView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(BLOXT_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({
					type: BLOXT_VIEW_TYPE,
					active: true,
				});
			}
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class BloxtSettingTab extends PluginSettingTab {
	plugin: BloxtPlugin;

	constructor(app: App, plugin: BloxtPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Enable Bloxt")
			.setDesc("Enable block-based editing for markdown files")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enabled)
					.onChange(async (value) => {
						this.plugin.settings.enabled = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Enable Nested Blocks")
			.setDesc(
				"Enable hierarchical block structure (drag headers with their content)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enableNestedBlocks)
					.onChange(async (value) => {
						this.plugin.settings.enableNestedBlocks = value;
						await this.plugin.saveSettings();
					})
			);

		// Header exclusions section
		containerEl.createEl("h3", { text: "Exclude from Dragging" });

		new Setting(containerEl)
			.setName("Exclude H1 Headers")
			.setDesc("Prevent H1 headers from being dragged")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.excludeFromDragging.h1)
					.onChange(async (value) => {
						this.plugin.settings.excludeFromDragging.h1 = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Exclude H2 Headers")
			.setDesc("Prevent H2 headers from being dragged")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.excludeFromDragging.h2)
					.onChange(async (value) => {
						this.plugin.settings.excludeFromDragging.h2 = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Exclude H3 Headers")
			.setDesc("Prevent H3 headers from being dragged")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.excludeFromDragging.h3)
					.onChange(async (value) => {
						this.plugin.settings.excludeFromDragging.h3 = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Exclude H4 Headers")
			.setDesc("Prevent H4 headers from being dragged")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.excludeFromDragging.h4)
					.onChange(async (value) => {
						this.plugin.settings.excludeFromDragging.h4 = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Exclude H5 Headers")
			.setDesc("Prevent H5 headers from being dragged")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.excludeFromDragging.h5)
					.onChange(async (value) => {
						this.plugin.settings.excludeFromDragging.h5 = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Exclude H6 Headers")
			.setDesc("Prevent H6 headers from being dragged")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.excludeFromDragging.h6)
					.onChange(async (value) => {
						this.plugin.settings.excludeFromDragging.h6 = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Exclude Frontmatter")
			.setDesc(
				"Prevent frontmatter from being dragged (always recommended)"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(
						this.plugin.settings.excludeFromDragging.frontmatter
					)
					.onChange(async (value) => {
						this.plugin.settings.excludeFromDragging.frontmatter =
							value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Exclude Paragraphs")
			.setDesc("Prevent paragraphs from being dragged")
			.addToggle((toggle) =>
				toggle
					.setValue(
						this.plugin.settings.excludeFromDragging.paragraphs
					)
					.onChange(async (value) => {
						this.plugin.settings.excludeFromDragging.paragraphs =
							value;
						await this.plugin.saveSettings();
					})
			);
	}
}
