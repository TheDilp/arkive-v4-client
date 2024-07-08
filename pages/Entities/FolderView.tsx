import { UseMutateFunction } from "@tanstack/react-query";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import ls from "localstorage-slim";
import { Dispatch, MouseEvent, useEffect, useLayoutEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  createColumnHelper,
  Dropdown,
  Icon,
  Input,
  Select,
  Skeleton,
  Table,
  TablePageLayout,
} from "../../components";
import {
  useBreakpoint,
  useBulkUpdate,
  useDeleteMany,
  useGetEntities,
  useGetEntity,
  useHasPermissions,
  useNavbarTitle,
  useTable,
  useUpdateEntity,
} from "../../hooks";
import {
  AvailableEntityType,
  AvailableSubEntityType,
  BaseEntityType,
  BulkUpdateType,
  DeleteManyType,
  DialogAtomType,
  DrawerAtomType,
  DrawerContentCreateNewType,
  EntitiesWithFolders,
  ImageType,
  PermissionCodeType,
  RequestFilterTypes,
  TableDispatch,
  TableSelectedAction,
  TableSelectionType,
  TagType,
  UserHasPermissionsType,
  WebhookType,
} from "../../types";
import {
  AvailableIcons,
  baseURLS,
  breadcrumbsAtom,
  capitalizeFirstLetter,
  contextMenuAtom,
  dialogAtom,
  drawerAtom,
  EntitiesWithFoldersEnum,
  EntitiesWithTags,
  FetchFunction,
  getDefaultEntityIcon,
  getEntityFields,
  getImageURL,
  getNavbarEntityType,
  getPermissionsForTypeView,
  getPluralEntityType,
  getSingularEntityType,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  openPublicPage,
  PublicEntities,
  useNotifications,
  userAtom,
  userSettingsAtom,
} from "../../utils";
import { ProjectSettingsView } from "../Projects";
import { AssetView } from "./AssetView";
import { BlueprintView } from "./BlueprintView";
import { CharactersView } from "./CharactersView";
import { TagView } from "./TagView";
import { CharacterTemplatesView } from "./TemplatesView";

function getEditActionTitle(is_document_template: boolean, is_folder: boolean, entityName: string) {
  if (is_document_template) return "Edit document template";
  return is_folder ? "Edit folder" : `Edit ${entityName}`;
}

const noFetchTypes = [
  "random_table_options",
  "blueprints",
  "tags",
  "characters",
  "character_fields_templates",
  "settings",
  "assets",
];

const documentTypes = [
  { label: "Documents", value: "documents" },
  { label: "Templates", value: "templates" },
];

type EntityItemType = {
  id: string;
  is_folder: boolean | null;
  title: string;
  icon?: string | null;
  image_id?: string;
};
const columnHelper = createColumnHelper<BaseEntityType>();

function getColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  entityName: string,
  entityType: "documents" | "maps" | "graphs" | "calendars" | "dictionaries" | "random_tables",
  project_id: string,
  is_document_template: boolean,
  webhooks: WebhookType[],
  updateMany: BulkUpdateType,
  permissions: UserHasPermissionsType,
  isProjectOwner: boolean,
  user_id: string,
  user_role_id: string | undefined,
  show_image?: boolean
) {
  return [
    columnHelper.display({
      id: "is_folder",
      header: "",
      cell: ({ row }) =>
        "image" in row.original && (row.original.image as ImageType) && show_image ? (
          <Avatar
            image={getImageURL(
              project_id,
              entityType === "maps" ? "map_images" : "images",
              (row.original.image as ImageType)?.id || ""
            )}
            isBordered
            isTooltipDisabled
            size="sm"
          />
        ) : (
          <Icon
            fontSize={24}
            icon={
              row.original.is_folder
                ? IconEnum.folder
                : (row.original.icon as AvailableIcons) || getDefaultEntityIcon(entityType)
            }
          />
        ),
      maxSize: 3.25,
      minSize: 3.25,
      meta: {
        centered: true,
        noLink: true,
      },
    }),
    columnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => <div className="truncate">{row.original.title}</div>,
      size: 15,
    }),
    columnHelper.display({
      id: "is_public",
      header: "",
      meta: {
        centered: true,
        noLink: true,
      },
      cell: ({ row }) =>
        row.original.is_folder ? null : (
          <Button
            hasNoBackground
            icon={row.original.is_public ? IconEnum.eye : IconEnum.eye_slash}
            isDisabled={
              !!row.original.deleted_at ||
              !hasActionPermission(
                isProjectOwner,
                user_id === row.original.owner_id,
                permissions,
                row.original?.permissions || [],
                `update_${entityType}` as PermissionCodeType,
                user_role_id
              )
            }
            isIconOnly
            onClick={() => {
              updateMany({ data: [{ data: { id: row.original.id, is_public: !row.original.is_public } }] });
            }}
          />
        ),
      minSize: 3.25,
      maxSize: 3.25,
    }),
    columnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => {
        const actions: {
          id: string;
          title: string;
          icon: AvailableIcons;
          onClick?: () => void;
          isDisabled?: boolean;
          subItems?: {
            id: string;
            title: string;
            onClick: () => Promise<any>;
          }[];
        }[] = row.original.deleted_at
          ? [
              {
                id: "1",
                title: `Restore ${getSingularEntityType(entityType)}`,
                icon: IconEnum.restore,
                isDisabled: !hasActionPermission(
                  isProjectOwner,
                  user_id === row.original.owner_id,
                  permissions,
                  row.original?.permissions || [],
                  `delete_${entityType}` as PermissionCodeType,
                  user_role_id
                ),
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: entityType,
                    },

                    title: `Restore ${getSingularEntityType(entityType)}`,
                    size: "sm",
                    type: "restore_entity",
                    isOverlay: true,
                  }));
                },
              },
            ]
          : [
              {
                id: "1",
                title: getEditActionTitle(is_document_template, !!row.original.is_folder, entityName),
                icon: IconEnum.edit,
                isDisabled: !hasActionPermission(
                  isProjectOwner,
                  user_id === row.original.owner_id,
                  permissions,
                  row.original?.permissions || [],
                  `update_${entityType}` as PermissionCodeType,
                  user_role_id
                ),
                onClick: () => {
                  setDrawer((prev) =>
                    row.original.is_folder
                      ? {
                          ...prev,
                          data: { id: row.original.id, type: entityType as EntitiesWithFolders },
                          title: `Edit folder - ${row.original.title}`,
                          size: "sm",
                          type: "folder",
                        }
                      : {
                          ...prev,
                          data: row.original,
                          title: `Edit ${entityName} - ${row.original.title}`,
                          size: entityType === "documents" && is_document_template ? "half" : "lg",
                          type: entityType,
                        }
                  );
                },
              },
            ];
        if (entityType === "documents" && !is_document_template && !row.original.deleted_at) {
          actions.push({
            id: "mentioned_in",
            title: "Mentioned in",
            icon: IconEnum.graph,
            isDisabled: !hasActionPermission(
              isProjectOwner,
              user_id === row.original.owner_id,
              permissions,
              row.original?.permissions || [],
              "read_documents",
              user_role_id
            ),
            onClick: () => {
              setDrawer((prev) => ({
                ...prev,
                title: "Mentioned in",
                data: { id: row.original.id, title: row.original.title, icon: row.original.icon ?? undefined },
                type: "mentioned_in",
                size: "half",
              }));
            },
          });
        }
        if (PublicEntities.includes(entityType) && !is_document_template && !row.original.deleted_at) {
          actions.push(
            {
              id: "view_public",
              title: "View public page",
              icon: IconEnum.public,
              onClick: () => openPublicPage(`/${project_id}/${entityType}/${row.original.id}`),
              isDisabled: !row.original.is_public,
            },
            {
              id: "send_to_discord",
              title: "Send to Discord",
              icon: IconEnum.discord,
              isDisabled: !row.original.is_public,
              subItems: webhooks.map((webhook) => ({
                id: webhook.id,
                title: webhook.title,
                onClick: () =>
                  FetchFunction({
                    url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                    body: JSON.stringify({
                      data: { id: row.original.id, type: entityType },
                    }),
                    method: "POST",
                  }),
              })),
            }
          );
        }

        // if (entityType === "dictionaries") {
        //   actions.push({
        //     id: "download_dictionary",
        //     isDisabled: permissions[`update_${type}` as PermissionCodeType],

        //     title: "Download PDF dictionary",
        //     icon: IconEnum.pdf,
        //     isDisabled: true,
        //     // onClick: () => savePDF(row.original.title, row.original.id),
        //   });
        // }

        //! ALWAYS GOES LAST
        actions.push({
          id: "delete_entity",
          title: row.original.is_folder
            ? `${row.original.deleted_at ? "Delete" : "Arkive"} folder`
            : `${row.original.deleted_at ? "Delete" : "Arkive"} ${entityName}`,
          icon: row.original.deleted_at ? IconEnum.trash : IconEnum.archive,
          isDisabled: !hasActionPermission(
            isProjectOwner,
            user_id === row.original.owner_id,
            permissions,
            row.original?.permissions || [],
            `delete_${entityType}`,
            user_role_id
          ),
          onClick: () => {
            setDialog((prev) => ({
              ...prev,
              data: {
                ...row.original,
                entity_title: entityType,
              },
              title: `${row.original.deleted_at ? "Delete" : "Arkive"} ${getSingularEntityType(entityType)}`,
              size: "sm",
              type: row.original.deleted_at ? "delete_entity" : "arkive_entity",
              isOverlay: true,
            }));
          },
        });

        return (
          <div className="flex items-center justify-center">
            <Dropdown allowedPlacements={["left", "left-start", "left-end"]} items={actions}>
              <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
            </Dropdown>
          </div>
        );
      },
    }),
  ];
}

