import { ColumnDef } from "@tanstack/react-table";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { Dispatch, useEffect } from "react";
import { useParams } from "react-router-dom";

import { Avatar, Button, Checkbox, createColumnHelper, Dropdown, Table } from "../../components";
import {
  CharacterColumn,
  EventColumn,
  LocationColumn,
  ShowMultipleWithBadge,
} from "../../components/DataDisplay/TableComponents/TableColumns";
import {
  useBulkUpdate,
  useDeleteMany,
  useGetEntities,
  useGetEntity,
  useHasPermissions,
  useNavbarTitle,
  useTable,
} from "../../hooks";
import {
  BlueprintInstanceType,
  BlueprintType,
  BulkUpdateType,
  DeleteManyType,
  DialogAtomType,
  DrawerAtomType,
  NotificationType,
  TableDispatch,
  TableSelectedAction,
  TableSelectionType,
  UserHasPermissionsType,
  WebhookType,
} from "../../types";
import {
  baseURLS,
  BooleanFilters,
  CharacterBlueprintRelationFilter,
  dialogAtom,
  DiceRollRegex,
  drawerAtom,
  FetchFunction,
  getBlueprintInstanceColumnWidth,
  getDayOrdinal,
  getImageURL,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
  openPublicPage,
  rollDiceWithNotification,
  TextFilters,
  useNotifications,
  userAtom,
} from "../../utils";

const columnHelper = createColumnHelper<BlueprintInstanceType>();
const centeredColumns = [
  "images_single",
  "characters_single",
  "locations_single",
  "documents_single",
  "blueprints_single",
  "events_single",
  "boolean",
];
const noLinkColumns = [
  "images_single",
  "images_multiple",
  "locations_single",
  "locations_multiple",
  "events_single",
  "events_multiple",
  "dice_roll",
];

