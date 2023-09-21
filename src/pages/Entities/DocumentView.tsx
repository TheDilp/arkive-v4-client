import "remirror/styles/all.css";
import "../../Editor.css";

import { EditorComponent, Remirror, useRemirror } from "@remirror/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useEffect, useLayoutEffect, useState } from "react";
import { Navigate, unstable_useBlocker as useBlocker, useParams } from "react-router-dom";
import { RemirrorContentType } from "remirror";

import { MentionDropdownComponent } from "../../components/Complex/Editor/Extensions/Mention";
import { Menubar } from "../../components/Complex/Editor/Menubar";
import { Skeleton } from "../../components/Misc";
import { Notification } from "../../components/Overlay";
import { useChangeNavbarTitle, useGetEntity, useHandleChange, useUpdateEntity } from "../../hooks";
import { DocumentType } from "../../types";
import { breadcrumbsAtom, DefaultTagColor, IconEnum, useNotifications } from "../../utils";
import { Dice } from "../../utils/ui/diceRollerUtils";
import { DefaultEditorExtensions, editorHooks, onError } from "../../utils/ui/editorUtils";

export function DocumentView({ editable }: { editable: boolean }) {
  const { project_id, item_id } = useParams();
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  const {
    data: currentDocument,
    isFetching,
    isRefetching,
    refetch,
  } = useGetEntity<DocumentType>(
    item_id as string,
    "documents",
    {
      fields: ["id", "title", "content", "dice_color"],
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

  const { mutate: updateDocument } = useUpdateEntity<{
    data: { id: string; content: string | undefined };
  }>("documents", project_id as string);

  const [editorData, setEditorData] = useState({ content: undefined });
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);
  useChangeNavbarTitle(`The Arkive | Documents | ${currentDocument?.data?.title}`, !!currentDocument?.data?.title);

  const { manager, state, getContext } = useRemirror({
    extensions: () => DefaultEditorExtensions(createNotification),
    selection: "start",
    onError,
  });

  const { changedData, resetChanges, handleChange } = useHandleChange({ data: editorData, setData: setEditorData });

  useBlocker(() => {
    if (changedData) {
      // eslint-disable-next-line no-alert
      const response = !window.confirm("You have unsaved changes, are you sure you want to leave?");
      if (!response) queryClient.removeQueries({ queryKey: ["documents", item_id] });

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
      }, 1);
    }
  }, [currentDocument, isRefetching]);

  useEffect(() => {
    if (!isFetching) {
      if (currentDocument?.data?.dice_color) {
        Dice.updateConfig({ themeColor: currentDocument?.data?.dice_color });
      } else {
        Dice.updateConfig({ themeColor: DefaultTagColor });
      }
    }
  }, [currentDocument]);

  if (!currentDocument && !isFetching) {
    return <Navigate to="../" />;
  }
  if (isFetching)
    return (
      <div className="h-[90%] w-full max-w-[93vw] lg:h-full">
        <Skeleton type="editor" />
      </div>
    );
  return (
    <div className="h-full w-full max-w-[95vw] lg:h-full">
      {changedData ? (
        <div className="absolute right-4 top-2 z-40 duration-300 ease-out animate-in slide-in-from-right-10">
          <Notification
            actions={[
              {
                icon: IconEnum.save,
                label: "Save",
                variant: "success",
                onClick: () => {
                  updateDocument(
                    {
                      data: {
                        id: item_id as string,
                        content: JSON.stringify(editorData.content),
                      },
                    },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries(["documents", item_id, "mention"]);
                        resetChanges();
                      },
                    },
                  );
                },
              },
              {
                icon: IconEnum.close,
                label: "Discard",
                variant: "primary",
                onClick: () => {
                  resetChanges();
                  refetch();
                },
              },
            ]}
            hasNoTruncate
            id={currentDocument?.data?.id || crypto.randomUUID()}
            position="top-right"
            timer={0}
            title="You have unsaved changes. Press CTRL/CMD+S to save, CTRL/CMD+K to discard changes."
            variant="info"
          />
        </div>
      ) : null}
      <Remirror
        editable
        hooks={editorHooks(changedData, resetChanges, refetch, currentDocument?.data?.title || "")}
        initialContent={state}
        manager={manager}
        onChange={(params) => {
          if (params.firstRender) {
            return;
          }
          if (params.tr?.docChanged && !params.tr.getMeta("tableColumnResizing$1") && !params.tr.getMeta("commands$1"))
            handleChange({ name: "content", value: params.state.toJSON()?.doc });
        }}>
        <div
          className="relative flex h-full max-h-full max-w-full flex-1 flex-col overflow-y-auto rounded border border-zinc-800 py-0"
          id="editor">
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
    </div>
  );
}