function EntityItem({
  id,
  is_folder,
  title,
  type,
  icon,
  image_id,
  show_image,
  showContextMenu,
  changeParent,
}: EntityItemType & {
  type: AvailableEntityType;
  show_image?: boolean;
  changeParent: UseMutateFunction<
    any,
    unknown,
    {
      data: {
        id?: string | undefined;
        parent_id?: string | null | undefined;
      };
    },
    unknown
  >;

  showContextMenu: (event: MouseEvent<HTMLDivElement, MouseEvent>, item_id: string) => void;
}) {
  const { project_id } = useParams();

  return (
    <Link
      draggable
      onDragLeave={(e) => {
        e.preventDefault();

        // eslint-disable-next-line no-param-reassign
        e.currentTarget.className = "";
      }}
      onDragOver={(e) => {
        e.preventDefault();

        // eslint-disable-next-line no-param-reassign
        if (is_folder) e.currentTarget.className = "text-blue-400";
      }}
      onDragStart={(e) => {
        e.dataTransfer.setData("item_move_data", id);
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (!is_folder) {
          return;
        }
        const child_id = e.dataTransfer.getData("item_move_data");
        if (child_id === id) return;
        changeParent({ data: { id: child_id, parent_id: id } });
        e.dataTransfer.clearData("item_move_data");
      }}
      to={`../${type}${is_folder ? "/folder" : ""}/${id}`}>
      <div
        className="col-span-1 flex cursor-pointer flex-col items-center justify-center hover:text-blue-400"
        onContextMenu={(e) => {
          e.preventDefault();
          showContextMenu(e as any, id);
        }}>
        <div className="pointer-events-none h-24 w-24">
          {image_id && show_image ? (
            <img
              alt={title}
              className="h-full w-full object-contain"
              src={getImageURL(project_id as string, type === "maps" ? "map_images" : "images", image_id)}
            />
          ) : (
            <Icon fontSize={100} icon={is_folder ? IconEnum.folder : (icon as AvailableIcons) || getDefaultEntityIcon(type)} />
          )}
        </div>
        <span className="font-lato max-w-full truncate text-white hover:text-white">{title}</span>
      </div>
    </Link>
  );
}

