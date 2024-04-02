export const AllEntities = [
  "characters",
  "documents",
  "maps",
  "map_pins",
  "map_layers",
  "graphs",
  "nodes",
  "edges",
  "calendars",
  "events",
  "dictionaries",
  "words",
  "character_fields_templates",
  "character_fields",
  "conversations",
  "tags",
];

export const CharacterFieldTypesEnum = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "select_multiple", label: "Select (multiple)" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "random_table", label: "Random Table" },
  { value: "dice_roll", label: "Dice Roll" },
  { value: "documents_single", label: "Document (single)" },
  { value: "documents_multiple", label: "Documents (multiple)" },
  { value: "images_single", label: "Image (single)" },
  { value: "images_multiple", label: "Images (multiple)" },
  { value: "locations_single", label: "Location (single)" },
  { value: "locations_multiple", label: "Locations (multiple)" },
  { value: "blueprints_single", label: "Blueprint instances (single)" },
  { value: "blueprints_multiple", label: "Blueprint instances (multiple)" },
  { value: "events_single", label: "Events (single)" },
  { value: "events_multiple", label: "Events (multiple)" },
];

export const BlueprintFieldTypesEnum = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "select_multiple", label: "Select (multiple)" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "random_table", label: "Random Table" },
  { value: "dice_roll", label: "Dice Roll" },
  { value: "documents_single", label: "Document (single)" },
  { value: "documents_multiple", label: "Documents (multiple)" },
  { value: "images_single", label: "Image (single)" },
  { value: "images_multiple", label: "Images (multiple)" },
  { value: "locations_single", label: "Location (single)" },
  { value: "locations_multiple", label: "Locations (multiple)" },
  { value: "characters_single", label: "Character (single)" },
  { value: "characters_multiple", label: "Characters (multiple)" },
  { value: "blueprints_single", label: "Blueprint instances (single)" },
  { value: "blueprints_multiple", label: "Blueprint instances (multiple)" },
  { value: "events_single", label: "Events (single)" },
  { value: "events_multiple", label: "Events (multiple)" },
];

export const SearchFieldTypes = [
  "documents_single",
  "documents_multiple",
  "images_single",
  "images_multiple",
  "locations_single",
  "locations_multiple",
  "blueprints_single",
  "blueprints_multiple",
];

export const BaseCharacterRelationshipOptionsEnum = [
  { label: "Parent", value: "parent" },
  { label: "Partner", value: "partner" },
];

export const EntitiesWithTags = [
  "characters",
  "blueprint_instances",
  "documents",
  "calendars",
  "maps",
  "map_pins",
  "graphs",
  "nodes",
  "edges",
  "events",
];

export const MessageTypeOptions = [
  { label: "Character", value: "character" },
  { label: "Narration", value: "narration" },
  { label: "Place", value: "place" },
];

export const MentionableEntites = ["characters", "blueprint_instances", "documents", "maps", "graphs", "words"];

export const EntitiesWithFoldersEnum = ["documents", "maps", "graphs", "calendars", "dictionaries", "random_tables"];

export const PublicEntities = [
  "characters",
  "blueprint_instances",
  "documents",
  "maps",
  "graphs",
  "calendars",
  "dictionaries",
  // "random_tables",
];

export const UserNotificationEntities = [
  "characters",
  "blueprints",
  "blueprint_instances",
  "documents",
  "maps",
  "map_pins",
  "graphs",
  "calendars",
  "events",
  "dictionaries",
  "words",
  "character_fields_templates",
  "tags",
];

export const UserSidebarEntitiesEnabled = [
  "characters",
  "blueprints",
  "documents",
  "maps",
  "graphs",
  "calendars",
  "dictionaries",
  "random_tables",
  "character_fields_templates",
];

export const MiscellaneousSettings = [
  "sort_tags_alphabetically",
  "show_eras_in_calendars",
  "show_eras_in_timelines",
  "show_date_in_event_tooltip_in_calendar",
  "show_date_in_event_tooltip_in_timeline",
];

