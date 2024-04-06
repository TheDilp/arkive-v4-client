import "remirror/styles/all.css";
import "../../Editor.css";

import { EditorComponent, Remirror, useRemirror } from "@remirror/react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { MouseEvent, useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Navigate, useBlocker, useParams } from "react-router-dom";
import { RemirrorContentType } from "remirror";

import { SlashMenu } from "../../components";
import { MentionDropdownComponent } from "../../components/Complex/Editor/Extensions/Mention";
import { Menubar } from "../../components/Complex/Editor/Menubar";
import { Icon, Skeleton } from "../../components/Misc";
import { Notification } from "../../components/Overlay";
import {
  useChangeNavbarTitle,
  useGetEntities,
  useGetEntity,
  useHandleChange,
  useHasPermissions,
  useUpdateEntity,
} from "../../hooks";
import { DocumentType, WebhookType } from "../../types";
import {
  baseURLS,
  breadcrumbsAtom,
  contextMenuAtom,
  DefaultTagColor,
  drawerAtom,
  FetchFunction,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  mentionPositionAtom,
  useNotifications,
  userAtom,
} from "../../utils";
import { Dice } from "../../utils/ui/diceRollerUtils";
import { DefaultEditorExtensions, documentEditorHooks, onError } from "../../utils/ui/editorUtils";