function getSelectedActions(
  permissions: UserHasPermissionsType,
  {
    selection,
    updateMany,
    resetDialogAtom,
    deleteMany,
    dispatch,
    data,
    arkived,
    setDrawer,
    setDialog,
    type,
  }: {
    updateMany: BulkUpdateType;
    deleteMany: DeleteManyType;
    selection: TableSelectionType | undefined;
    setDrawer: Dispatch<SetStateAction<DrawerAtomType>>;
    setDialog: Dispatch<SetStateAction<DialogAtomType>>;
    resetDialogAtom: () => unknown;
    data: any[];
    arkived: "active" | "arkive";
    dispatch: TableDispatch;
    type: AvailableEntityType | AvailableSubEntityType;
  }
) {
  const selectedActions: TableSelectedAction[] = [];
  if (permissions?.[`update_${type}` as PermissionCodeType]) {
    selectedActions.push(
      ...(PublicEntities.includes(type as AvailableEntityType)
        ? [
            {
              icon: IconEnum.eye,
              hasNoBackground: true,
              isIconOnly: true,
              tooltip: "Set public",
              onClick: () => {
                const ids = Object.values(selection || {}).flatMap((id) => id);
                const entitesNotFolders = (data || [])?.filter((e) => ids.includes(e.id) && !e.is_folder);
                if (entitesNotFolders.length) {
                  updateMany({ data: ids.map((id) => ({ data: { id, is_public: true } })) });
                  dispatch({ type: "clearSelection" });
                }
              },
            },
            {
              icon: IconEnum.eye_slash,
              hasNoBackground: true,
              isIconOnly: true,
              tooltip: "Set private",
              onClick: () => {
                const ids = Object.values(selection || {}).flatMap((id) => id);
                const entitesNotFolders = (data || [])?.filter((e) => ids.includes(e.id) && !e.is_folder);
                if (entitesNotFolders.length) {
                  updateMany({ data: ids.map((id) => ({ data: { id, is_public: false } })) });
                  dispatch({ type: "clearSelection" });
                }
              },
            },
          ]
        : []),

      {
        icon: IconEnum.folder,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Move to folder",
        onClick: () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const items = (data || [])?.filter((e) => ids.includes(e.id)).map((e) => ({ id: e.id, title: e.title }));
          setDrawer((prev) => ({
            ...prev,
            size: "lg",
            title: "Bulk move to folder",
            type: "bulk_folder",
            data: { items, dispatch, type: type as EntitiesWithFolders },
          }));
        },
      },
      ...(EntitiesWithTags.includes(type as AvailableEntityType)
        ? [
            {
              icon: IconEnum.tags,
              hasNoBackground: true,
              isIconOnly: true,
              tooltip: "Add/remove tags",
              onClick: () => {
                if (EntitiesWithTags.includes(type as AvailableEntityType)) {
                  const ids = Object.values(selection || {}).flatMap((id) => id);
                  const charactersWithTags = (data || [])
                    ?.filter((e) => ids.includes(e.id))
                    .map((e) => ({
                      id: e.id,
                      tags: "tags" in e ? ((e.tags as TagType[]) || []).map((t) => t.id) : [],
                    }));

                  setDrawer((prev) => ({
                    ...prev,
                    size: "lg",
                    title: "Bulk edit tags",
                    type: "bulk_tags",
                    data: { items: charactersWithTags, dispatch, type: type as AvailableEntityType },
                  }));
                }
              },
            },
          ]
        : [])
    );
  }
  selectedActions.push({
    icon: IconEnum.permissions,
    hasNoBackground: true,
    isIconOnly: true,
    tooltip: "Change access",
    onClick: () => {
      const ids = Object.values(selection || {}).flatMap((id) => id);

      setDrawer((prev) => ({
        ...prev,
        size: "lg",
        title: "Edit access",
        type: "bulk_access",
        data: {
          ids,
          selectablePermissions: ["read_characters", "update_characters", "delete_characters"],
          type: "characters",
        },
      }));
    },
  });
  if (permissions?.[`delete_${type}` as PermissionCodeType]) {
    if (arkived === "arkive") {
      selectedActions.push({
        icon: IconEnum.restore,
        variant: "primary",
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Restore selected rows",
        onClick: () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          if (ids.length) {
            setDialog((prev) => ({
              ...prev,
              title: "Restore many",
              description: `Are you sure you want to restore ${ids.length} ${
                ids.length === 1 ? getSingularEntityType(type) : getPluralEntityType(type)
              }?`,
              isOverlay: true,
              cancel: {
                label: "Cancel",
                variant: "primary",
                action: resetDialogAtom,
              },
              confirm: {
                label: "Restore",
                icon: IconEnum.restore,
                action: () => {
                  updateMany(
                    { data: ids.map((id) => ({ data: { id, deleted_at: null } })) },
                    {
                      onSuccess: () => dispatch({ type: "clearSelection" }),
                    }
                  );
                  dispatch({ type: "clearSelection" });
                },
                variant: "success",
              },
            }));
          }
        },
      });
    }

    selectedActions.push({
      icon: arkived === "arkive" ? IconEnum.trash : IconEnum.archive,
      variant: arkived === "arkive" ? "error" : "primary",
      hasNoBackground: true,
      isIconOnly: true,
      tooltip: `${arkived === "arkive" ? "Delete" : "Arkive"} selected rows`,
      onClick: () => {
        const ids = Object.values(selection || {}).flatMap((id) => id);
        if (ids.length) {
          setDialog((prev) => ({
            ...prev,
            title: `${arkived === "arkive" ? "Delete" : "Arkive"} many`,
            description: `Are you sure you want to ${arkived === "arkive" ? "delete" : "arkive"} ${ids.length} ${
              ids.length === 1 ? getSingularEntityType(type) : getPluralEntityType(type)
            }?`,
            data: {
              entity_title: type,
            },
            type: arkived === "arkive" ? "delete_many" : "arkive_many",
            warning: arkived === "arkive" ? "This action cannot be undone." : undefined,
            isOverlay: true,
            cancel: {
              label: "Cancel",
              variant: "primary",
              action: resetDialogAtom,
            },
            confirm: {
              label: arkived === "arkive" ? "Delete" : "Arkive",
              icon: arkived === "arkive" ? IconEnum.trash : IconEnum.archive,
              action: async () =>
                deleteMany(
                  { data: { ids } },
                  {
                    onSuccess: () => dispatch({ type: "clearSelection" }),
                  }
                ),
              variant: "error",
            },
          }));
        }
      },
    });
  }

  return selectedActions;
}

