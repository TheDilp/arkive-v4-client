import { QueryClient, UseMutateAsyncFunction, useQueryClient } from "@tanstack/react-query";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import groupBy from "lodash.groupby";
import { Dispatch, useEffect, useMemo, useState } from "react";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import {
  AdditionalFieldDisplay,
  Alert,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Collapsible,
  createColumnHelper,
  Dropdown,
  Gallery,
  Icon,
  Skeleton,
  StaticRender,
  Table,
  Tabs,
} from "../../components";
import {
  useDownloadImages,
  useGenerateDocument,
  useGetEntities,
  useGetEntity,
  useHasPermissions,
  useNavbarTitle,
  useRemoveFromEntity,
  useTable,
  useUpdateManyPublic,
} from "../../hooks";
import {
  CharacterFieldTemplateType,
  CharacterLocationType,
  CharacterType,
  ConversationType,
  DialogAtomType,
  DocumentType,
  DrawerAtomType,
  EventType,
  FormattedRelationship,
  ImageType,
  MapType,
  WebhookType,
} from "../../types";
import {
  baseURLS,
  dialogAtom,
  drawerAtom,
  FetchFunction,
  getAvatarInitials,
  getCharacterFullName,
  getCharacterProfileTabFromType,
  getDefaultEntityIcon,
  getEntityLink,
  getFirstLetters,
  getImageURL,
  getSentenceCase,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  openPublicPage,
  sortCharactersByName,
  userAtom,
} from "../../utils";
import { RemoveFromCharacterSchema } from "../../validation";
import { ConversationView } from ".";

const relationshipColumnHelper = createColumnHelper<FormattedRelationship>();
const documentsColumnHelper = createColumnHelper<DocumentType>();
const eventsColumnHelper = createColumnHelper<EventType>();
const locationsColumnHelper = createColumnHelper<MapType>();
const assetColumnHelper = createColumnHelper<ImageType>();
const conversationColumnHelper = createColumnHelper<ConversationType>();

type GenerateDocumentType = UseMutateAsyncFunction<
  {
    data: {
      id: string;
    };
  },
  unknown,
  {
    data: {
      title: string;
      project_id: string;
      parent_id?: string;
      content?: string;
    };
  },
  unknown
>;

const tabs = [
  { id: "0", label: "Biography", icon: IS_PUBLIC ? null : IconEnum.biography },
  { id: "1", label: "Additional fields", icon: IS_PUBLIC ? null : IconEnum.additional_fields },
  { id: "2", label: "Relationships", icon: IS_PUBLIC ? null : IconEnum.family_tree },
  { id: "3", label: "Resources", icon: IS_PUBLIC ? null : IconEnum.document },
  { id: "4", label: "Conversations", icon: IS_PUBLIC ? null : IconEnum.conversation },
];

