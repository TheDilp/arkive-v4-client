import { EditorComponent, Remirror, useRemirror } from "@remirror/react";

import { EditorType } from "../../../types";
import { DefaultEditorExtensions, onError, useNotifications } from "../../../utils";
import { MentionDropdownComponent } from ".";
import { Menubar } from "./Menubar";

export function Editor({
  initialContent,
  name,
  onChange,
  isReadOnly,
  isMenubarDisabled,
  onChangePlainText,
  hooks,
}: EditorType) {
  const createNotification = useNotifications();
  const { manager, state, getContext } = useRemirror({
    extensions: () => DefaultEditorExtensions(createNotification),
    selection: "start",
    onError,
    content: initialContent || undefined,
  });
  return (
    <Remirror
      editable={!isReadOnly}
      hooks={hooks ?? []}
      initialContent={state}
      manager={manager}
      onChange={(params) => {
        if (isReadOnly) return;
        if (params.firstRender) {
          return;
        }
        // if (onKeyDown) {
        //   console.log(params, args);
        //   // onKeyDown();
        // }
        if (params.tr?.docChanged && !params.tr.getMeta("tableColumnResizing$1") && !params.tr.getMeta("commands$1"))
          onChange({ name, value: params.state.toJSON()?.doc });

        if (onChangePlainText) {
          onChangePlainText({ name, value: getContext()?.helpers?.getText() });
        }
      }}>
      <div className="editor-component relative flex h-full w-full max-w-full flex-1 flex-col rounded border border-zinc-800 bg-zinc-900 py-0">
        {isReadOnly || isMenubarDisabled ? null : <Menubar />}
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