function createColumns(
  blueprint: BlueprintType,
  title_name: string,
  project_id: string,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  createNotification: (notification: Omit<NotificationType, "id">) => void,
  updateMany: BulkUpdateType,
  webhooks: WebhookType[],
  permissions: UserHasPermissionsType,
  isProjectOwner: boolean,
  user_id: string,
  user_role_id: string | undefined
) {
  const fieldColumns: ColumnDef<BlueprintInstanceType, any>[] = [
    columnHelper.accessor("title", {
      id: "title",
      header: title_name,
      meta: {
        pinned: true,
        sortable: true,
        filterOptions: TextFilters,
      },
      cell: ({ row }) => row.original?.title || "",
      minSize: 15,
    }),
  ];

  blueprint.blueprint_fields
    ?.filter((field) => field.field_type !== "textarea")
    ?.forEach((field) => {
      const { minSize, maxSize } = getBlueprintInstanceColumnWidth(field.field_type);
      fieldColumns.push(
        columnHelper.display({
          id: field.id,
          header: field.title,

          cell: ({ row }) => {
            const fieldData = row.original?.blueprint_fields?.find((instanceField) => instanceField?.id === field.id);

            if (field.field_type === "text" || field.field_type === "number") return fieldData?.value || "";
            if (field.field_type === "boolean")
              return (
                <Checkbox
                  isReadOnly
                  name="bool"
                  onChange={() => {}}
                  value={(fieldData?.value as boolean | undefined) ?? false}
                />
              );
            if (field.field_type === "select" || field.field_type === "select_multiple") {
              return (
                (Array.isArray(fieldData?.value) ? fieldData?.value : [fieldData?.value])
                  ?.map((id) => {
                    const opt = field?.options?.find((o) => o.id === id);
                    return opt?.value || "";
                  })
                  .join(", ") ?? ""
              );
            }

            if (field.field_type === "characters_single" || field.field_type === "characters_multiple") {
              return (
                <CharacterColumn
                  characters={fieldData?.characters || []}
                  isMultiple={field.field_type === "characters_multiple"}
                />
              );
            }
            if (field.field_type === "blueprints_single" || field.field_type === "blueprints_multiple") {
              return (
                <ShowMultipleWithBadge
                  isMultiple={field.field_type === "blueprints_multiple"}
                  titles={(fieldData?.blueprint_instances || []).map((instance) => instance.blueprint_instance.title)}
                />
              );
            }
            if (field.field_type === "documents_single" || field.field_type === "documents_multiple") {
              return (
                <ShowMultipleWithBadge
                  isMultiple={field.field_type === "documents_multiple"}
                  titles={(fieldData?.documents || []).map((doc) => doc.document.title)}
                />
              );
            }
            if (field.field_type === "locations_single" || field.field_type === "locations_multiple") {
              return (
                <LocationColumn isMultiple={field.field_type === "locations_multiple"} locations={fieldData?.map_pins || []} />
              );
            }
            if (field.field_type === "events_single" || field.field_type === "events_multiple") {
              return <EventColumn isMultiple={field.field_type === "events_multiple"} locations={fieldData?.events || []} />;
            }
            if (field.field_type === "images_single" || field.field_type === "images_multiple") {
              return (
                <div className="flex w-full">
                  {fieldData?.images?.slice(0, field.field_type === "images_multiple" ? undefined : 1)?.map((image) => (
                    <div className="-ml-4 flex items-center first:ml-0 hover:z-10">
                      <Avatar
                        hasShowImage
                        image={getImageURL(project_id as string, "images", image.related_id)}
                        label={image.image.title}
                        size="sm"
                        tooltipAllowedPlacements={["left", "right"]}
                      />
                    </div>
                  ))}
                </div>
              );
            }
            if (field.field_type === "random_table") {
              const randomTable = fieldData
                ? field.random_table?.random_table_options?.find((opt) => opt?.id === fieldData?.random_table?.option_id)
                : null;
              const subOption =
                randomTable && fieldData?.random_table?.suboption_id
                  ? randomTable.random_table_suboptions?.find((subOpt) => subOpt.id === fieldData?.random_table?.suboption_id)
                  : null;

              return `${randomTable?.title ?? ""} ${subOption ? `(${subOption?.title})` : ""}`;
            }

            if (field.field_type === "date") {
              const startMonthIdx =
                field?.calendar && field.calendar.months.length
                  ? field.calendar.months.findIndex((m) => m.id === fieldData?.calendar?.start_month_id)
                  : null;
              const endMonthIdx =
                field?.calendar && field.calendar.months.length
                  ? field.calendar.months.findIndex((m) => m.id === fieldData?.calendar?.end_month_id)
                  : null;
              const startDayOrdinal = fieldData?.calendar?.start_day ? getDayOrdinal(fieldData?.calendar.start_day) : null;
              const endDayOrdinal = fieldData?.calendar?.end_day ? getDayOrdinal(fieldData?.calendar.end_day) : null;
              return (
                <span>
                  {fieldData?.calendar?.start_day || ""}
                  <sup>{startDayOrdinal} </sup>
                  {typeof startMonthIdx === "number" ? field.calendar?.months[startMonthIdx]?.title : ""}{" "}
                  {fieldData?.calendar?.start_year || ""}
                  {fieldData?.calendar?.end_day ? (
                    <>
                      {" "}
                      - {fieldData?.calendar?.end_day}
                      <sup>{endDayOrdinal} </sup>
                    </>
                  ) : (
                    ""
                  )}
                  {typeof endMonthIdx === "number" ? field.calendar?.months[endMonthIdx]?.title || "" : ""}{" "}
                  {fieldData?.calendar?.end_year || ""}
                </span>
              );
            }
            if (field.field_type === "dice_roll" && field?.formula) {
              return (
                <div className="flex items-center gap-x-2 [&>button]:px-0">
                  <span>{(fieldData?.value as number) || ""}</span>
                  (
                  <Button
                    hasNoBackground
                    icon={IconEnum.d20}
                    iconPos="left"
                    isDisabled={!field.formula}
                    label={field.formula || ""}
                    onClick={async () => {
                      if (field?.formula && field.formula.match(DiceRollRegex))
                        await rollDiceWithNotification(createNotification, field.formula, true);
                    }}
                  />
                  )
                </div>
              );
            }

            return "";
          },
          meta: {
            centered: centeredColumns.includes(field.field_type),
            noLink: noLinkColumns.includes(field.field_type),
            filterOptions: CharacterBlueprintRelationFilter(
              field.field_type,
              field.field_type === "select" || field.field_type === "select_multiple"
                ? (field?.options || []).map((opt) => ({ label: opt.value, value: opt.id }))
                : undefined
            ),
            relationType: field.field_type,
            isRelationFilter: true,
          },
          minSize,
          maxSize,
        })
      );
    });

  fieldColumns.push(
    columnHelper.display({
      id: "is_public",
      header: "",
      meta: {
        centered: true,
        noLink: true,
        filterOptions: BooleanFilters,
      },
      cell: ({ row }) => (
        <Button
          hasNoBackground
          icon={row.original.is_public ? IconEnum.eye : IconEnum.eye_slash}
          isDisabled={!!row.original.deleted_at}
          isIconOnly
          onClick={() => {
            updateMany({ data: [{ data: { id: row.original.id, is_public: !row.original.is_public } }] });
          }}
        />
      ),
      minSize: 3.25,
      maxSize: 3.25,
    })
  );

  fieldColumns.push(
    columnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
        isRelationFilter: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={
              row.original.deleted_at
                ? [
                    {
                      id: "1",
                      title: "Restore blueprint instance",
                      icon: IconEnum.restore,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_blueprint_instances",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "blueprint_instances",
                          },

                          title: "Restore blueprint instance",
                          size: "sm",
                          type: "restore_entity",
                          isOverlay: true,
                        }));
                      },
                    },
                    {
                      id: "delete_blueprint",
                      title: row.original.deleted_at ? "Delete blueprint instance" : "Arkive blueprint instance",
                      icon: row.original.deleted_at ? IconEnum.trash : IconEnum.archive,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_blueprint_instances",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "blueprint_instances",
                          },
                          title: row.original.deleted_at ? "Delete blueprint instance" : "Arkive blueprint instance",
                          size: "sm",
                          type: row.original.deleted_at ? "delete_entity" : "arkive_entity",
                          isOverlay: true,
                        }));
                      },
                    },
                  ]
                : [
                    {
                      id: "1",
                      title: "Edit instance",
                      icon: IconEnum.edit,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "update_blueprint_instances",
                        user_role_id
                      ),
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          data: { id: row.original.id },
                          title: "Edit instance",
                          size: "lg",
                          type: "blueprint_instances",
                        }));
                      },
                    },
                    {
                      id: "2",
                      title: "View public page",
                      icon: IconEnum.public,
                      onClick: () => openPublicPage(`/${project_id}/blueprints/${row.original.id}`),
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
                              data: { id: row.original.id, type: "blueprint_instances" },
                            }),
                            method: "POST",
                          }),
                      })),
                    },
                    {
                      id: "delete_instance",
                      title: "Arkive instance",
                      icon: IconEnum.archive,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        row.original?.permissions || [],
                        "delete_blueprint_instances",
                        user_role_id
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "blueprint_instances",
                          },
                          title: "Arkive instance",
                          size: "sm",
                          type: "arkive_entity",
                        }));
                      },
                    },
                  ]
            }>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    })
  );

  return fieldColumns;
}

