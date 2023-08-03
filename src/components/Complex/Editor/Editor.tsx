import "remirror/styles/all.css";
import "../../../Editor.css";

import { EditorComponent, Remirror, useRemirror } from "@remirror/react";
import { useCallback, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Fragment, InvalidContentHandler, RemirrorContentType } from "remirror";

import { useChangeNavbarTitle, useGetEntity, useHandleChange } from "../../../hooks";
import { DocumentType } from "../../../types";
import { IconEnum } from "../../../utils";
import { DefaultEditorExtensions, editorHooks } from "../../../utils/ui/editorUtils";
import { Notification } from "../../Overlay";
import { MentionDropdownComponent } from "./Extensions/Mention";

export function Editor({ editable }: { editable: boolean }) {
  const { item_id } = useParams();

  const { data: currentDocument, isLoading } = useGetEntity<DocumentType>(
    item_id as string,
    "documents",
    {
      data: {},
      fields: ["id", "title", "content"],
    },
    {
      enabled: !!editable && !!item_id,
      staleTime: 5 * 60 * 1000,
    },
  );
  const [editorData, setEditorData] = useState({ content: undefined });
  useChangeNavbarTitle(`The Arkive | Documents | ${currentDocument?.data?.title}`, !!currentDocument?.data?.title);

  const onError: InvalidContentHandler = useCallback(({ json, invalidContent, transformers }) => {
    // Automatically remove all invalid nodes and marks.
    return transformers.remove(json, invalidContent);
  }, []);

  const { manager, state, setState, getContext } = useRemirror({
    content: currentDocument?.data?.content || undefined,
    extensions: () => DefaultEditorExtensions(),
    selection: "start",
    onError,
  });
  const { changedData, resetChanges, handleChange } = useHandleChange({ data: editorData, setData: setEditorData });

  if (!currentDocument && !isLoading) {
    return <Navigate to="../" />;
  }

  return (
    <>
      {changedData ? (
        <div className="absolute right-4 top-2 animate-in slide-in-from-right-10 duration-300 ease-out">
          <Notification
            actions={[
              { icon: IconEnum.save, label: "Save", variant: "success", onClick: () => {} },
              {
                icon: IconEnum.close,
                label: "Discard",
                variant: "primary",
                onClick: () => {
                  resetChanges();
                  getContext()?.setContent(currentDocument?.data?.content as RemirrorContentType);
                },
              },
            ]}
            id={currentDocument?.data?.id || crypto.randomUUID()}
            timer={0}
            title="You have unsaved changes"
            variant="info"
          />
        </div>
      ) : null}
      <Remirror
        editable={editable}
        hooks={editorHooks}
        manager={manager}
        onChange={(params) => {
          if (params.firstRender) {
            return;
          }
          setState(params.state);
          if (params.tr?.docChanged) handleChange({ name: "content", value: params.state.toJSON() });
        }}
        state={state}>
        {/* <MenuBar /> */}

        <div className="flex h-[calc(100%-6rem)] w-full flex-1 rounded border border-zinc-800">
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
    </>
  );
}
