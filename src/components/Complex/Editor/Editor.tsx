import { EditorComponent, Remirror, useRemirror } from "@remirror/react";
import { useEffect } from "react";

import { EditorType } from "../../../types";
import { DefaultEditorExtensions, onError, useNotifications } from "../../../utils";
import { MentionDropdownComponent } from ".";
import { Menubar } from "./Menubar";

export function Editor({
  initialContent,
  name,
  onChange,
  isReadOnly,
  isDisabled,
  customPlaceholder,
  menubarSize = "md",
  onChangePlainText,
  setContext,
  isOutsideControlled,
  isFullHeight,
  hooks,
}: EditorType) {
  const createNotification = useNotifications();
  const { manager, state, getContext } = useRemirror({
    extensions: () => DefaultEditorExtensions(createNotification, customPlaceholder),
    selection: "start",
    onError,
    content: initialContent || undefined,
  });

  useEffect(() => {
    // @ts-ignore
    if (setContext) setContext(getContext);
  }, []);

  useEffect(() => {
    if (isDisabled && isOutsideControlled && initialContent) {
      if (manager) manager?.view?.updateState(manager?.createState({ content: initialContent }));
    }
  }, [isDisabled, isOutsideControlled, initialContent]);

  return (
    // @ts-ignore
    <Remirror
      editable={!isReadOnly && !isDisabled}
      hooks={hooks ?? []}
      initialContent={state}
      manager={manager}
      onChange={(params) => {
        if (isReadOnly) return;
        if (params.firstRender) {
          return;
        }

        if (params.tr?.docChanged && !params.tr.getMeta("tableColumnResizing$1") && !params.tr.getMeta("commands$1"))
          onChange({ name, value: params.state.toJSON()?.doc });

        if (onChangePlainText) {
          onChangePlainText({ name, value: getContext()?.helpers?.getText() });
        }
      }}>
      <div
        className={`editor-component flex w-full max-w-full flex-col rounded-md border border-zinc-700 ${
          isDisabled ? "cursor-not-allowed bg-zinc-600" : "bg-zinc-900"
        } ${isReadOnly ? "cursor-not-allowed" : ""} ${isFullHeight ? "h-full" : "max-h-[30rem]"}`}>
        {isReadOnly || isDisabled ? null : <Menubar isEditorMenubar isTemplate={false} size={menubarSize} />}
        <div
          className="flex w-full flex-col content-start focus-visible:outline-none"
          onDrop={(e) => {
            if (isReadOnly || isDisabled) return;
            const stringData = e.dataTransfer.getData("Text");
            if (!stringData) return;
            if (stringData) {
              const data: { index: number; title: string; description?: string } = JSON.parse(e.dataTransfer.getData("Text"));
              if (!data) return;
              getContext()?.commands.insertText(`${data.title}: ${data?.description}`);
            }
          }}>
          <EditorComponent />
          {isReadOnly || isDisabled ? null : <MentionDropdownComponent />}
        </div>
      </div>
    </Remirror>
  );
}