function relationshipTableColumns(
  project_id: string,
  navigate: NavigateFunction,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  isPreview?: boolean
) {
  return [
    relationshipColumnHelper.display({
      id: "portrait_id",
      header: "Portrait",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            image={getImageURL(project_id, "images", row.original?.portrait?.id || "")}
            initials={getAvatarInitials(row.original.full_name || "")}
            isBordered
            isTooltipDisabled
            label={getCharacterFullName(row.original.full_name || "")}
            size="sm"
          />
        </div>
      ),
      meta: {
        pinned: true,
        centered: true,
      },
      minSize: 5,
      maxSize: 5,
    }),
    relationshipColumnHelper.display({
      id: "Name",
      header: "Name",
      cell: ({ row }) => row.original.full_name,
      meta: {
        pinned: true,
      },
      minSize: 15,
    }),
    relationshipColumnHelper.display({
      id: "relation_type",
      header: "Relations",
      cell: ({ row }) => (
        <div className="truncate">
          {(row?.original?.relationships || [])
            .map((rel) => {
              return rel?.relation_title
                ? `${getSentenceCase(rel?.relation_title || "")} ${
                    rel?.relation_type_title ? `(${rel?.relation_type_title || ""})` : ""
                  }`
                : getSentenceCase(rel?.relation_type_title || "");
            })
            .join(",")}
        </div>
      ),
      minSize: 20,
      maxSize: 20,
    }),
    relationshipColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "1",
                title: `${!row.getIsExpanded() ? "Show" : "Hide"} all relations`,
                onClick: row.getToggleExpandedHandler(),
                icon: IconEnum.family_tree,
              },
              {
                id: "2",
                title: `Preview profile of ${row.original.full_name}`,
                icon: IconEnum.eye,
                onClick: () =>
                  setDrawer((prev) => ({
                    ...prev,
                    title: "Preview character",
                    data: { id: row.original.id, entity_type: "characters" },
                    type: "entity_preview",
                    size: "half",
                  })),
              },
              {
                id: "3",
                title: `View profile of ${row.original.full_name}`,
                icon: IconEnum.character,
                onClick: isPreview
                  ? () => {}
                  : () => navigate(`/projects/${project_id}/characters/${row.original.id}/biography`),
              },
              {
                id: "4",
                title: `View conversations of ${row.original.full_name}`,
                icon: IconEnum.conversation,
                onClick: () =>
                  isPreview ? () => {} : navigate(`/projects/${project_id}/characters/${row.original.id}/conversations`),
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
      minSize: 5,
      maxSize: 5,
    }),
  ];
}
function disableShowRelationshipTree(character: CharacterType | undefined) {
  if (!character) return true;
  if (!character?.related_from?.length && !character?.related_to?.length && !character?.related_other?.length) return true;
  return false;
}
function documentsTableColumns(
  removeItem: UseMutateAsyncFunction<
    any,
    unknown,
    { relations: { [key: string]: { id: string }[] } } | { data: { [key: string]: string[] } },
    unknown
  >,
  updatePublic: UseMutateAsyncFunction<
    any,
    unknown,
    {
      data: {
        ids: string[];
        is_public: boolean;
      };
    },
    unknown
  >,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  queryClient: QueryClient,
  project_id: string,
  character_id: string
) {
  return [
    documentsColumnHelper.display({
      id: "image_id",
      header: "",
      meta: {
        centered: true,
      },
      cell: ({ row }) =>
        "image_id" in row.original && row.original?.image_id ? (
          <Avatar
            image={getImageURL(project_id, "images", (row.original?.image_id as string) || "")}
            isBordered
            isTooltipDisabled
            size="sm"
          />
        ) : (
          <Icon fontSize={24} icon={row.original.is_folder ? IconEnum.folder : getDefaultEntityIcon("documents")} />
        ),
      minSize: 3.25,
      maxSize: 3.25,
    }),
    documentsColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => <div className="w-full max-w-full truncate">{row.original.title}</div>,
    }),
    documentsColumnHelper.display({
      id: "is_public",
      header: "",
      meta: {
        centered: true,
        noLink: true,
      },
      cell: ({ row }) => (
        <Button
          hasNoBackground
          icon={row.original.is_public ? IconEnum.eye : IconEnum.eye_slash}
          isIconOnly
          onClick={async () => {
            await updatePublic({ data: { ids: [row.original.id], is_public: !row.original.is_public } });
            queryClient.setQueryData<{ data: CharacterType }>(["characters", character_id], (old) => {
              if (!old) return old;
              return {
                ...old,
                data: {
                  ...old.data,
                  documents: (old.data.documents || [])?.map((doc) => {
                    if (doc.id === row.original.id) return { ...doc, is_public: !row.original.is_public };
                    return doc;
                  }),
                },
              };
            });
          }}
        />
      ),
      minSize: 3.25,
      maxSize: 3.25,
    }),

    documentsColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "preview",
                title: "Preview content",
                icon: IconEnum.document,
                onClick: () =>
                  setDrawer((prev) => ({
                    ...prev,
                    data: {
                      id: row.original.id,
                      entity_type: "documents",
                    },
                    title: "Preview document",
                    type: "entity_preview",
                    size: "half",
                  })),
              },
              {
                id: "2",
                title: "Remove document",
                icon: IconEnum.trash,
                onClick: async () => {
                  await removeItem({ relations: { documents: [{ id: row.original.id }] } });
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
function eventsTableColumns(
  updatePublic: UseMutateAsyncFunction<
    any,
    unknown,
    {
      data: {
        ids: string[];
        is_public: boolean;
      };
    },
    unknown
  >,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  queryClient: QueryClient,
  project_id: string,
  character_id: string
) {
  return [
    eventsColumnHelper.display({
      id: "image_id",
      header: "",
      meta: {
        centered: true,
      },
      cell: ({ row }) =>
        "image_id" in row.original && row.original?.image_id ? (
          <Avatar
            image={getImageURL(project_id, "images", (row.original?.image_id as string) || "")}
            isBordered
            isTooltipDisabled
            size="sm"
          />
        ) : (
          <Icon fontSize={24} icon={getDefaultEntityIcon("events")} />
        ),
      minSize: 3.25,
      maxSize: 3.25,
    }),
    eventsColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => <div className="w-full max-w-full truncate">{row.original.title}</div>,
    }),
    eventsColumnHelper.display({
      id: "is_public",
      header: "",
      meta: {
        centered: true,
        noLink: true,
      },
      cell: ({ row }) => (
        <Button
          hasNoBackground
          icon={row.original.is_public ? IconEnum.eye : IconEnum.eye_slash}
          isIconOnly
          onClick={async () => {
            await updatePublic({ data: { ids: [row.original.id], is_public: !row.original.is_public } });
            queryClient.setQueryData<{ data: CharacterType }>(["characters", character_id], (old) => {
              if (!old) return old;
              return {
                ...old,
                data: {
                  ...old.data,
                  events: (old.data.events || [])?.map((event) => {
                    if (event.id === row.original.id) return { ...event, is_public: !row.original.is_public };
                    return event;
                  }),
                },
              };
            });
          }}
        />
      ),
      minSize: 3.25,
      maxSize: 3.25,
    }),

    eventsColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "preview",
                title: "Preview content",
                icon: IconEnum.event,
                onClick: () =>
                  setDrawer((prev) => ({
                    ...prev,
                    data: {
                      id: row.original.id,
                      parent_id: row.original.parent_id || undefined,
                      entity_type: "events",
                      isReadOnly: true,
                    },
                    title: "Preview event",
                    type: "entity_preview",
                    size: "half",
                  })),
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
function locationsTableColumns(project_id: string) {
  return [
    locationsColumnHelper.display({
      id: "image_id",
      header: "Image",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            image={getImageURL(project_id, "map_images", row.original.image_id)}
            isTooltipDisabled
            label={row.original.title}
            size="sm"
          />
        </div>
      ),
      minSize: 5,
      maxSize: 5,
      meta: {
        centered: true,
      },
    }),
    locationsColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => <div className="w-full max-w-full truncate">{row.original.title}</div>,
    }),
  ];
}
function assetTableColumns(
  downloadImages: UseMutateAsyncFunction<
    {
      data: (string | null)[];
    },
    unknown,
    {
      data: {
        id: string;
        title: string;
      }[];
    },
    unknown
  >,
  project_id: string | undefined,
  removeItem: UseMutateAsyncFunction<
    any,
    unknown,
    | {
        relations: {
          [key: string]: {
            id: string;
          }[];
        };
      }
    | { data: { [key: string]: string[] } },
    unknown
  >,
  webhooks: WebhookType[],
  updatePublic: UseMutateAsyncFunction<
    any,
    unknown,
    {
      data: {
        ids: string[];
        is_public: boolean;
      };
    },
    unknown
  >,
  queryClient: QueryClient,
  character_id: string
) {
  return [
    assetColumnHelper.display({
      id: "id",
      header: "Image",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            hasShowImage
            image={getImageURL(project_id as string, "images", row.original?.id || "")}
            isBordered
            isTooltipDisabled
            label={getAvatarInitials(row.original.title)}
            size="sm"
          />
        </div>
      ),
      meta: {
        noLink: true,
        centered: true,
      },
      minSize: 4.5,
      maxSize: 4.5,
    }),
    assetColumnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
    }),
    assetColumnHelper.display({
      id: "is_public",
      header: "",
      meta: {
        centered: true,
        noLink: true,
      },
      cell: ({ row }) => (
        <Button
          hasNoBackground
          icon={row.original.is_public ? IconEnum.eye : IconEnum.eye_slash}
          isIconOnly
          onClick={async () => {
            await updatePublic({ data: { ids: [row.original.id], is_public: !row.original.is_public } });
            queryClient.setQueryData<{ data: CharacterType }>(["characters", character_id], (old) => {
              if (!old) return old;
              return {
                ...old,
                data: {
                  ...old.data,
                  images: (old.data.images || [])?.map((image) => {
                    if (image.id === row.original.id) return { ...image, is_public: !row.original.is_public };
                    return image;
                  }),
                },
              };
            });
          }}
        />
      ),
      minSize: 3.25,
      maxSize: 3.25,
    }),
    assetColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "download_image",
                title: "Download",
                icon: IconEnum.download,
                onClick: () => downloadImages({ data: [row.original] }),
              },
              {
                id: "send_to_discord",
                title: "Send to Discord",
                icon: IconEnum.discord,
                subItems: webhooks.map((webhook) => ({
                  id: webhook.id,
                  title: webhook.title,
                  onClick: () =>
                    FetchFunction({
                      url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                      body: JSON.stringify({
                        data: { id: row.original.id, type: "image" },
                      }),
                      method: "POST",
                    }),
                })),
              },
              {
                id: "delete_image",
                title: "Remove image",
                icon: IconEnum.trash,
                onClick: async () => {
                  const parsedData = RemoveFromCharacterSchema.parse({
                    relations: { images: [{ id: row.original.id }] },
                  });
                  await removeItem(parsedData);
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
function conversationTableColumns(
  project_id: string,
  item_id: string,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  generateDocument: GenerateDocumentType
) {
  return [
    conversationColumnHelper.display({
      id: "characters",
      header: "Members",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          {row.original.characters.map((char) => (
            <div className="-ml-4 first:ml-0" key={char.id}>
              <Avatar
                image={getImageURL(project_id, "images", char?.portrait_id || "")}
                initials={getAvatarInitials(char?.full_name || "")}
                isBordered
                isTooltipDisabled
                label={getCharacterFullName(char?.full_name || "")}
                size="sm"
              />
            </div>
          ))}
        </div>
      ),
      minSize: 6,
      maxSize: 6,
    }),
    conversationColumnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => row.original.title,
      // minSize: 15,
      // maxSize: 15,
    }),
    conversationColumnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "edit_conversation",
                title: "Edit conversation",
                icon: IconEnum.edit,
                onClick: () => {
                  const char = row.original.characters.find((c) => c.id === item_id);
                  if (char) {
                    setDrawer((prev) => {
                      if (char.full_name) {
                        return {
                          ...prev,
                          data: {
                            character: { full_name: char.full_name, id: char.id, portrait_id: char.portrait_id },
                            conversation_id: row.original.id,
                          },
                          title: `Edit conversation - ${row.original.title}`,
                          type: "conversations",
                        };
                      }
                      return prev;
                    });
                  }
                },
              },
              {
                id: "generate_document",
                title: "Create document from conversation",
                icon: IconEnum.document,
                onClick: async () => {
                  await generateDocument({
                    data: {
                      title: row.original.title,
                      parent_id: row.original.id,
                      project_id,
                    },
                  });
                },
              },
              {
                id: "delete_conversation",
                title: "Delete conversation",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "conversations",
                    },
                    title: "Delete conversation",
                    size: "sm",
                    isOverlay: true,
                    type: "delete_entity",
                  }));
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
      minSize: 5,
      maxSize: 5,
    }),
  ];
}

