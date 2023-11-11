import { ReactExtensions, ReactFrameworkOutput } from "@remirror/react";
import { AnyExtension, RemirrorJSON } from "remirror";

import { Size } from "../../baseTypes";

export type EditorContext = ReactFrameworkOutput<ReactExtensions<AnyExtension>> | undefined;

export interface MenubarType {
  editorContext: EditorContext;
}

export interface EditorType {
  initialContent: RemirrorJSON | string | undefined;
  name: string;
  onChange: ({ name, value }: { name: string; value: any }) => void;
  onChangePlainText?: ({ name, value }: { name: string; value: string }) => void;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  customPlaceholder?: string;
  menubarSize?: Size;
  hooks?: any;
}

export type slashMenuItem = {
  name: string;
  type:
    | "heading"
    | "list"
    | "quote"
    | "callout"
    | "image"
    | "divider"
    | "columns_select"
    | "columns"
    | "secret"
    | "map_select"
    | "map"
    | "board_select"
    | "board";
  icon: string;
  map_id?: string;
  board_id?: string;
  level?: number;
  callout_type?: string;
  color?: string;
  column_count?: number;
};
