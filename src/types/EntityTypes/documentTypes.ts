import { RemirrorJSON } from "remirror";

import { BaseEntityType, ImageType, TagType } from ".";

export interface AlterNameType {
  id: string;
  title: string;
  parent_id: string;
  project_id: string;
}

export interface DocumentType extends BaseEntityType {
  content: RemirrorJSON | string | null;
  is_template: boolean | null;
  properties: string | null;
  image_id?: string | null;
  alter_names: AlterNameType[];
  tags: TagType[];
  dice_color?: string | null;
  image: ImageType;
}

export type UpdateDocumentType = Partial<DocumentType>;
export type StaticRendererType = { content: RemirrorJSON };
