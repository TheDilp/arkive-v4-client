import "remirror/styles/all.css";
import "../../../Editor.css";

import { EditorComponent, Remirror, useRemirror } from "@remirror/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useCallback, useLayoutEffect, useState } from "react";
import { Navigate, unstable_useBlocker as useBlocker, useParams } from "react-router-dom";
import { InvalidContentHandler, RemirrorContentType } from "remirror";

import { useChangeNavbarTitle, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { DocumentType } from "../../../types";
import { breadcrumbsAtom, IconEnum } from "../../../utils";
import { DefaultEditorExtensions, editorHooks } from "../../../utils/ui/editorUtils";
import { Skeleton } from "../../Misc";
import { Notification } from "../../Overlay";
import { MentionDropdownComponent } from "./Extensions/Mention";

export function Editor({ editable }: { editable: boolean }) {
  const { project_id, item_id } = useParams();
  const queryClient = useQueryClient();

  const { data: currentDocument, isLoading } = useGetEntity<DocumentType>(
    item_id as string,
    "documents",
    {
      data: {},
      fields: ["id", "title", "content"],
      relations: {
        parents: true,
      },
    },

    {
      enabled: !!editable && !!item_id,
      staleTime: 1000,
      queryKeyConcat: ["content"],
    },
  );
  const { mutate: updateDocument } = useUpdateEntity<{ data: { id: string; content: string | undefined } }>(
    "documents",
    project_id as string,
  );
  const [editorData, setEditorData] = useState({ content: undefined });
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);
  useChangeNavbarTitle(`The Arkive | Documents | ${currentDocument?.data?.title}`, !!currentDocument?.data?.title);

  const onError: InvalidContentHandler = useCallback(({ json, invalidContent, transformers }) => {
    // Automatically remove all invalid nodes and marks.
    return transformers.remove(json, invalidContent);
  }, []);
  const { manager, state, setState, getContext } = useRemirror({
    extensions: () => DefaultEditorExtensions(),
    selection: "start",
    onError,
  });
  const { changedData, resetChanges, handleChange } = useHandleChange({ data: editorData, setData: setEditorData });

  useBlocker(() => {
    if (changedData) {
      const response = !window.confirm("You have unsaved changes, are you sure you want to leave?");
      queryClient.removeQueries({ queryKey: ["documents", item_id] });
      return response;
    }
    queryClient.removeQueries({ queryKey: ["documents", item_id] });
    return false;
  });

  useLayoutEffect(() => {
    if (currentDocument?.data?.content) {
      setBreadcrumbs({ items: currentDocument?.data?.parents || [], type: "documents" });
      setTimeout(() => {
        manager.view.updateState(manager.createState({ content: currentDocument.data.content as RemirrorContentType }));
      }, 10);
    }
  }, [currentDocument]);

  if (!currentDocument && !isLoading) {
    return <Navigate to="../" />;
  }
  if (isLoading) return <Skeleton type="editor" />;

  return (
    <>
      {changedData ? (
        <div className="absolute right-4 top-2 animate-in slide-in-from-right-10 duration-300 ease-out">
          <Notification
            actions={[
              {
                icon: IconEnum.save,
                label: "Save",
                variant: "success",
                onClick: () => {
                  updateDocument({
                    data: {
                      id: item_id as string,
                      content: JSON.stringify(editorData.content),
                    },
                  });
                  resetChanges();
                },
              },
              {
                icon: IconEnum.close,
                label: "Discard",
                variant: "primary",
                onClick: () => {
                  resetChanges();
                  getContext()?.setContent((currentDocument?.data?.content ?? undefined) as RemirrorContentType);
                },
              },
            ]}
            id={currentDocument?.data?.id || crypto.randomUUID()}
            timer={0}
            title="You have unsaved changes. Press CTRL/CMD+S to save."
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
          if (params.tr?.docChanged) handleChange({ name: "content", value: params.state.toJSON()?.doc });
        }}
        state={state}>
        {/* <MenuBar /> */}

        <div className="flex h-[calc(95%)] w-full flex-1 overflow-y-auto rounded border border-zinc-800 lg:h-[calc(100%-2rem)]">
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