export const RolePermissions = [
  {
    title: "Characters",
    permissions: [
      {
        title: "Create characters",
        code: "create_characters",
      },
      {
        title: "View characters",
        code: "read_characters",
      },
      {
        title: "Edit characters",
        code: "update_characters",
      },
      {
        title: "Delete characters",
        code: "delete_characters",
      },
    ],
  },
  {
    title: "Blueprints",
    permissions: [
      {
        title: "Create blueprints",
        code: "create_blueprints",
      },
      {
        title: "View blueprints",
        code: "read_blueprints",
      },
      {
        title: "Edit blueprints",
        code: "update_blueprints",
      },
      {
        title: "Delete blueprints",
        code: "delete_blueprints",
      },
    ],
  },
  {
    title: "Blueprint instances",
    permissions: [
      {
        title: "Create blueprint instances",
        code: "create_blueprint_instances",
      },
      {
        title: "View blueprint instances",
        code: "read_blueprint_instances",
      },
      {
        title: "Edit blueprint instances",
        code: "update_blueprint_instances",
      },
      {
        title: "Delete blueprint instances",
        code: "delete_blueprint_instances",
      },
    ],
  },
  {
    title: "Documents",
    permissions: [
      {
        title: "Create documents",
        code: "create_documents",
      },
      {
        title: "View documents",
        code: "read_documents",
      },
      {
        title: "Edit documents",
        code: "update_documents",
      },
      {
        title: "Delete documents",
        code: "delete_documents",
      },
    ],
  },
  {
    title: "Maps",
    permissions: [
      {
        title: "Create maps",
        code: "create_maps",
      },
      {
        title: "View maps",
        code: "read_maps",
      },
      {
        title: "Edit maps",
        code: "update_maps",
      },
      {
        title: "Delete maps",
        code: "delete_maps",
      },
    ],
  },
  {
    title: "Graphs",
    permissions: [
      {
        title: "Create graphs",
        code: "create_graphs",
      },
      {
        title: "View graphs",
        code: "read_graphs",
      },
      {
        title: "Edit graphs",
        code: "update_graphs",
      },
      {
        title: "Delete graphs",
        code: "delete_graphs",
      },
    ],
  },
  {
    title: "Calendars",
    permissions: [
      {
        title: "Create calendars",
        code: "create_calendars",
      },
      {
        title: "View calendars",
        code: "read_calendars",
      },
      {
        title: "Edit calendars",
        code: "update_calendars",
      },
      {
        title: "Delete calendars",
        code: "delete_calendars",
      },
    ],
  },
  {
    title: "Dictionaries",
    permissions: [
      {
        title: "Create dictionaries",
        code: "create_dictionaries",
      },
      {
        title: "View dictionaries",
        code: "read_dictionaries",
      },
      {
        title: "Edit dictionaries",
        code: "update_dictionaries",
      },
      {
        title: "Delete dictionaries",
        code: "delete_dictionaries",
      },
    ],
  },
  {
    title: "Random tables",
    permissions: [
      {
        title: "Create random tables",
        code: "create_random_tables",
      },
      {
        title: "View random tables",
        code: "read_random_tables",
      },
      {
        title: "Edit random tables",
        code: "update_random_tables",
      },
      {
        title: "Delete random tables",
        code: "delete_random_tables",
      },
    ],
  },
  {
    title: "Tags",
    permissions: [
      {
        title: "Create tags",
        code: "create_tags",
      },
      {
        title: "View tags",
        code: "read_tags",
      },
      {
        title: "Edit tags",
        code: "update_tags",
      },
      {
        title: "Delete tags",
        code: "delete_tags",
      },
    ],
  },
  {
    title: "Character templates",
    permissions: [
      {
        title: "Create character templates",
        code: "create_character_fields_templates",
      },
      {
        title: "View character templates",
        code: "read_character_fields_templates",
      },
      {
        title: "Edit character templates",
        code: "update_character_fields_templates",
      },
      {
        title: "Delete character templates",
        code: "delete_character_fields_templates",
      },
    ],
  },
  {
    title: "Assets",
    permissions: [
      {
        title: "Upload assets",
        code: "create_assets",
      },
      {
        title: "View assets",
        code: "read_assets",
      },
      {
        title: "Edit assets",
        code: "update_assets",
      },
      {
        title: "Delete assets",
        code: "delete_assets",
      },
    ],
  },
];

export const RolePermissionCodes = [
  "create_characters",
  "read_characters",
  "update_characters",
  "delete_characters",
  "create_blueprints",
  "read_blueprints",
  "update_blueprints",
  "delete_blueprints",
  "create_blueprint_instances",
  "read_blueprint_instances",
  "update_blueprint_instances",
  "delete_blueprint_instances",
  "create_documents",
  "read_documents",
  "update_documents",
  "delete_documents",
  "create_maps",
  "read_maps",
  "update_maps",
  "delete_maps",
  "create_map_pins",
  "read_map_pins",
  "update_map_pins",
  "delete_map_pins",
  "create_graphs",
  "read_graphs",
  "update_graphs",
  "delete_graphs",
  "create_calendars",
  "read_calendars",
  "update_calendars",
  "delete_calendars",
  "create_events",
  "read_events",
  "update_events",
  "delete_events",
  "create_dictionaries",
  "read_dictionaries",
  "update_dictionaries",
  "delete_dictionaries",
  "create_random_tables",
  "read_random_tables",
  "update_random_tables",
  "delete_random_tables",
  "create_tags",
  "read_tags",
  "update_tags",
  "delete_tags",
  "create_character_fields_templates",
  "read_character_fields_templates",
  "update_character_fields_templates",
  "delete_character_fields_templates",
  "create_assets",
  "read_assets",
  "update_assets",
  "delete_assets",
] as const;
