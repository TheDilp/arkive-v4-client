import "remirror/styles/all.css";
import "../../Editor.css";

import { EditorComponent, Remirror, useRemirror, useRemirrorContext } from "@remirror/react";
import { QueryClient, UseMutateFunction, useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { MouseEvent, MutableRefObject, useEffect, useRef, useState } from "react";
import { Navigate, useBlocker, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { findChildrenByNode, findElementAtPosition, RemirrorJSON } from "remirror";

import { Button, Icon, MentionDropdownComponent, Menubar, Skeleton, SlashMenu } from "../../components";
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

export function DocumentView({ editable, isPreview, data }: { editable: boolean; isPreview?: boolean; data?: DocumentType }) {
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
      enabled: !!editable && !!item_id && !data,
      staleTime: 1000,
      queryKeyConcat: ["content"],
    }
  );
  useNavbarTitle(`Documents | ${currentDocument?.data?.title}`, !!currentDocument?.data?.title);
  const setEntityUpdatePermission = useSetAtom(hasEntityUpdatePermissionForEntityView);

  const permissions = useHasPermissions(["update_documents"], currentDocument?.data?.owner_id || data?.owner_id);
  const canUpdate = hasActionPermission(
    isProjectOwner,
    user?.id === currentDocument?.data?.owner_id || user?.id === data?.owner_id,
    permissions,
    currentDocument?.data?.permissions || data?.permissions || [],
    "update_documents",
    user?.role?.id
  );

  useEffect(() => {
    if (!isFetching && !isPreview) {
      if (currentDocument?.data || data) {
        setBreadcrumbs({ items: currentDocument?.data?.parents || [], type: "documents" });
        setEntityUpdatePermission(
          (currentDocument?.data?.permissions || data?.permissions)?.some((p) => p.code === "update_documents") || false
        );
        if (currentDocument?.data?.dice_color) {
          Dice.updateConfig({ themeColor: currentDocument?.data?.dice_color });
        } else {
          const defaultDiceColor: string | null = ls.get("default_dice_color");
          Dice.updateConfig({ themeColor: defaultDiceColor || DefaultTagColor });
        }
      }
    }
  }, [currentDocument, data]);

  if (isFetching)
    return (
      <div className="max-h-full min-h-full w-full">
        <Skeleton type="editor" />
      </div>
    );
  if (!currentDocument && !data && !isFetching) {
    return <Navigate to="../" />;
  }
  if (currentDocument?.data?.is_folder || data?.is_folder) {
    return <Navigate to={`../folder/${currentDocument?.data?.id}`} />;
  }

  if (currentDocument?.data || data?.content)
    return (
      <DocumentViewEditor
        canUpdate={canUpdate}
        content={(currentDocument?.data?.content || data?.content) as RemirrorJSON | undefined}
        hasNoOutline={!!data}
        icon={currentDocument?.data.icon || data?.icon}
        id={(currentDocument?.data.id || data?.id) as string}
        is_template={!!(currentDocument?.data.is_template || data?.is_template)}
        refetch={refetch}
        title={(currentDocument?.data.title || data?.title) as string}
      />
    );

  return null;
}