function getSelectedActions(
  permissions: UserHasPermissionsType,
  {
    selection,
    updateMany,
    resetDialog,
    deleteMany,
    dispatch,
    data,
    setDrawer,
    setDialog,
    arkived,
  }: {
    arkived: "arkive" | "active";
    updateMany: BulkUpdateType;
    deleteMany: DeleteManyType;
    selection: TableSelectionType | undefined;
    setDrawer: Dispatch<SetStateAction<DrawerAtomType>>;
    setDialog: Dispatch<SetStateAction<DialogAtomType>>;
    resetDialog: () => unknown;
    data: BlueprintInstanceType[];
    dispatch: TableDispatch;
  }
) {
  const selectedActions: TableSelectedAction[] = [];
  if (permissions?.update_blueprint_instances) {
    selectedActions.push(
      {
        icon: IconEnum.eye,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Set public",
        onClick: () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const entitesNotFolders = (data || [])?.filter((e) => ids.includes(e.id));
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
          const entitesNotFolders = (data || [])?.filter((e) => ids.includes(e.id));
          if (entitesNotFolders.length) {
            updateMany({ data: ids.map((id) => ({ data: { id, is_public: false } })) });
            dispatch({ type: "clearSelection" });
          }
        },
      },
      {
        icon: IconEnum.tags,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Add/remove tags",
        onClick: () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const bpiWithTags = (data || [])
            ?.filter((e) => ids.includes(e.id))
            .map((e) => ({ id: e.id, tags: (e.tags || []).map((t) => t.id) }));

          setDrawer((prev) => ({
            ...prev,
            size: "lg",
            title: "Bulk edit tags",
            type: "bulk_tags",
            data: { items: bpiWithTags, dispatch, type: "blueprint_instances" },
          }));
        },
      }
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
          selectablePermissions: ["read_blueprint_instances", "update_blueprint_instances", "delete_blueprint_instances"],
          type: "blueprint_instances",
        },
      }));
    },
  });

  if (permissions?.delete_blueprint_instances) {
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
                ids.length === 1 ? "blueprint instance" : "blueprint_instances"
              }?`,
              isOverlay: true,
              cancel: {
                label: "Cancel",
                variant: "primary",
                action: resetDialog,
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
              ids.length === 1 ? "blueprint instance" : "blueprint instances"
            }?`,
            warning: arkived === "arkive" ? "This action cannot be undone." : undefined,
            isOverlay: true,
            cancel: {
              label: "Cancel",
              variant: "primary",
              action: resetDialog,
            },
            confirm: {
              label: arkived === "arkive" ? "Delete" : "Arkive",
              icon: arkived === "arkive" ? IconEnum.trash : IconEnum.archive,
              action: () => {
                deleteMany(
                  { data: { ids } },
                  {
                    onSuccess: () => dispatch({ type: "clearSelection" }),
                  }
                );
                dispatch({ type: "clearSelection" });
              },
              variant: "error",
            },
          }));
        }
      },
    });
  }

  return selectedActions;
}

