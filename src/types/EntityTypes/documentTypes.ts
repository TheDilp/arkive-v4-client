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
  is_randomized: boolean | null;
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
