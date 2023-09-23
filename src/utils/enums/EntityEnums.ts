export const FieldTypesEnum = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "select_multiple", label: "Select (multiple)" },
  { value: "dice_roll", label: "Dice Roll" },
  { value: "date", label: "Date" },
  { value: "random_table", label: "Random Table" },
  { value: "documents_single", label: "Document (single)" },
  { value: "documents_multiple", label: "Documents (multiple)" },
  { value: "images_single", label: "Image (single)" },
  { value: "images_multiple", label: "Images (multiple)" },
];

export const BaseCharacterRelationshipOptionsEnum = [
  { label: "Parent", value: "parent" },
  { label: "Partner", value: "partner" },
];

export const EntitiesWithTags = ["characters", "documents", "maps", "map_pins", "graphs", "nodes", "edges", "events"];
