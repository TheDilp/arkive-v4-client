import { ReactExtensions, ReactFrameworkOutput } from "@remirror/react";
import { AnyExtension } from "remirror";

export type EditorContext = ReactFrameworkOutput<ReactExtensions<AnyExtension>> | undefined;

export interface MenubarType {
  editorContext: EditorContext;
}

export interface EditorType {
  initialContent: string;
  name: string;
  onChange: ({ name, value }: { name: string; value: any }) => void;
  isReadOnly?: boolean;
}
