# Bloxt Obsidian Plugin

Reimagine document flow: Bloxt introduces block-based editing to Obsidian, letting you physically rearrange ideas through intuitive drag & drop. Organize knowledge spatially, experiment with structures, and break free from linear constraints - all while keeping standard Markdown intact.

## v0.1 Features

✅ **Basic drag & drop functionality**
- Drag and drop headers (H1-H6)
- Drag and drop paragraphs
- Real-time synchronization with markdown files
- Visual feedback during drag operations
- Frontmatter exclusion from draggable blocks

## v0.2 Features

✅ **Nested blocks and configuration**
- **Individual block dragging**: Every block (headers and paragraphs) is independently draggable
- **Visual hierarchy**: Nested content shown with indentation and visual indicators  
- **Configurable exclusions**: Settings panel to exclude specific elements (H1 and frontmatter excluded by default)
- **Flexible organization**: Move headers, paragraphs, and nested content independently
- **Smart reconstruction**: Document structure automatically maintained during reordering

## How to Use

1. **Install the plugin** in your Obsidian vault
2. **Open a markdown file** with headers and paragraphs
3. **Click the blocks icon** in the ribbon or use Command Palette: "Open Bloxt Editor"
4. **Drag any block** to rearrange your content - headers, paragraphs, and nested content are all individually draggable
5. **Configure exclusions** in Settings → Bloxt (H1 headers and frontmatter excluded by default)
6. **Changes sync automatically** to your markdown file

### v0.2 Key Features:
- **Every block is draggable**: Headers, paragraphs, and nested content can all be moved independently
- **Visual hierarchy**: Indented display shows document structure while maintaining individual control
- **Configurable**: Choose which elements can be dragged via the settings panel

## Development

### Setup
```bash
npm install
npm run dev  # for development
npm run build  # for production
```

## Plan
- v 0.1 - ✅ basic block drag&drop for headers and paragraphs.
- v 0.2 - ✅ Support nested blocks.
- v 0.3 - support quotes.
- v 0.4 - support lists.
- v 1.0
- v 2.0 - enable plugin for mobile devices.

### Possible improvements
- [ ] user is able to select blocks he wants to drag
- [ ] user is able to see in the bloxt panel the type of the element block is created from
- [ ] by default long block content is trimmed and User can expand it to see whole block content
