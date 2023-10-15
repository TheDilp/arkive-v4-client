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
  menubarSize?: Size;
  hooks?: any;
}