export function BlueprintInstanceView({ filter, arkived }: { filter: string; arkived: "active" | "arkive" }) {
  const { project_id, item_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const resetDialog = useResetAtom(dialogAtom);

  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(
    ["read_blueprint_instances", "update_blueprint_instances", "delete_blueprint_instances"],
    undefined
  );
  const createNotification = useNotifications();
  const [{ selection, pagination, orderBy, filters, relationFilters }, dispatch] = useTable({
    selection: {},
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { page: 0, limit: 10 },
    filters: {},
    relationFilters: {},
  });

  const { data: blueprint } = useGetEntity<BlueprintType>(item_id, "blueprints", {
    data: {
      id: item_id,
    },
    relations: {
      blueprint_fields: true,
    },
    fields: ["id", "title", "title_name"],
  });
  useNavbarTitle(`Blueprints | ${blueprint?.data?.title || ""}`, !!blueprint?.data?.title);
  const { mutate: updateMany } = useBulkUpdate(project_id as string, "blueprint_instances");
  const { mutateAsync: deleteMany } = useDeleteMany("blueprint_instances", arkived === "active", project_id);

  const { data: instances, isLoading } = useGetEntities<BlueprintInstanceType>(
    {
      data: {
        project_id,
        parent_id: item_id,
      },
      relations: {
        blueprint_fields: true,
        tags: true,
      },
      permissions: true,
      filters,
      fields: ["id", "deleted_at", "is_public", "title"],
      relationFilters,
      orderBy,
      pagination,
      arkived: arkived === "arkive",
    },
    "blueprint_instances",
    {
      enabled: !!blueprint?.data,
    }
  );

  useEffect(() => {
    dispatch({ type: "clearSelection" });
    dispatch({ type: "setPagination", payload: { page: 0 } });
  }, [arkived]);

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
  }, [filter, dispatch, arkived]);

  return (
    <div className="overflow-hidden">
      {blueprint?.data ? (
        <Table
          columns={createColumns(
            blueprint?.data,
            blueprint?.data?.title_name || "",
            project_id as string,
            setDrawer,
            setDialog,
            createNotification,
            updateMany,
            user?.webhooks || [],
            permissions,
            isProjectOwner,
            user?.id as string,
            user?.role?.id
          )}
          config={{
            hasSelect: true,
            hasArkived: arkived === "arkive",
            hasTags: true,
            orderBy,
            selection,
            filters,
            relationFilters,
            selectedActions: getSelectedActions(permissions, {
              data: instances?.data || [],
              selection,
              arkived,
              updateMany,
              resetDialog,
              deleteMany,
              dispatch,
              setDialog,
              setDrawer,
            }),
            getLink: (rowData: BlueprintInstanceType) =>
              arkived === "active" ? `/projects/${project_id}/blueprints/${item_id}/${rowData.id}/resources` : "#",
          }}
          data={instances?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          pagination={pagination}
          type="blueprint_instances"
        />
      ) : null}
    </div>
  );
}

