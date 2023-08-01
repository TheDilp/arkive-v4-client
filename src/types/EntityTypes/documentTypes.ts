import { RemirrorJSON } from "remirror";

import { BaseEntityType, ImageType } from ".";

export interface AlterNameType {
  id: string;
  title: string;
}

export interface DocumentType extends BaseEntityType {
  content: RemirrorJSON | null;
  is_template: boolean | null;
  properties: string | null;
  image_id?: string | null;
  alter_names: AlterNameType[];
  image: ImageType;
}

export type StaticRendererType = { content: RemirrorJSON };
