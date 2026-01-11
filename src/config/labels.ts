/**
 * Centralized labels for creative writing terminology
 * Maintains consistency across the application
 */

export const LABELS = {
  // Entity names
  project: {
    singular: "Project",
    plural: "Projects",
    description: "A creative writing project",
  },
  passage: {
    singular: "Passage",
    plural: "Passages",
    description: "A piece of generated content",
  },
  chapter: {
    singular: "Chapter",
    plural: "Chapters",
    description: "A section of your project",
  },

  // Actions
  actions: {
    create: "New Project",
    generate: "Generate",
    continue: "Continue Writing",
    save: "Save",
    export: "Export",
    delete: "Delete",
    edit: "Edit",
    cancel: "Cancel",
    regenerate: "Regenerate",
  },

  // UI Elements
  ui: {
    sidebar: "Project Library",
    composer: "Writing Prompt",
    referenceLibrary: "Reference Library",
    statistics: "Statistics",
    emptyState: "Begin Your Story",
    generating: "Generating...",
    ready: "Ready to write",
  },

  // Placeholders
  placeholders: {
    composer: "Describe what happens next...",
    search: "Search projects...",
    title: "Untitled Project",
  },

  // Status messages
  status: {
    noApiKey: "Set API key to begin",
    streaming: "Generating content...",
    saved: "Saved successfully",
    deleted: "Deleted successfully",
    exported: "Exported successfully",
  },

  // Navigation
  nav: {
    write: "Write",
    lore: "Lore",
    characters: "Characters",
    settings: "Settings",
  },
} as const;
