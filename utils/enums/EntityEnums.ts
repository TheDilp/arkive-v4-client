import { AvailableManuscriptEntityTypes } from "../../types/EntityTypes/manuscriptTypes";
import { AvailableIcons, IconEnum } from "./IconEnums";

export const AllEntities = [
  "manuscripts",
  "characters",
  "blueprints",
  "blueprint_instances",
  "documents",
  "maps",
  "graphs",
  "calendars",
  "dictionaries",
  "character_fields_templates",
  "character_fields",
  "conversations",
  "random_tables",
  "tags",
  "gateway_configurations",
];

export const SubEntityEnum = [
  "alter_names",
  "blueprint_instances",
  "map_pins",
  "character_map_pins",
  "map_layers",
  "nodes",
  "edges",
  "events",
  "random_table_options",
  "random_table_suboptions",
  "words",
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
  { value: "characters_single", label: "Characters (single)" },
  { value: "characters_multiple", label: "Characters (multiple)" },
  { value: "blueprints_single", label: "Blueprint instances (single)" },
  { value: "blueprints_multiple", label: "Blueprint instances (multiple)" },
  { value: "documents_single", label: "Document (single)" },
  { value: "documents_multiple", label: "Documents (multiple)" },
  { value: "images_single", label: "Image (single)" },
  { value: "images_multiple", label: "Images (multiple)" },
  { value: "locations_single", label: "Location (single)" },
  { value: "locations_multiple", label: "Locations (multiple)" },
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
  { value: "blueprints_single", label: "Blueprint instances (single)" },
  { value: "blueprints_multiple", label: "Blueprint instances (multiple)" },
  { value: "documents_single", label: "Document (single)" },
  { value: "documents_multiple", label: "Documents (multiple)" },
  { value: "images_single", label: "Image (single)" },
  { value: "images_multiple", label: "Images (multiple)" },
  { value: "locations_single", label: "Location (single)" },
  { value: "locations_multiple", label: "Locations (multiple)" },
  { value: "characters_single", label: "Character (single)" },
  { value: "characters_multiple", label: "Characters (multiple)" },
  { value: "events_single", label: "Events (single)" },
  { value: "events_multiple", label: "Events (multiple)" },
];

export const QuestionnaireQuestionTypesEnum = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select_single", label: "Select (single)" },
  { value: "select_multiple", label: "Select (multiple)" },
  { value: "boolean", label: "Boolean" },
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
  "manuscripts",
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
  "manuscripts",
  "documents",
  "maps",
  "graphs",
  "calendars",
  "dictionaries",
  "random_tables",
  "character_fields_templates",
  "document_templates",
];

export const DefaultUserFeatureFlags = ["close_drawer_on_save", "dice_theme", "default_dice_color"];

export const DiceThemes = [
  { label: "Default", value: "default" },
  { label: "Gemstone (shape)", value: "gemstone" },
  { label: "Blue/Green metal", value: "blueGreenMetal" },
  { label: "Rock", value: "rock" },
  { label: "Smooth", value: "smooth" },
  { label: "Wooden", value: "wooden" },
];

export const MiscellaneousSettings = [
  "sort_tags_alphabetically",
  "show_eras_in_calendars",
  "show_eras_in_timelines",
  "show_date_in_event_tooltip_in_calendar",
  "show_date_in_event_tooltip_in_timeline",
  "show_image_grid_view",
  "show_image_table_view",
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
  "create_words",
  "read_words",
  "update_words",
  "delete_words",
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
  "create_manuscripts",
  "read_manuscripts",
  "update_manuscripts",
  "delete_manuscripts",
] as const;

export const AvailableManuscriptEntityTypesEnum: { type: AvailableManuscriptEntityTypes; icon: AvailableIcons }[] = [
  { type: "characters" as const, icon: IconEnum.character },
  { type: "blueprint_instances" as const, icon: IconEnum.blueprint },
  { type: "documents" as const, icon: IconEnum.document },
  { type: "maps" as const, icon: IconEnum.map },
  { type: "graphs" as const, icon: IconEnum.graph },
  { type: "events" as const, icon: IconEnum.event },
  { type: "images" as const, icon: IconEnum.image },
];

export const DefaultCharacterDnD5EGameData = {
  abilities: {
    str: {
      value: 10,
      proficient: 0,
      max: null,
      bonuses: {
        check: "",
        save: "",
      },
    },
    dex: {
      value: 10,
      proficient: 0,
      max: null,
      bonuses: {
        check: "",
        save: "",
      },
    },
    con: {
      value: 10,
      proficient: 0,
      max: null,
      bonuses: {
        check: "",
        save: "",
      },
    },
    int: {
      value: 10,
      proficient: 0,
      max: null,
      bonuses: {
        check: "",
        save: "",
      },
    },
    wis: {
      value: 10,
      proficient: 0,
      max: null,
      bonuses: {
        check: "",
        save: "",
      },
    },
    cha: {
      value: 10,
      proficient: 0,
      max: null,
      bonuses: {
        check: "",
        save: "",
      },
    },
  },
  currency: {
    pp: 0,
    gp: 0,
    ep: 0,
    sp: 0,
    cp: 0,
  },
  skills: {
    acr: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    ani: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    arc: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    ath: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    dec: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    his: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    ins: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    itm: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    inv: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    med: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    nat: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    prc: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    prf: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    per: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    rel: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    slt: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    ste: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
    sur: {
      value: 0,
      bonuses: {
        check: "",
        passive: "",
      },
    },
  },
  attributes: {
    init: {
      ability: "dex",
      bonus: "",
    },
    movement: {
      burrow: null,
      climb: null,
      fly: null,
      swim: null,
      walk: null,
      units: null,
      hover: false,
    },

    senses: {
      darkvision: null,
      blindsight: null,
      tremorsense: null,
      truesight: null,
      units: null,
      special: "",
    },
    spellcasting: "int",

    ac: {
      flat: null,
      calc: "default",
    },
    hp: {
      value: 0,
      max: null,
    },
    death: {
      ability: "",
      roll: {
        min: null,
        max: null,
        mode: 0,
      },
      success: 0,
      failure: 0,
    },
  },
  details: {
    alignment: "",
    race: null,
    background: null,
    originalClass: "",
    xp: {
      value: 0,
    },
    appearance: "",
    trait: "",
    ideal: "",
    bond: "",
    flaw: "",
  },
  traits: {
    size: "med",
    di: {
      bypasses: [],
      value: [],
      custom: "",
    },
    dr: {
      bypasses: [],
      value: [],
      custom: "",
    },
    dv: {
      bypasses: [],
      value: [],
      custom: "",
    },
    dm: {
      amount: {},
      bypasses: [],
    },
    ci: {
      value: [],
      custom: "",
    },
    languages: {
      value: [],
      custom: "",
    },
    weaponProf: {
      value: [],
      custom: "",
    },
    armorProf: {
      value: [],
      custom: "",
    },
  },
};