function DocumentContent({ canUpdate }: { canUpdate: boolean }) {
  const createNotification = useNotifications();

  const setContextMenu = useSetAtom(contextMenuAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const getContext = useRemirrorContext();

  const { data: webhooks } = useGetEntities<WebhookType>({ data: { user_id: user?.id }, fields: ["id", "title"] }, "webhooks", {
    enabled: !!user?.id && isProjectOwner,
    staleTime: Infinity,
  });
  function getContextActions(e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {
    e.preventDefault();

    const slice = getContext?.getState().selection.content();
    let title = "";

    if (slice) {
      slice.content.descendants((node) => {
        if (node.type.name === "mentionAtom") {
          title += node.attrs.label;
        } else if (node.type.name === "text") {
          title += node.textContent;
        }
      });

      title = title.trim();
      if (title.length > 250) {
        return;
      }
    }

    setContextMenu({
      // @ts-ignore
      event: e,
      items: [
        {
          id: "create_entity",
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
                  exceptions: { mention: true },
                  title: "Create character",
                  data: {
                    title,
                    getContext: getContext || undefined,
                  },
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
                  exceptions: { mention: true },
                  title: "Create blueprint instance",
                  data: { title, getContext: getContext || undefined },
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
                  exceptions: { mention: true, globalCreate: true },
                  title: "Create document",
                  data: { title, getContext: getContext || undefined },
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
                  exceptions: { mention: true, globalCreate: true },
                  title: "Create map",
                  data: { title, getContext: getContext || undefined },
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
                  exceptions: { mention: true, globalCreate: true },
                  data: { title, getContext: getContext || undefined },
                  type: "graphs",
                })),
            },
            {
              id: "3f",
              title: "Event",
              icon: IconEnum.event,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  title: "Create event",
                  exceptions: { mention: true, globalCreate: true },
                  data: { title, getContext: getContext || undefined },
                  type: "events",
                })),
            },
            {
              id: "3g",
              title: "Word",
              icon: IconEnum.word,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  title: "Create word",
                  exceptions: { mention: true, globalCreate: true },
                  data: { title, getContext: getContext || undefined },
                  type: "words",
                })),
            },
          ],
        },
        {
          id: "send_to_discord",
          title: "Send text to Discord",
          icon: IconEnum.discord,
          allowedPlacements: ["left", "right"],
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
  }
  const location = useLocation();

  useEffect(() => {
    if (location?.hash?.length) {
      const headingHashTitle = decodeURIComponent(location.hash.replace("#", ""));

      const headingNodes = findChildrenByNode({
        node: getContext.getState().doc,
        type: getContext.getState().schema.nodes.heading,
      });

      if (headingNodes.length) {
        for (let index = 0; index < headingNodes.length; index++) {
          const heading = headingNodes[index];
          if (!heading.node.textContent.length) return;
          if (heading.node.textContent.trim().toLowerCase() === headingHashTitle.trim().toLowerCase()) {
            const domN = findElementAtPosition(heading.pos, getContext.view);
            if (domN) {
              domN.scrollIntoView({ behavior: "smooth", block: "center", inline: "end" });
            }
          }
        }
      }
    }
  }, []);
  return (
    <div
      className="relative flex h-full w-full max-w-full flex-col content-start focus-visible:outline-none"
      onContextMenu={canUpdate ? (e) => getContextActions(e) : undefined}
      onDrop={
        canUpdate
          ? (e) => {
              const stringData = e.dataTransfer.getData("Text");
              if (!stringData) return;
              if (stringData) {
                const data: { index: number; title: string; description?: string } = JSON.parse(e.dataTransfer.getData("Text"));
                if (!data) return;
                getContext?.commands.insertText(`${data.title}: ${data?.description}`);
              }
            }
          : undefined
      }>
      <EditorComponent />
      <MentionDropdownComponent />
    </div>
  );
}

