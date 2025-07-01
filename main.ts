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
	}
}
