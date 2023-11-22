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
  "screens",
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
  { value: "dice_roll", label: "Dice Roll" },
  { value: "date", label: "Date" },
  { value: "random_table", label: "Random Table" },
  { value: "boolean", label: "Boolean" },
  { value: "documents_single", label: "Document (single)" },
  { value: "documents_multiple", label: "Documents (multiple)" },
  { value: "images_single", label: "Image (single)" },
  { value: "images_multiple", label: "Images (multiple)" },
  { value: "locations_single", label: "Location (single)" },
  { value: "locations_multiple", label: "Locations (multiple)" },
  { value: "blueprints_single", label: "Blueprint instances (single )" },
  { value: "blueprints_multiple", label: "Blueprint instances (multiple)" },
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
  { value: "blueprints_single", label: "Blueprint instances (single )" },
  { value: "blueprints_multiple", label: "Blueprint instances (multiple)" },
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

export const PublicEntities = [
  "characters",
  "blueprint_instances",
  "documents",
  "maps",
  "graphs",
  "dictionaries",
  "random_tables",
];
