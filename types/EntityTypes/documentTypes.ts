import { RemirrorJSON } from "remirror";

import { BaseEntityType, ImageType, SearchableEntities, TagType } from ".";

interface AlterNameType {
  id: string;
  title: string;
  parent_id: string;
  project_id: string;
}

export type MatchType = SearchableEntities | "random_tables" | "dice_roll" | "derived" | "custom";
export type DocumentTemplateFieldType = {
  id: string;
  key: string;
  entity_type: MatchType | null;
  parent_id: string;
  value: string | null;
  formula: string | null;
  derive_from: string | null;
  derive_formula: string | null;
  related_id: string | null;
  is_randomized: boolean | null;
  random_count:
    | "single"
    | "max_2"
    | "max_3"
    | "max_4"
    | "max_5"
    | "max_6"
    | "max_7"
    | "max_8"
    | "max_9"
    | "max_10"
    | "max_11"
    | "max_12"
    | "max_13"
    | "max_14"
    | "max_15"
    | "max_16"
    | "max_17"
    | "max_18"
    | "max_19"
    | "max_20"
    | null;
  sort: number;
};

export interface DocumentType extends BaseEntityType {
  content: RemirrorJSON | string | null;
  is_template: boolean | null;
  properties: string | null;
  image_id?: string | null;
  alter_names: AlterNameType[];
  tags: Omit<TagType, "owner_id" | "permissions">[];
  dice_color?: string | null;
  image: ImageType;
  template_fields: DocumentTemplateFieldType[];
}
export interface InsertDocumentType extends Omit<DocumentType, "alter_names"> {
  alter_names: { title: string }[];
}

export type UpdateDocumentType = Partial<DocumentType>;