export default function DocumentView({ editable }: { editable: boolean }) {
  const { project_id, item_id } = useParams();
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);
  const createNotification = useNotifications();
  const drawer = useAtomValue(drawerAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const mentionPosition = useAtomValue(mentionPositionAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const { data: webhooks } = useGetEntities<WebhookType>({ data: { user_id: user?.id }, fields: ["id", "title"] }, "webhooks", {
    enabled: !!user?.id && isProjectOwner,
    staleTime: Infinity,
  });

  const {
    data: currentDocument,
    isFetching,
    isRefetching,
    refetch,
  } = useGetEntity<DocumentType>(
    item_id as string,
    "documents",
    {
      fields: ["id", "title", "icon", "content", "is_folder", "dice_color", "owner_id"],
      relations: {
        parents: true,
      },
      permissions: true,
    },

    {
      enabled: !!editable && !!item_id,
      staleTime: 1000,
      queryKeyConcat: ["content"],
    },
  );

  const permissions = useHasPermissions(["update_documents"], currentDocument?.data?.owner_id);
  const canUpdate = hasActionPermission(
    isProjectOwner,
    user?.id === currentDocument?.data?.owner_id,
    permissions,
    currentDocument?.data?.permissions || [],
    "update_documents",
    user?.role?.id,
  );

  const { mutate: updateDocument, isLoading: isUpdating } = useUpdateEntity<{
    data: { id: string; content: string | undefined };
  }>("documents", project_id as string);

  const [editorData, setEditorData] = useState({ content: undefined });
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);
  useChangeNavbarTitle(` Documents | ${currentDocument?.data?.title}`, !!currentDocument?.data?.title);

  const { manager, state, getContext } = useRemirror({
    extensions: () => DefaultEditorExtensions(createNotification),
    selection: "start",
    onError,
  });

  const { changedData, resetChanges, handleChange } = useHandleChange({ data: editorData, setData: setEditorData });

  const getContextActions = useCallback((e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    e.preventDefault();

    const slice = getContext()?.getState().selection.content();
    let title = "";
    if (slice) {
      slice.content.descendants((node) => {
        if (node.type.name === "mentionAtom") {
          title += node.attrs.label;
        } else if (node.type.name === "text") {
          title += node.textContent;
        }
      });
      if (title.length > 250) {
        return;
      }
    }
    setContextMenu({
      // @ts-ignore
      event: e,
      items: [
        {
          id: "1",
          title: "Create entity from text",
          icon: IconEnum.add,
          subItems: [
            {
              id: "3a",
              title: "Character",
              icon: IconEnum.character,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  title: "Create character",
                  data: { preselectedTab: 0, id: undefined, title },
                  type: "characters",
                  size: "xl",
                })),
            },
            {
              id: "3b",
              title: "Blueprint instance",
              icon: IconEnum.blueprint,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  title: "Create blueprint instance",
                  data: { title },
                  type: "blueprint_instances",
                })),
            },
            {
              id: "3c",
              title: "Document",
              icon: IconEnum.document,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  title: "Create document",
                  data: { preselectedTab: 0, id: undefined, title },
                  type: "documents",
                })),
            },
            {
              id: "3d",
              title: "Map",
              icon: IconEnum.map,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  title: "Create map",
                  data: { preselectedTab: 0, id: undefined, title },
                  type: "maps",
                })),
            },
            {
              id: "3e",
              title: "Graph",
              icon: IconEnum.graph,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  title: "Create graph",
                  data: { preselectedTab: 0, id: undefined, title },
                  type: "graphs",
                })),
            },
            {
              id: "3f",
              title: "Word",
              icon: IconEnum.word,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  title: "Create word",
                  data: { title },
                  type: "words",
                })),
            },
          ],
        },
        {
          id: "2",
          title: "Send text to Discord",
          icon: IconEnum.discord,
          subItems: (webhooks?.data || []).map((webhook) => ({
            id: webhook.id,
            title: webhook.title,
            onClick: () => {
              if (title.length > 2500) {
                createNotification({
                  title: "Text sent to Discord cannot have more than 2500 characters.",
                  variant: "warning",
                  icon: IconEnum.warning,
                  timer: 5,
                });
              } else {
                FetchFunction({
                  url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                  body: JSON.stringify({
                    data: { title: currentDocument?.data?.title, description: title, type: "document_text" },
                  }),
                  method: "POST",
                });
              }
            },
          })),
        },
      ],
    });
  }, []);

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
    if (
      (currentDocument?.data?.content || currentDocument?.data?.content === null) &&
      manager.view.state.doc.textContent === ""
    ) {
      setBreadcrumbs({ items: currentDocument?.data?.parents || [], type: "documents" });
      // Timeout is necessary for mentions to load and render correctly
      setTimeout(() => {
        manager.view.updateState(
          manager.createState({ content: (currentDocument.data.content || undefined) as RemirrorContentType }),
        );
      }, 0.0001);
    }
  }, [currentDocument, isRefetching]);

  useEffect(() => {
    if (!isFetching) {
      if (currentDocument?.data?.dice_color) {
        Dice.updateConfig({ themeColor: currentDocument?.data?.dice_color });
      } else {
        const defaultDiceColor: string | null = ls.get("default_dice_color");
        Dice.updateConfig({ themeColor: defaultDiceColor || DefaultTagColor });
      }
    }
  }, [currentDocument]);

  useEffect(() => {
    if (item_id) {
      resetChanges();
      if (manager) manager?.view?.updateState(manager?.createState({ content: undefined }));
    }
  }, [item_id]);

  useEffect(() => {
    if (!drawer.type) {
      // console.log(getContext());
      getContext()?.commands.setAnnotations([]);
    }
  }, [drawer.type]);

  if (isFetching)
    return (
      <div className="max-h-full min-h-full w-full">
        <Skeleton type="editor" />
      </div>
    );
  if (!currentDocument && !isFetching) {
    return <Navigate to="../" />;
  }
  if (currentDocument?.data?.is_folder) {
    return <Navigate to={`../folder/${currentDocument?.data?.id}`} />;
  }

  return (
    <div className="mx-auto h-[calc(100%-3rem)] max-h-full w-full max-w-full rounded bg-zinc-800 lg:w-[60%]">
      {changedData ? (
        <div className="absolute right-4 top-2 z-40 duration-300 ease-out animate-in slide-in-from-right-10">
          <Notification
            actions={[
              {
                icon: IconEnum.save,
                label: "Save",
                variant: "success",
                isDisabled: isUpdating,
                isLoading: isUpdating,
                onClick: () => {
                  updateDocument(
                    {
                      data: {
                        id: item_id as string,
                        content: editorData.content,
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
      {mentionPosition ? (
        <div
          className={`absolute fade-in-30 ${
            mentionPosition === "above" ? "top-48" : "bottom-10"
          } left-1/2 animate-bounce text-green-400 duration-700`}>
          <Icon
            fontSize={48}
            icon={mentionPosition === "above" ? IconEnum.chevron_up : IconEnum.chevron_down}
            thickness="bold"
          />
        </div>
      ) : null}

      {/* @ts-ignore */}
      <Remirror
        editable={canUpdate}
        hooks={documentEditorHooks(changedData, resetChanges, refetch)}
        initialContent={state}
        manager={manager}
        onChange={(params) => {
          if (params.firstRender) {
            return;
          }
          if (params?.tr?.docChanged && !params.tr.getMeta("tableColumnResizing$1") && !params.tr.getMeta("commands$1"))
            handleChange({ name: "content", value: params.state.toJSON()?.doc });
        }}>
        <SlashMenu />

        <div
          className="relative flex h-full max-w-full flex-1 flex-col overflow-y-auto rounded border border-zinc-800 py-0"
          id="editor">
          {canUpdate ? (
            <Menubar
              icon={currentDocument?.data?.icon ?? undefined}
              id={currentDocument?.data?.id || ""}
              size="md"
              title={currentDocument?.data?.title || ""}
            />
          ) : null}
          <div
            className="relative flex h-full w-full flex-col content-start focus-visible:outline-none"
            onContextMenu={canUpdate ? (e) => getContextActions(e) : undefined}
            onDrop={
              canUpdate
                ? (e) => {
                    const stringData = e.dataTransfer.getData("Text");
                    if (!stringData) return;
                    if (stringData) {
                      const data: { index: number; title: string; description?: string } = JSON.parse(
                        e.dataTransfer.getData("Text"),
                      );
                      if (!data) return;
                      getContext()?.commands.insertText(`${data.title}: ${data?.description}`);
                    }
                  }
                : undefined
            }>
            <EditorComponent />
            <MentionDropdownComponent />
          </div>
        </div>
      </Remirror>
    </div>
  );
}
