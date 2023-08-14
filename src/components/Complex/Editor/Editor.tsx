import { EditorComponent, Remirror, useRemirror } from "@remirror/react";

import { DefaultEditorExtensions, onError } from "../../../utils";
import { MentionDropdownComponent } from ".";
import { Menubar } from "./Menubar";

type Props = {
  initialContent: string;
  name: string;
  onChange: ({ name, value }: { name: string; value: any }) => void;
};

export function Editor({ initialContent, name, onChange }: Props) {
  const { manager, state, getContext } = useRemirror({
    extensions: () => DefaultEditorExtensions(() => {}),
    selection: "start",
    onError,
    content: initialContent ? JSON.parse(initialContent || "{}") : undefined,
  });
  return (
    <Remirror
      editable
      hooks={[]}
      initialContent={state}
      manager={manager}
      onChange={(params) => {
        if (params.firstRender) {
          return;
        }
        if (params.tr?.docChanged && !params.tr.getMeta("tableColumnResizing$1") && !params.tr.getMeta("commands$1"))
          onChange({ name, value: params.state.toJSON()?.doc });
      }}>
      <div className="editor-component relative flex h-full w-full max-w-full flex-1 flex-col rounded border border-zinc-800 bg-zinc-900 py-0">
        <Menubar />
        <div
          className="relative flex h-full w-full flex-col content-start focus-visible:outline-none"
          onDrop={(e) => {
            const stringData = e.dataTransfer.getData("Text");
            if (!stringData) return;
            if (stringData) {
              const data: { index: number; title: string; description?: string } = JSON.parse(e.dataTransfer.getData("Text"));
              if (!data) return;
              getContext()?.commands.insertText(`${data.title}: ${data?.description}`);
            }
          }}>
          <EditorComponent />
          <MentionDropdownComponent />
          {/* <CommandMenu /> */}
        </div>
      </div>
    </Remirror>
  );
}
