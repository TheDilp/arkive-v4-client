import { EditorComponent, Remirror, useRemirror } from "@remirror/react";

import { EditorType } from "../../../types";
import { DefaultEditorExtensions, onError, useNotifications } from "../../../utils";
import { MentionDropdownComponent } from ".";
import { Menubar } from "./Menubar";

export function Editor({ initialContent, name, onChange, isReadOnly }: EditorType) {
  const createNotification = useNotifications();
  const { manager, state, getContext } = useRemirror({
    extensions: () => DefaultEditorExtensions(createNotification),
    selection: "start",
    onError,
    content: initialContent ? JSON.parse(initialContent || "{}") : undefined,
  });
  return (
    <Remirror
      editable={!isReadOnly}
      hooks={[]}
      initialContent={state}
      manager={manager}
      onChange={(params) => {
        if (isReadOnly) return;
        if (params.firstRender) {
          return;
        }
        if (params.tr?.docChanged && !params.tr.getMeta("tableColumnResizing$1") && !params.tr.getMeta("commands$1"))
          onChange({ name, value: params.state.toJSON()?.doc });
      }}>
      <div className="editor-component relative flex h-full w-full max-w-full flex-1 flex-col rounded border border-zinc-800 bg-zinc-900 py-0">
        {isReadOnly ? null : <Menubar />}
        <div
          className="relative flex h-full w-full flex-col content-start focus-visible:outline-none"
          onDrop={(e) => {
            if (isReadOnly) return;
            const stringData = e.dataTransfer.getData("Text");
            if (!stringData) return;
            if (stringData) {
              const data: { index: number; title: string; description?: string } = JSON.parse(e.dataTransfer.getData("Text"));
              if (!data) return;
              getContext()?.commands.insertText(`${data.title}: ${data?.description}`);
            }
          }}>
          <EditorComponent />
          {isReadOnly ? null : <MentionDropdownComponent />}
        </div>
      </div>
    </Remirror>
  );
}
