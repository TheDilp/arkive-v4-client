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
  "tags",
];

export const FieldTypesEnum = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "select_multiple", label: "Select (multiple)" },
  { value: "dice_roll", label: "Dice Roll" },
  { value: "date", label: "Date" },
  { value: "random_table", label: "Random Table" },
  { value: "boolean", label: "Boolean" },
  // { value: "documents_single", label: "Document (single)" },
  // { value: "documents_multiple", label: "Documents (multiple)" },
  // { value: "images_single", label: "Image (single)" },
  // { value: "images_multiple", label: "Images (multiple)" },
  // { value: "locations_single", label: "Location (single)" },
  // { value: "locations_multiple", label: "Locations (multiple)" },
];

export const SearchFieldTypes = [
  "documents_single",
  "documents_multiple",
  "images_single",
  "images_multiple",
  // "locations_single",
  // "locations_multiple",
];

export const BaseCharacterRelationshipOptionsEnum = [
  { label: "Parent", value: "parent" },
  { label: "Partner", value: "partner" },
];

export const EntitiesWithTags = ["characters", "documents", "maps", "map_pins", "graphs", "nodes", "edges", "events"];

export const MessageTypeOptions = [
  { label: "Character", value: "character" },
  { label: "Narration", value: "narration" },
  { label: "Place", value: "Place" },
];
