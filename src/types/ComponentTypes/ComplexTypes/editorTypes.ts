import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { SetStateAction } from "jotai";
import { Dispatch } from "react";
import { RemirrorJSON } from "remirror";

import { Size } from "../../baseTypes";

export interface EditorType {
  initialContent: RemirrorJSON | string | undefined;
  name: string;
  onChange: ({ name, value }: { name: string; value: any }) => void;
  onChangePlainText?: ({ name, value }: { name: string; value: string }) => void;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  isOutsideControlled?: boolean;
  isFullHeight?: boolean;
  customPlaceholder?: string;
  menubarSize?: Size;
  setContext?: Dispatch<SetStateAction<ReactFrameworkOutput<Remirror.Extensions> | undefined>>;
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