function DocumentViewEditor({
  id,
  title,
  icon,
  canUpdate,
  content,
  is_template,
  hasNoOutline,
  refetch,
}: {
  id: string;
  title: string;
  icon: AvailableIcons | undefined | null;
  canUpdate: boolean;
  is_template: boolean | null;
  hasNoOutline: boolean;
  content: RemirrorJSON | undefined;
  refetch: () => void;
}) {
  const { project_id, item_id } = useParams();
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  const drawer = useAtomValue(drawerAtom);
  const mentionPosition = useAtomValue(mentionPositionAtom);
  const editorRef = useRef() as MutableRefObject<HTMLDivElement>;

  const handlePrint = useReactToPrint({
    contentRef: editorRef,
    documentTitle: title,
  });

  const { mutate: updateDocument, isLoading: isMutating } = useUpdateEntity<{
    data: { id: string; content: string | undefined };
  }>("documents", project_id as string, {
    mutationKey: ["document_view", "update"],
  });
  const [searchParams] = useSearchParams();

  const [uiOptions, setUIOptions] = useState({ outline: false, comments: false });

  const [editorData, setEditorData] = useState<RemirrorJSON>({ content: content as RemirrorJSON[] | undefined, type: "doc" });
  const { manager, state, getContext } = useRemirror({
    extensions: () => DefaultEditorExtensions(createNotification),
    selection: "start",
    onError,
    content,
  });

  const headings: { id: string; title: string; level: number }[] = [];
  manager.view?.state?.doc.forEach((n) => {
    if (n.type.name === "heading" && n.textContent) {
      headings.push({ id: n.attrs.id, title: n.textContent, level: n.attrs.level });
    }
  });

  const { changedData, resetChanges, handleChange } = useHandleChange({ data: editorData, setData: setEditorData });

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
      const annotations = getContext()?.helpers?.getAnnotations() || [];
      getContext()?.commands.setAnnotations(annotations);
    }
  }, [drawer.type]);

  useEffect(() => {
    if (changedData) {
      const timeout = setTimeout(() => {
        if (editorData?.content || editorData === undefined) {
          update({ item_id: id, queryClient, resetChanges, updateDocument, editorData });
        }
      }, 800);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [editorData]);

  useEffect(() => {
    const heading = searchParams.get("heading");
    if (heading) {
      const el = document.getElementById(heading);
      if (el) {
        const editor = document.getElementById("editor");
        if (editor) editor.scrollTo({ top: el.offsetTop, behavior: "smooth" });
      }
    }
  }, [searchParams]);

  return (
    <div className={`grid ${hasNoOutline ? "h-full" : "h-[calc(100%-4rem)]"} w-full grid-cols-6 items-start justify-start`}>
      {hasNoOutline ? null : (
        <div className="col-span-1 h-full max-h-full">
          <ul
            className={`h-full rounded-l p-2 ${uiOptions.outline ? "bg-zinc-900" : "w-[4.5rem] overflow-hidden rounded-r"} transition-all`}>
            <li className="relative mb-2 mr-auto flex w-full items-center justify-between">
              <div className="absolute top-0 w-14">
                <Button
                  icon={uiOptions.outline ? IconEnum.chevron_left : IconEnum.chevron_right}
                  onClick={() => setUIOptions((prev) => ({ ...prev, outline: !prev.outline }))}
                />
              </div>
              <h2 className={`mx-auto text-lg font-semibold ${uiOptions?.outline ? "" : "hidden"}`}>Outline</h2>
            </li>
            {headings.map((h) => (
              <li
                key={h.id}
                className={`cursor-pointer hover:text-blue-400 ${uiOptions.outline ? "" : "hidden"}`}
                onClick={() => {
                  const el = document.getElementById(h.id);
                  if (el) {
                    const editor = document.getElementById("editor");
                    if (editor) editor.scrollTo({ top: el.offsetTop, behavior: "smooth" });
                  }
                }}
                style={{
                  paddingLeft: `${0.45 * (h.level - 1)}rem`,
                }}>
                <div className="flex items-center justify-between">
                  <span>{h.title}</span>
                  <div>
                    <Button
                      icon={IconEnum.link}
                      iconSize={14}
                      isIconOnly
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const url = new URL(window.location.href);
                        url.searchParams.set("heading", h.id);
                        window.navigator.clipboard.writeText(url.toString());
                        createNotification({
                          title: "Link to heading copied.",
                          variant: "info",
                          icon: IconEnum.link,
                          timer: 2,
                        });
                      }}
                      size="sm"
                    />
                  </div>
                </div>
                {h.level === 1 ? <hr className="w-full border-zinc-600" /> : null}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div ref={editorRef} className={`${hasNoOutline ? "col-span-6" : "col-span-4"} h-full max-h-full overflow-hidden`}>
        <div className="h-full w-full rounded-t bg-zinc-800">
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
                  handlePrint={handlePrint}
                  hasChanges={!!changedData}
                  icon={icon ?? undefined}
                  id={id || ""}
                  isMutating={isMutating}
                  isTemplate={!!is_template}
                  size="md"
                  title={title || ""}
                />
              ) : null}
              <DocumentContent canUpdate={canUpdate} />
            </div>
          </Remirror>
        </div>
      </div>
    </div>
  );
}