export function FolderView() {
  const { project_id, type, item_id } = useParams();
  const { pathname } = useLocation();
  const breakpoints = useBreakpoint();
  const user = useAtomValue(userAtom);
  const entityName = getSingularEntityType(type as AvailableEntityType);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const isFolder = pathname.includes("/folder/");
  const createNotification = useNotifications();
  const permissions = useHasPermissions(
    getPermissionsForTypeView(type as AvailableEntityType | AvailableSubEntityType),
    undefined
  );

  const { show_image_folder_view, show_image_table_view } = useAtomValue(userSettingsAtom);
  const [{ selection, pagination, filters, relationFilters }, dispatch] = useTable({
    selection: [],
    pagination: { page: 0, limit: 10 },
  });
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"table" | "folders">(ls.get(`${entityName}-table`) || "table");
  const [arkived, setArkived] = useState<"active" | "arkive">(ls.get(`${entityName}-table-active`) || "active");
  const [documentType, setDocumentType] = useState<"documents" | "templates">(ls.get("documentType") ?? "documents");
  const { data: base, isInitialLoading } = useGetEntities<BaseEntityType & { image_id?: string }>(
    {
      pagination,
      data: {
        project_id,
        item_id,
      },
      filters: {
        and: [
          ...(filters?.and ? filters.and : []),
          ...(arkived === "active" && !filters?.and?.some((f) => f.id === "quick_filter")
            ? [
                {
                  id: "parent",
                  header_name: "Parent",
                  field: "parent_id",
                  operator: (isFolder ? "eq" : "is") as RequestFilterTypes,
                  value: isFolder ? (item_id as string) : null,
                },
              ]
            : []),
          ...(documentType === "templates" && type === "documents"
            ? [
                {
                  id: "template",
                  header_name: "Template",
                  field: "is_template",
                  operator: "eq" as const,
                  value: true,
                },
              ]
            : []),
        ],
        or:
          documentType !== "templates" && type === "documents"
            ? [
                {
                  id: "template",
                  header_name: "Template",
                  field: "is_template",
                  operator: "is",
                  value: null,
                },
                {
                  id: "template",
                  header_name: "Template",
                  field: "is_template",
                  operator: "eq" as const,
                  value: false,
                },
              ]
            : [],
      },
      relationFilters,
      permissions: true,
      arkived: arkived === "arkive",
      relations: {
        tags: EntitiesWithTags.includes(type as string),
        image: type === "documents" || type === "maps",
      },
      // @ts-ignore
      fields: getEntityFields(type as AvailableEntityType),
      orderBy: [
        {
          field: "is_folder",
          sort: "asc",
        },
        {
          field: "title",
          sort: "asc",
        },
      ],
    },
    type as AvailableEntityType,
    {
      enabled:
        (!item_id || isFolder) &&
        !!type &&
        !noFetchTypes.includes(type) &&
        !!permissions?.[`read_${type}` as PermissionCodeType],
      staleTime: 5 * 60 * 1000,
    }
  );
  const { data, isInitialLoading: isInitialLoadingFolder } = useGetEntity<BaseEntityType & { image_id?: string }>(
    item_id,
    type as AvailableEntityType,
    {
      data: {
        project_id,
      },
      pagination,
      permissions: true,
      arkived: arkived === "arkive",
      // @ts-ignore
      fields: getEntityFields(type as AvailableEntityType),
      relations: {
        parents: arkived === "active",
        tags: EntitiesWithTags.includes(type as string),
      },
    },
    {
      enabled:
        !!item_id &&
        !!type &&
        !noFetchTypes.includes(type) &&
        isFolder &&
        !!permissions?.[`read_${type}` as PermissionCodeType],
      staleTime: 5 * 60 * 1000,
      queryKeyConcat: [item_id as string],
    }
  );
  const { mutateAsync: updateMany } = useBulkUpdate(project_id as string, type as AvailableEntityType);
  const { mutateAsync: deleteMany } = useDeleteMany(type as AvailableEntityType, arkived === "active", project_id);
  const { mutate: changeParent } = useUpdateEntity(type as AvailableEntityType, project_id as string);
  const navigate = useNavigate();
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const setBreadcrumbs = useSetAtom(breadcrumbsAtom);

  const resetDialogAtom = useResetAtom(dialogAtom);

  const selectedActions = getSelectedActions(permissions, {
    arkived,
    selection,
    setDialog,
    setDrawer,
    deleteMany,
    resetDialogAtom,
    updateMany,
    type: type as AvailableEntityType | AvailableSubEntityType,
    dispatch,
    data: base?.data || [],
  });

  const setContextMenuAtom = useSetAtom(contextMenuAtom);

  useNavbarTitle(
    `${capitalizeFirstLetter(getNavbarEntityType(type as AvailableEntityType | "settings") || "")} ${
      data?.data?.title ? `| ${data.data.title}` : ""
    }`,
    true
  );

  useLayoutEffect(() => {
    if (!item_id) {
      setBreadcrumbs({ items: [], type: type as AvailableEntityType });
    } else if (data?.data?.parents && data?.data?.parents?.length) {
      setBreadcrumbs({ items: data?.data?.parents, type: type as AvailableEntityType });
    }
  }, [data, type, setBreadcrumbs, item_id]);

  useEffect(() => {
    dispatch({ type: "clearSelection" });
    dispatch({ type: "setPagination", payload: { page: 0 } });
    if (arkived === "arkive") navigate(`/projects/${project_id}/${type}`);
  }, [item_id, arkived]);
  useEffect(() => {
    if (
      EntitiesWithFoldersEnum.includes(type as AvailableEntityType) &&
      Object.keys(permissions).length > 1 &&
      !permissions?.[`read_${type}` as PermissionCodeType] &&
      user &&
      typeof isProjectOwner !== "undefined" &&
      isProjectOwner !== null &&
      !isInitialLoading &&
      !isInitialLoadingFolder
    ) {
      createNotification({
        title: `Your current role in this project does not have permission to view ${getPluralEntityType(
          type as AvailableEntityType
        )}.`,
        timer: 5,
        hasNoTruncate: true,
        variant: "error",
        icon: IconEnum.forbidden,
      });
    }
  }, [permissions]);

  useEffect(() => {
    if (!filter) {
      dispatch({
        type: "clearAllFilters",
      });
    }
    dispatch({ type: "clearSelection" });
    dispatch({ type: "setPagination", payload: { page: 0 } });
    if (filter.length >= 3) {
      const timeout = setTimeout(() => {
        if (filter) {
          dispatch({
            type: "clearAllFilters",
          });
          dispatch({
            type: "setFilter",
            payload: {
              and: [{ id: "quick_filter", header_name: "quick_filter", field: "title", operator: "ilike", value: filter }],
              field: "title",
            },
          });
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [filter, dispatch, documentType, arkived]);

  if (!item_id && type === "characters") return <CharactersView />;
  if (!item_id && type === "blueprints") return <BlueprintView />;

  if (type === "tags") return <TagView />;
  if (type === "character_fields_templates") return <CharacterTemplatesView />;

  if (type === "assets") return <AssetView />;
  if (type === "settings") return <ProjectSettingsView />;
  return (
    <TablePageLayout>
      <div className="flex h-fit flex-col items-start justify-start gap-y-2">
        <div className="flex w-full flex-col items-end">
          <Breadcrumbs />
          {!item_id || isFolder ? (
            <div className="flex min-w-fit gap-x-2">
              <div className="w-52">
                <Input
                  isClearable
                  name="quick_filter"
                  onChange={({ value }) => setFilter(value as string)}
                  placeholder="Quick search by title"
                  type="search"
                  value={filter}
                />
              </div>
              {type === "documents" ? (
                <>
                  <div className="w-10">
                    <Button
                      icon={IconEnum.graph}
                      isDisabled={!permissions?.read_documents}
                      isIconOnly
                      onClick={() =>
                        setDrawer((prev) => ({
                          ...prev,
                          size: "half",
                          type: "mentioned_in",
                          title: "All document mentions",
                          data: { id: "", title: "", icon: undefined, isAll: true },
                        }))
                      }
                      tooltip="View all document connections"
                    />
                  </div>
                  <div className="w-fit max-w-32">
                    <Select
                      isDisabled={!permissions?.read_documents}
                      name="documentType"
                      onChange={({ value }) => {
                        setDocumentType(value as "documents" | "templates");
                        ls.set("documentType", value);
                      }}
                      options={documentTypes}
                      value={documentType}
                    />
                  </div>
                </>
              ) : null}

              <div className="w-fit max-w-32">
                <Select
                  name="active"
                  onChange={({ value }) => {
                    setArkived(value as "active" | "arkive");
                    ls.set(`${entityName}-table-active`, value);
                  }}
                  options={[
                    { label: "Active", value: "active", icon: IconEnum.eye },
                    { label: "Arkived", value: "arkive", icon: IconEnum.archive },
                  ]}
                  placeholder="Active"
                  value={arkived}
                />
              </div>

              <div className="w-fit max-w-32">
                <Select
                  name="view"
                  onChange={({ value }) => {
                    setView(value as "folders" | "table");
                    ls.set(`${entityName}-table`, value);
                  }}
                  options={[
                    { label: "Folders", value: "folders", icon: IconEnum.folder },
                    { label: "Table", value: "table", icon: IconEnum.table },
                  ]}
                  placeholder="View"
                  value={view}
                />
              </div>
              {isFolder && !isInitialLoadingFolder ? (
                <div className="w-fit max-w-[208px] lg:w-52">
                  <Button
                    icon={IconEnum.edit}
                    isDisabled={
                      !hasActionPermission(
                        isProjectOwner,
                        user?.id === data?.data?.id,
                        permissions,
                        data?.data?.permissions || [],
                        `update_${type}` as PermissionCodeType,
                        user?.role?.id
                      )
                    }
                    label={`Edit current ${data?.data?.is_folder ? "folder" : entityName}`}
                    onClick={() => {
                      setDrawer((prev) => ({
                        ...prev,
                        size: type === "documents" && documentType === "templates" ? "half" : "lg",
                        title: `Edit ${entityName}`,
                        type: type as DrawerContentCreateNewType,
                        data: { id: item_id as string, project_id: project_id as string },
                      }));
                    }}
                  />
                </div>
              ) : null}
              <div className="w-fit lg:w-52">
                <Dropdown
                  allowedPlacements={["bottom-end"]}
                  isDisabled={!permissions?.[`create_${type}` as PermissionCodeType]}
                  items={[
                    {
                      id: "1",
                      title: "Create new",
                      icon: getDefaultEntityIcon(type as AvailableEntityType),
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          data: { project_id: project_id as string },
                          title: `Create new ${entityName}`,
                          type: type as DrawerContentCreateNewType,
                          size: "lg",
                        }));
                      },
                    },
                    {
                      id: "2",
                      title: "Create new folder",
                      icon: IconEnum.folder,
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          title: `Create new ${entityName} folder`,
                          data: { project_id, type: type as EntitiesWithFolders },
                          type: "folder",
                          size: "sm",
                        }));
                      },
                    },
                    ...(type === "documents"
                      ? [
                          {
                            id: "3",
                            title: "Create new template",
                            icon: IconEnum.document_templates,
                            onClick: () => {
                              setDrawer((prev) => ({
                                ...prev,
                                data: { project_id: project_id as string },
                                title: "Create new template",
                                type: "documents",
                                exceptions: {
                                  createTemplate: true,
                                },
                                size: "half",
                              }));
                            },
                          },
                          {
                            id: "4",
                            title: "Create new manuscript",
                            icon: IconEnum.manuscripts,
                            onClick: () => {
                              setDrawer((prev) => ({
                                ...prev,
                                data: { project_id: project_id as string },
                                title: "Create new manuscript",
                                type: "manuscripts",
                                size: "xl",
                              }));
                            },
                          },
                        ]
                      : []),
                  ]}>
                  <div className="w-fit lg:w-52">
                    <Button
                      icon={IconEnum.add}
                      isDisabled={!permissions?.[`create_${type}` as PermissionCodeType]}
                      label={`Create new ${entityName}`}
                      onClick={undefined}
                      tooltip={breakpoints.isMd ? undefined : `Create new ${entityName}`}
                    />
                  </div>
                </Dropdown>
              </div>
            </div>
          ) : null}
        </div>

        {(isInitialLoading || isInitialLoadingFolder) && view === "folders" ? (
          <div className="mt-72 w-full">
            <Skeleton entity_type={type as AvailableEntityType} type="folder_view" />
          </div>
        ) : null}
      </div>
      {!isInitialLoading && !isInitialLoadingFolder && view === "folders" ? (
        <div className="grid h-full w-full grid-cols-2 content-start gap-8 md:grid-cols-4 lg:grid-cols-10">
          {(base?.data?.length && (!item_id || isFolder) ? base.data : []).map((item) => (
            <EntityItem
              changeParent={changeParent}
              icon={item.icon}
              id={item.id}
              image_id={item?.image_id}
              is_folder={item?.is_folder ?? false}
              key={item.id}
              showContextMenu={(event: MouseEvent<HTMLDivElement, MouseEvent>, id: string) =>
                setContextMenuAtom({
                  event,
                  items: [
                    {
                      id: "1",
                      title: `Edit ${item.is_folder ? "folder" : entityName}`,
                      icon: IconEnum.edit,
                      isDisabled: !permissions?.[`update_${type}` as PermissionCodeType],
                      onClick: () => {
                        if (item?.is_folder)
                          setDrawer((prev) => ({
                            ...prev,
                            size: "lg",
                            title: `Edit ${entityName} - ${item.title}`,
                            type: "folder",
                            data: { id, type: type as EntitiesWithFolders },
                          }));
                        else
                          setDrawer((prev) => ({
                            ...prev,
                            size: "lg",
                            title: `Edit ${entityName} - ${item.title}`,
                            type: type as DrawerContentCreateNewType,
                            data: { id, project_id: project_id as string },
                          }));
                      },
                    },
                    {
                      id: "2",

                      title: `Delete ${item.is_folder ? "folder" : entityName}`,
                      icon: IconEnum.trash,
                      isDisabled: !permissions?.[`delete_${type}` as PermissionCodeType],
                      onClick: () =>
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...item,
                            entity_title: type,
                          },
                          title: `Delete ${item.is_folder ? "folder" : entityName}`,
                          size: "sm",
                          type: "delete_entity",
                        })),
                    },
                  ],
                })
              }
              show_image={show_image_folder_view}
              title={item.title}
              type={type as AvailableEntityType}
            />
          ))}

          {!base?.data?.length && !data?.data?.children?.length && !isInitialLoadingFolder ? (
            <div className="col-span-10 mt-2">
              <Alert label="There is no content." variant="info" />
            </div>
          ) : null}
        </div>
      ) : null}
      {view === "table" ? (
        <div className="w-full flex-1 overflow-hidden">
          <Table
            columns={getColumns(
              setDrawer,
              setDialog,
              entityName,
              type as "documents" | "maps" | "graphs" | "calendars" | "dictionaries" | "random_tables",
              project_id as string,
              documentType === "templates" && type === "documents",
              user?.webhooks || [],
              updateMany,
              permissions,
              isProjectOwner,
              user?.id as string,
              user?.role?.id,
              show_image_table_view
            )}
            config={{
              selectedActions,
              filters,
              relationFilters,
              hasSelect: true,
              hasArkived: arkived === "arkive",
              hasTags: EntitiesWithTags.includes(type as string),
              selection,
              getLink: (rowData: any) =>
                arkived === "active"
                  ? `/projects/${project_id}/${type}${rowData.is_folder ? "/folder" : ""}/${rowData.id}`
                  : "#",
            }}
            data={base?.data || []}
            dispatch={dispatch}
            isLoading={isInitialLoading || isInitialLoadingFolder}
            key={type}
            pagination={pagination}
            type={type as AvailableEntityType}
          />
        </div>
      ) : null}
    </TablePageLayout>
  );
}
