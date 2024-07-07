import "remirror/styles/all.css";
import "../../Editor.css";

import { EditorComponent, Remirror, useRemirror } from "@remirror/react";
import { QueryClient, UseMutateFunction, useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import { Navigate, useBlocker, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { Icon, MentionDropdownComponent, Menubar, Skeleton, SlashMenu } from "../../components";
import { useGetEntities, useGetEntity, useHandleChange, useHasPermissions, useNavbarTitle, useUpdateEntity } from "../../hooks";
import { DocumentType, WebhookType } from "../../types";
import {
  AvailableIcons,
  baseURLS,
  breadcrumbsAtom,
  contextMenuAtom,
  DefaultEditorExtensions,
  DefaultTagColor,
  Dice,
  documentEditorHooks,
  drawerAtom,
  FetchFunction,
  hasActionPermission,
  hasEntityUpdatePermissionForEntityView,
  IconEnum,
  isProjectOwnerAtom,
  mentionPositionAtom,
  onError,
  useNotifications,
  userAtom,
} from "../../utils";

type UpdateDocumentType = UseMutateFunction<
  any,
  unknown,
  {
    data: {
      id: string;
      content: string | undefined;
    };
  },
  | {
      old: unknown;
    }
  | {
      old?: undefined;
    }
>;

function update({
  item_id,
  queryClient,
  resetChanges,
  editorData,
  updateDocument,
}: {
  item_id: string;
  queryClient: QueryClient;
  resetChanges: () => void;
  editorData: RemirrorJSON;
  updateDocument: UpdateDocumentType;
}) {
  updateDocument(
    {
      data: {
        id: item_id as string,
        content: editorData.content as string | undefined,
      },
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["documents", item_id, "mention"]);
        resetChanges();
      },
    }
  );
}

export function DocumentView({ editable }: { editable: boolean }) {
  const { item_id } = useParams();
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);

  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);

  const {
    data: currentDocument,
    isFetching,
    refetch,
  } = useGetEntity<DocumentType>(
    item_id as string,
    "documents",
    {
      fields: ["id", "title", "icon", "content", "is_folder", "is_template", "dice_color", "owner_id"],
      relations: {
        parents: true,
      },
      permissions: true,
    },

    {
      enabled: !!editable && !!item_id,
      staleTime: 1000,
      queryKeyConcat: ["content"],
    }
  );
  useNavbarTitle(`Documents | ${currentDocument?.data?.title}`, !!currentDocument?.data?.title);
  const setEntityUpdatePermission = useSetAtom(hasEntityUpdatePermissionForEntityView);

  const permissions = useHasPermissions(["update_documents"], currentDocument?.data?.owner_id);
  const can_update = hasActionPermission(
    isProjectOwner,
    user?.id === currentDocument?.data?.owner_id,
    permissions,
    currentDocument?.data?.permissions || [],
    "update_documents",
    user?.role?.id
  );

  useEffect(() => {
    if (!isFetching) {
      if (currentDocument?.data) {
        setBreadcrumbs({ items: currentDocument?.data?.parents || [], type: "documents" });
        setEntityUpdatePermission(currentDocument?.data?.permissions?.some((p) => p.code === "update_documents") || false);
        if (currentDocument?.data?.dice_color) {
          Dice.updateConfig({ themeColor: currentDocument?.data?.dice_color });
        } else {
          const defaultDiceColor: string | null = ls.get("default_dice_color");
          Dice.updateConfig({ themeColor: defaultDiceColor || DefaultTagColor });
        }
      }
    }
  }, [currentDocument]);

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
  if (currentDocument?.data)
    return (
      <DocumentViewEditor
        can_update={can_update}
        content={currentDocument.data.content as RemirrorJSON | undefined}
        icon={currentDocument.data.icon}
        id={currentDocument.data.id}
        is_template={currentDocument.data.is_template}
        refetch={refetch}
        title={currentDocument.data.title}
      />
    );

  return null;
}

function DocumentViewEditor({
  id,
  title,
  icon,
  can_update,
  content,
  is_template,
  refetch,
}: {
  id: string;
  title: string;
  icon: AvailableIcons | undefined | null;
  can_update: boolean;
  is_template: boolean | null;
  content: RemirrorJSON | undefined;
  refetch: () => void;
}) {
  const { project_id, item_id } = useParams();
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  const drawer = useAtomValue(drawerAtom);
  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const mentionPosition = useAtomValue(mentionPositionAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const { data: webhooks } = useGetEntities<WebhookType>({ data: { user_id: user?.id }, fields: ["id", "title"] }, "webhooks", {
    enabled: !!user?.id && isProjectOwner,
    staleTime: Infinity,
  });

  const { mutate: updateDocument, isLoading: isMutating } = useUpdateEntity<{
    data: { id: string; content: string | undefined };
  }>("documents", project_id as string, {
    mutationKey: ["document_view", "update"],
  });

  const [editorData, setEditorData] = useState<RemirrorJSON>({ content: content as RemirrorJSON[] | undefined, type: "doc" });

  const { manager, state, getContext } = useRemirror({
    extensions: () => DefaultEditorExtensions(createNotification),
    selection: "start",
    onError,
    content,
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
                    data: { title, description: title, type: "document_text" },
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
      const response = !window.confirm("You have unsaved changes, are you sure you want to leave?");
      if (!response) queryClient.removeQueries({ queryKey: ["documents", item_id] });

      return response;
    }
    queryClient.removeQueries({ queryKey: ["documents", item_id] });
    return false;
  });

  useEffect(() => {
    if (!drawer.type) {
      getContext()?.commands.setAnnotations([]);
    }
  }, [drawer.type]);

  useEffect(() => {
    if (changedData) {
      const timeout = setTimeout(() => {
        if (editorData?.content || editorData === undefined) {
          update({ item_id: item_id as string, queryClient, resetChanges, updateDocument, editorData });
        }
      }, 800);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [editorData]);

  return (
    <div className="mx-auto h-[calc(100%-3rem)] max-h-full w-full max-w-full rounded bg-zinc-800 lg:max-w-5xl">
      {mentionPosition ? (
        <div
          className={`fade-in-30 absolute ${
            mentionPosition === "above" ? "top-48" : "bottom-10"
          } left-1/2 animate-bounce text-green-400 duration-700`}>
          <Icon
            fontSize={48}
            icon={mentionPosition === "above" ? IconEnum.chevron_up : IconEnum.chevron_down}
            thickness="bold"
          />
        </div>
      ) : null}

      <Remirror
        editable={can_update}
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
          {can_update ? (
            <Menubar
              hasChanges={!!changedData}
              icon={icon ?? undefined}
              id={id || ""}
              isMutating={isMutating}
              isTemplate={!!is_template}
              size="md"
              title={title || ""}
            />
          ) : null}
          <div
            className="relative flex h-full w-full max-w-full flex-col content-start focus-visible:outline-none"
            onContextMenu={can_update ? (e) => getContextActions(e) : undefined}
            onDrop={
              can_update
                ? (e) => {
                    const stringData = e.dataTransfer.getData("Text");
                    if (!stringData) return;
                    if (stringData) {
                      const data: { index: number; title: string; description?: string } = JSON.parse(
                        e.dataTransfer.getData("Text")
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