export function CharacterProfileView({
  id,
  isPreview,
  isViewOnly,
}: {
  id?: string;
  isPreview?: boolean;
  isViewOnly?: boolean;
}) {
  const { project_id, item_id, type, subitem_id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(getCharacterProfileTabFromType(type));
  const [assetView, setAssetView] = useState<"table" | "card">("table");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(
    ["read_characters", "create_characters", "update_characters", "delete_characters"],
    undefined
  );
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const {
    data: existingCharacter,
    isLoading,
    isFetching,
  } = useGetEntity<CharacterType>(
    id || item_id,
    "characters",
    {
      relations: {
        tags: true,
        character_fields: true,
        locations: true,
        relationships: true,
        character_relationship_types: true,
        documents: true,
        images: true,
        events: true,
        portrait: true,
      },
      fields: ["id", "full_name", "nickname", "age", "biography", "is_public", "owner_id"],
      permissions: true,
    },
    {
      staleTime: 60 * 1000,
    }
  );
  const { mutateAsync: downloadImages } = useDownloadImages(project_id, "images");
  const { mutateAsync: updateDocumentsPublic } = useUpdateManyPublic("documents", project_id as string);
  const { mutateAsync: updateImagesPublic } = useUpdateManyPublic("images", project_id as string);
  const { mutateAsync: updateEventsPublic } = useUpdateManyPublic("events", project_id as string);

  const { mutateAsync: removeItem } = useRemoveFromEntity("characters", item_id as string, project_id as string);
  const { mutateAsync: generateDocument } = useGenerateDocument("conversations");
  const relationships = [
    ...(existingCharacter?.data?.related_to || []),
    ...(existingCharacter?.data?.related_from || []),
    ...(existingCharacter?.data?.related_other || []),
  ].filter((r) => !!r);

  useNavbarTitle(`Characters | ${existingCharacter?.data?.full_name}`, !!existingCharacter?.data);

  const [, dispatch] = useTable({});

  const { data: existingTemplates, isFetching: isFetchingTemplates } = useGetEntities<CharacterFieldTemplateType>(
    {
      data: { project_id },
      fields: ["id", "title"],
      relations: { character_fields: true },
      relationFilters: {
        or: (existingCharacter?.data?.tags || [])?.map((t) => ({
          id: "tags",
          header_name: "Tags",
          operator: "in",
          value: t.id,
          relationalData: { blueprint_field_id: "tags" },
          field: "tags",
        })),
      },
    },
    "character_fields_templates",
    { enabled: tabs[selectedTab].id === "1" && !!existingCharacter?.data?.tags?.length, staleTime: 5 * 60 * 1000 }
  );
  const { data: existingConversations, isFetching: isLoadingConversations } = useGetEntities<ConversationType>(
    {
      data: {
        character_id: existingCharacter?.data?.id,
        project_id,
      },
      fields: ["id", "title"],
      relations: {
        characters: true,
      },
    },
    "conversations",
    { enabled: selectedTab === 4 && !!existingCharacter?.data, queryKeyConcat: [item_id as string] }
  );
  function showRelationshipTree() {
    if (existingCharacter?.data)
      setDialog({
        type: "family_tree",
        title: `Family tree of ${existingCharacter?.data.full_name || ""}`,
        data: { id: existingCharacter?.data.id },
        size: "lg",
        isOverlay: true,
      });
  }
  function openAddDocumentDrawer() {
    if (existingCharacter?.data?.id) {
      setDrawer((prev) => ({
        ...prev,
        type: "character_add",
        title: "Add documents",
        data: { id: existingCharacter?.data?.id, type: "documents" },
      }));
    }
  }
  function openAddImageDrawer() {
    if (existingCharacter?.data?.id) {
      setDrawer((prev) => ({
        ...prev,
        type: "character_add",
        title: "Add images",
        data: { id: existingCharacter?.data?.id, type: "images" },
      }));
    }
  }
  function openConversationDrawer() {
    if (existingCharacter?.data?.full_name)
      setDrawer({
        type: "conversations",
        title: "Start new conversation",
        data: {
          character: {
            id: existingCharacter?.data.id,
            full_name: existingCharacter?.data?.full_name,
            portrait_id: existingCharacter?.data?.portrait_id,
          },
        },
        size: "lg",
      });
  }
  const columns = useMemo(() => relationshipTableColumns(project_id as string, navigate, setDrawer, isPreview), []);

  useEffect(() => {
    setSelectedTab(getCharacterProfileTabFromType(type));
  }, [type]);

  const formattedRelationships: FormattedRelationship[] = Object.entries(groupBy(relationships, "id")).map(([key, value]) => {
    return {
      id: key,
      portrait: value[0].portrait || null,
      full_name: value[0].full_name,
      relationships: value.map((v) => ({ relation_title: v.relation_title, relation_type_title: v.relation_type_title })),
    };
  });

  return (
    <div className={"flex h-full max-h-full flex-col gap-y-2 overflow-hidden"}>
      {isPreview ? null : (
        <div className="flex h-12 min-h-[3rem] items-center justify-between gap-x-2">
          <Breadcrumbs />
          {item_id ? (
            <div className="ml-auto h-10 w-10">
              <Button
                icon={IconEnum.public}
                isDisabled={!existingCharacter?.data?.is_public}
                isIconOnly
                onClick={() => openPublicPage(`/${project_id}/characters/${existingCharacter?.data?.id}`)}
                tooltip="View public page"
                variant="info"
              />
            </div>
          ) : null}
          {item_id ? (
            <div className="w-52">
              <Button
                icon={IconEnum.edit}
                isDisabled={
                  !hasActionPermission(
                    isProjectOwner,
                    user?.id === existingCharacter?.data?.owner_id,
                    permissions,
                    existingCharacter?.data?.permissions || [],
                    "update_characters",
                    user?.role?.id
                  )
                }
                label="Edit current character"
                onClick={() => {
                  setDrawer((prev) => ({
                    ...prev,
                    size: "2xl",
                    title: "Edit character",
                    type: "characters",
                    data: { id: id || (item_id as string), project_id: project_id as string },
                  }));
                }}
              />
            </div>
          ) : null}
        </div>
      )}
      <div className="h-full w-full flex-1 flex-col content-start gap-4 overflow-hidden pt-0">
        {isLoading ? <Skeleton type="character_profile" /> : null}

        {!isLoading ? (
          <div className={`mb-2 w-full ${isViewOnly ? "" : "[&>div>ul>li>button]:bg-black"}`}>
            <Tabs
              hasArrowNav
              onChange={(tab, index) => {
                if (!isPreview) {
                  navigate(`/projects/${project_id}/characters/${item_id}/${tab.label.toLowerCase()}`);
                }
                setSelectedTab(index);
              }}
              selectedTab={selectedTab}
              tabs={IS_PUBLIC ? tabs.slice(0, 4) : tabs}
            />
          </div>
        ) : null}
        <div className="grid h-full grid-cols-6 content-start rounded-lg bg-zinc-950 lg:content-stretch lg:items-center">
          {!isLoading ? (
            <div className="col-span-6 flex h-fit flex-col items-center gap-y-2 border-r border-zinc-900 p-4 lg:col-span-1 lg:h-full">
              <Avatar
                hasShowImage
                image={
                  existingCharacter?.data?.portrait
                    ? getImageURL(project_id as string, "images", existingCharacter?.data?.portrait?.id)
                    : undefined
                }
                initials={getFirstLetters(existingCharacter?.data?.full_name || "") || ""}
                isTooltipDisabled
                size="4xl"
              />

              <h2 className="text-center font-merriweather text-2xl">
                {`${existingCharacter?.data?.full_name || ""}`.trimEnd()}
              </h2>
              {existingCharacter?.data?.nickname ? (
                <h3 className="text-center font-lato">{existingCharacter?.data?.nickname || ""}</h3>
              ) : null}
              {existingCharacter?.data?.tags?.length ? (
                <div className="animate-in fade-in fill-mode-both mt-2 flex w-full flex-wrap justify-center gap-2">
                  {existingCharacter.data.tags.map((tag) => (
                    <div key={tag.id}>
                      <Badge customColor={tag.color} label={tag.title} />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="col-span-6 flex h-full flex-1 flex-col overflow-auto py-4 lg:col-span-5">
            <h2 className="mb-4 flex h-8 items-center border-b border-zinc-900 pb-2 pl-4 font-merriweather text-2xl">
              <span className="flex">
                {type === "conversations" && subitem_id ? (
                  <div className="ml-auto flex w-min items-center pr-2 text-sm">
                    <Button
                      hasNoBackground
                      icon={IconEnum.chevron_left}
                      isIconOnly
                      onClick={() => {
                        navigate(`/projects/${project_id}/characters/${item_id}/conversations`);
                      }}
                      size="sm"
                    />
                  </div>
                ) : null}
                {tabs[selectedTab].label} {subitem_id && tabs[selectedTab].label === "conversations" ? "-" : ""}
                {existingConversations?.data?.find((convo) => convo?.id === subitem_id)?.title}
              </span>
              {type === "relationships" ? (
                <div className="ml-auto w-min">
                  <Button
                    icon={IconEnum.family_tree}
                    isDisabled={disableShowRelationshipTree(existingCharacter?.data)}
                    label="Show relationship tree"
                    onClick={showRelationshipTree}
                    size="sm"
                    variant="info"
                  />
                </div>
              ) : null}
              {type === "conversations" && !subitem_id ? (
                <div className="ml-auto w-min">
                  <Button
                    icon={IconEnum.conversation}
                    label="New conversation"
                    onClick={openConversationDrawer}
                    size="sm"
                    variant="info"
                  />
                </div>
              ) : null}
            </h2>
            {(isPreview ? tabs[selectedTab].id === "0" : type === "biography") ? (
              <div className="flex h-full items-start gap-x-4 p-4">
                <div className="overflow-auto [&>.staticRendererContainer]:p-0">
                  <StaticRender content={(existingCharacter?.data?.biography as RemirrorJSON | null) ?? undefined} />
                </div>
              </div>
            ) : null}
            {(isPreview ? tabs[selectedTab].id === "1" : type === "additional fields") ? (
              <ul className="animate-in fade-in fill-mode-both flex max-h-[80%] flex-col gap-y-2 overflow-y-auto p-4">
                {isFetchingTemplates ? <Skeleton type="character_profile_main" /> : null}
                {(existingTemplates?.data || []).map((t) => {
                  return (
                    <Collapsible key={t.id} label={t.title}>
                      <div className="grid h-full max-h-[calc(100%-3rem)] grid-cols-6 flex-col content-start gap-2 overflow-auto">
                        {t.character_fields.map((template_field) => {
                          const characterField = existingCharacter?.data?.character_fields?.find(
                            (f) => f.id === template_field.id
                          );
                          return (
                            <AdditionalFieldDisplay
                              character_field={template_field}
                              character_field_data={characterField ?? null}
                              isPreview={!!id}
                              key={template_field.id}
                            />
                          );
                        })}
                      </div>
                    </Collapsible>
                  );
                })}

                {!isFetchingTemplates && !existingTemplates?.data?.length ? (
                  <Alert label="There are no templates available." variant="info" />
                ) : null}
              </ul>
            ) : null}
            {(isPreview ? tabs[selectedTab].id === "2" : type === "relationships") ? (
              <div className="h-full p-4">
                {isFetching ? (
                  <div className="pt-10">
                    <Skeleton limit={5} type="table" />
                  </div>
                ) : (
                  <div className="h-fit w-full">
                    <Table
                      columns={columns}
                      config={{
                        getLink: (rowData: any) => `/projects/${project_id}/characters/${rowData.id}/relationships`,
                        expandable: true,
                      }}
                      data={formattedRelationships.toSorted(sortCharactersByName)}
                      dispatch={dispatch}
                      type="relationships"
                    />
                  </div>
                )}
              </div>
            ) : null}

            {(isPreview ? tabs[selectedTab].id === "3" : type === "resources") ? (
              <div className="flex h-[calc(100%-3rem)] max-h-[calc(100%-3rem)] flex-col gap-y-2 overflow-auto p-4">
                <Collapsible
                  actions={
                    IS_PUBLIC
                      ? []
                      : [
                          {
                            icon: IconEnum.add,
                            tooltip: "Add document",
                            onClick: openAddDocumentDrawer,
                          },
                        ]
                  }
                  icon={IconEnum.document}
                  initialOpen={false}
                  label="Documents">
                  {existingCharacter?.data?.documents?.length ? (
                    <div className="animate-in fade-in fill-mode-both mt-2">
                      <Table
                        columns={documentsTableColumns(
                          removeItem,
                          updateDocumentsPublic,
                          setDrawer,
                          queryClient,
                          project_id as string,
                          item_id as string
                        )}
                        config={{
                          expandable: true,
                          hasNoHeaderGap: true,
                          getLink: (rowData: DocumentType) => `/projects/${project_id}/documents/${rowData.id}`,
                        }}
                        data={existingCharacter?.data?.documents || []}
                        dispatch={dispatch}
                        type="documents"
                      />
                    </div>
                  ) : (
                    <div className="mt-2 w-full">
                      <Alert label="There is no content." variant="info" />
                    </div>
                  )}
                </Collapsible>

                <Collapsible icon={IconEnum.map_pin} initialOpen={false} label="Locations">
                  <div className="animate-in fade-in fill-mode-both mt-2">
                    {existingCharacter?.data?.locations?.length ? (
                      <Table
                        columns={locationsTableColumns(project_id as string)}
                        config={{
                          expandable: true,
                          hasNoHeaderGap: true,
                          getLink: (rowData: CharacterLocationType) =>
                            `/projects/${project_id}/maps/${rowData.id}/${rowData.map_pin_id}`,
                        }}
                        data={existingCharacter?.data?.locations || []}
                        dispatch={dispatch}
                        type="documents"
                      />
                    ) : (
                      <div className="mt-2 w-full">
                        <Alert label="There is no content." variant="info" />
                      </div>
                    )}
                  </div>
                </Collapsible>
                <Collapsible icon={IconEnum.event} initialOpen={false} label="Events">
                  <div className="animate-in fade-in fill-mode-both mt-2">
                    {existingCharacter?.data?.events?.length ? (
                      <Table
                        columns={eventsTableColumns(
                          updateEventsPublic,
                          setDrawer,
                          queryClient,
                          project_id as string,
                          item_id as string
                        )}
                        config={{
                          expandable: true,
                          hasNoHeaderGap: true,
                          getLink: (rowData: EventType) =>
                            getEntityLink(project_id as string, "events", rowData.id, rowData.parent_id),
                        }}
                        data={existingCharacter?.data?.events || []}
                        dispatch={dispatch}
                        type="events"
                      />
                    ) : (
                      <div className="mt-2 w-full">
                        <Alert label="There is no content." variant="info" />
                      </div>
                    )}
                  </div>
                </Collapsible>
                <Collapsible
                  actions={
                    IS_PUBLIC
                      ? []
                      : [
                          {
                            icon: assetView === "card" ? IconEnum.card : IconEnum.table,
                            tooltip: "Change view",
                            onClick: () => setAssetView(assetView === "card" ? "table" : "card"),
                          },
                          {
                            icon: IconEnum.download,
                            tooltip: "Download all",
                            onClick: () =>
                              downloadImages({
                                data: (existingCharacter?.data?.images || []).map((img) => ({ id: img.id, title: img.title })),
                              }),
                          },
                          {
                            icon: IconEnum.add,
                            tooltip: "Add assets",
                            onClick: openAddImageDrawer,
                          },
                        ]
                  }
                  icon={IconEnum.image}
                  initialOpen={false}
                  label="Assets">
                  {existingCharacter?.data?.images?.length ? (
                    <div className="animate-in fade-in fill-mode-both mt-2">
                      {assetView === "table" ? (
                        <Table
                          columns={assetTableColumns(
                            downloadImages,
                            project_id,
                            removeItem,
                            user?.webhooks || [],
                            updateImagesPublic,
                            queryClient,
                            existingCharacter?.data?.id
                          )}
                          config={{
                            hasNoHeaderGap: true,
                          }}
                          data={existingCharacter?.data?.images || []}
                          dispatch={dispatch}
                          type="images"
                        />
                      ) : (
                        <Gallery columns={4} images={existingCharacter?.data?.images} isOpenable size="2xl" type="images" />
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 w-full">
                      <Alert label="There is no content." variant="info" />
                    </div>
                  )}
                </Collapsible>
              </div>
            ) : null}
            {(isPreview ? tabs[selectedTab].id === "4" : type === "conversations") ? (
              <div className="p-4">
                {subitem_id && !isPreview ? null : (
                  <div className="col-span-3 flex flex-col">
                    <Table
                      columns={conversationTableColumns(
                        project_id as string,
                        item_id as string,
                        setDialog,
                        setDrawer,
                        generateDocument
                      )}
                      config={{
                        onRowClick: isPreview
                          ? undefined
                          : (rowData: ConversationType) => {
                              navigate(`/projects/${project_id}/characters/${item_id}/conversations/${rowData.id}`);
                            },
                      }}
                      data={existingConversations?.data || []}
                      dispatch={dispatch}
                      isLoading={isLoadingConversations}
                      type="conversations"
                    />
                  </div>
                )}
                <div className="h-full max-h-[100%] overflow-hidden">
                  {subitem_id && !isPreview ? <ConversationView id={subitem_id} /> : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
