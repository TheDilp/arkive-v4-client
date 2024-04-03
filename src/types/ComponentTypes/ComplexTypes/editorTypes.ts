import { RemirrorJSON } from "remirror";

import { Size } from "../../baseTypes";

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
  type: "heading" | "list" | "quote" | "callout" | "image" | "divider" | "secret" | "table";
  icon: string;
  map_id?: string;
  board_id?: string;
  level?: number;
  callout_type?: string;
  color?: string;
  column_count?: number;
};
