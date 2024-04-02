import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { Dispatch } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  createColumnHelper,
  Dropdown,
  Table,
  TablePageLayout,
  Tooltip,
} from "../../components";
import {
  useChangeNavbarTitle,
  useDeleteMany,
  useGetEntities,
  useGetEntity,
  useHasPermissions,
  useTable,
  useUpdateManyPublic,
} from "../../hooks";
import {
  BlueprintInstanceBlueprintFieldType,
  BlueprintInstanceType,
  DeleteManyType,
  DialogAtomType,
  DrawerAtomType,
  NotificationType,
  TableDispatch,
  TableSelectedAction,
  TableSelectionType,
  UpdatePublicManyType,
  UserHasPermissionsType,
  WebhookType,
} from "../../types";
import { BlueprintType } from "../../types/EntityTypes/blueprintTypes";
import {
  baseURLS,
  BooleanFilters,
  CharacterBlueprintRelationFilter,
  dialogAtom,
  DiceRollRegex,
  drawerAtom,
  FetchFunction,
  getAvatarInitials,
  getBlueprintInstanceColumnWidth,
  getDayOrdinal,
  getImageURL,
  hasActionPermission,
  IconEnum,
  isProjectOwnerAtom,
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

function ShowMultipleWithBadge({ titles }: { titles: string[] }) {
  return (
    <div className="flex max-w-full items-center gap-x-2">
      <div className="max-w-full truncate">{titles?.[0]}</div>
      {titles?.length > 1 ? (
        <Tooltip
          content={titles
            ?.slice(1)
            ?.map((title) => title)
            .join(", ")}
          isPortal>
          <div className="w-min max-w-min">
            <Badge label={`+${titles.length - 1}`} size="sm" variant="secondary" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}

function CharacterColumn({ characters }: { characters: BlueprintInstanceBlueprintFieldType["characters"] }) {
  const { project_id } = useParams();

  return (
    <div className="flex w-full items-center gap-x-2">
      <div className="z-0 flex w-full items-center justify-center -space-x-4">
        {characters?.slice(0, 5)?.map((char) => (
          <Avatar
            key={char.related_id}
            image={getImageURL(project_id as string, "images", char?.character?.portrait_id || "")}
            initials={getAvatarInitials(char?.character?.full_name || "")}
            isBordered
            label={char?.character?.full_name || ""}
            size="sm"
            tooltipAllowedPlacements={["left", "right"]}
          />
        ))}
      </div>
      {characters && characters?.length && characters?.length > 5 ? (
        <Tooltip
          content={characters
            ?.slice(5)
            .map((char) => char.character.full_name || "")
            .join(", ")}>
          <div className="w-min max-w-min">
            <Badge label={`+${characters.length - 5}`} size="sm" variant="secondary" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}

function LocationColumn({ locations }: { locations: BlueprintInstanceBlueprintFieldType["map_pins"] }) {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const setDrawer = useSetAtom(drawerAtom);

  return (
    <div className="group flex w-full max-w-full items-center gap-x-2 truncate">
      <ShowMultipleWithBadge titles={(locations || [])?.map((l) => l?.map_pin?.title || "").filter((l) => !!l)} />
      <Dropdown
        allowedPlacements={["left-start"]}
        items={(locations || []).map(({ map_pin }) => ({
          id: map_pin?.id,
          title: map_pin?.title || "",
          icon: map_pin?.icon,
          subItems: [
            {
              id: `go_to_${map_pin?.id}`,
              title: `Go to ${map_pin?.title}`,
              onClick: () => navigate(`/projects/${project_id}/maps/${map_pin?.parent_id}/${map_pin?.id}`),
            },
            {
              id: `preview_${map_pin?.id}`,
              title: `Preview ${map_pin?.title} map`,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  type: "entity_preview",
                  size: "half",
                  title: "Preview map",
                  data: { parent_id: map_pin?.parent_id, id: map_pin?.id, entity_type: "map_pins" },
                })),
            },
          ],
        }))}>
        <div className="pointer-events-none w-min max-w-min opacity-0 transition-all group-hover:pointer-events-auto group-hover:opacity-100">
          <Button hasNoBackground icon={IconEnum.chevron_down} iconSize={14} isIconOnly onClick={undefined} size="2xs" />
        </div>
      </Dropdown>
    </div>
  );
}

function EventColumn({ locations }: { locations: BlueprintInstanceBlueprintFieldType["events"] }) {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const setDrawer = useSetAtom(drawerAtom);

  return (
    <div className="group flex w-full max-w-full items-center gap-x-2 truncate">
      <ShowMultipleWithBadge titles={(locations || [])?.map((l) => l?.event?.title || "").filter((l) => !!l)} />
      <Dropdown
        allowedPlacements={["left-start"]}
        items={(locations || []).map(({ event }) => ({
          id: event?.id,
          title: event?.title || "",
          subItems: [
            {
              id: `go_to_${event?.id}`,
              title: `Go to ${event?.title}`,
              onClick: () => navigate(`/projects/${project_id}/calendars/${event?.parent_id}/${event?.id}`),
            },
            {
              id: `preview_${event?.id}`,
              title: `Preview event ${event?.title}`,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  type: "entity_preview",
                  size: "half",
                  title: `Preview event - ${event?.title}`,
                  data: { id: event?.id, parent_id: event?.parent_id, entity_type: "events" },
                })),
            },
          ],
        }))}>
        <div className="pointer-events-none w-min max-w-min opacity-0 transition-all group-hover:pointer-events-auto group-hover:opacity-100">
          <Button hasNoBackground icon={IconEnum.chevron_down} iconSize={14} isIconOnly onClick={undefined} size="2xs" />
        </div>
      </Dropdown>
    </div>
  );
}

function createColumns(
  blueprint: BlueprintType,
  title_name: string,
  project_id: string,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  createNotification: (notification: Omit<NotificationType, "id">) => void,
  updatePublicMany: UseMutateAsyncFunction<
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
  webhooks: WebhookType[],
  permissions: UserHasPermissionsType,
  isProjectOwner: boolean,
  user_id: string,
  user_role_id: string | undefined,
) {
  const fieldColumns = [
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
              return <CharacterColumn characters={fieldData?.characters || []} />;
            }
            if (field.field_type === "blueprints_single" || field.field_type === "blueprints_multiple") {
              return (
                <ShowMultipleWithBadge
                  titles={(fieldData?.blueprint_instances || []).map((instance) => instance.blueprint_instance.title)}
                />
              );
            }
            if (field.field_type === "documents_single" || field.field_type === "documents_multiple") {
              return <ShowMultipleWithBadge titles={(fieldData?.documents || []).map((doc) => doc.document.title)} />;
            }
            if (field.field_type === "locations_single" || field.field_type === "locations_multiple") {
              return <LocationColumn locations={fieldData?.map_pins || []} />;
            }
            if (field.field_type === "events_single" || field.field_type === "events_multiple") {
              return <EventColumn locations={fieldData?.events || []} />;
            }
            if (field.field_type === "images_single" || field.field_type === "images_multiple") {
              return (
                <div className="flex w-full">
                  {fieldData?.images?.map((image) => (
                    <div key={image.related_id} className="-ml-4 flex items-center first:ml-0 hover:z-10">
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
                : undefined,
            ),
            relationType: field.field_type,
            isRelationFilter: true,
          },
          minSize,
          maxSize,
        }),
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
          onClick={async () => {
            await updatePublicMany({ data: { ids: [row.original.id], is_public: !row.original.is_public } });
          }}
        />
      ),
      minSize: 3.25,
      maxSize: 3.25,
    }),
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
                        user_role_id,
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
                        user_role_id,
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
                        user_role_id,
                      ),
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          data: row.original,
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
                      onClick: () => window.open(`/public/${project_id}/blueprints/${row.original.id}`, "_blank"),
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
                        user_role_id,
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
    }),
  );

  return fieldColumns;
}

function getSelectedActions(
  permissions: UserHasPermissionsType,
  {
    selection,
    updatePublicMany,
    resetDialog,
    deleteMany,
    dispatch,
    data,
    setDrawer,
    setDialog,
  }: {
    updatePublicMany: UpdatePublicManyType;
    deleteMany: DeleteManyType;
    selection: TableSelectionType | undefined;
    setDrawer: Dispatch<SetStateAction<DrawerAtomType>>;
    setDialog: Dispatch<SetStateAction<DialogAtomType>>;
    resetDialog: () => unknown;
    data: BlueprintInstanceType[];
    dispatch: TableDispatch;
  },
) {
  const selectedActions: TableSelectedAction[] = [];
  if (permissions?.update_blueprint_instances) {
    selectedActions.push(
      {
        icon: IconEnum.eye,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Set public",
        onClick: async () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const entitesNotFolders = (data || [])?.filter((e) => ids.includes(e.id));
          if (entitesNotFolders.length) {
            await updatePublicMany({ data: { ids, is_public: true } });
            dispatch({ type: "clearSelection" });
          }
        },
      },
      {
        icon: IconEnum.eye_slash,
        hasNoBackground: true,
        isIconOnly: true,
        tooltip: "Set private",
        onClick: async () => {
          const ids = Object.values(selection || {}).flatMap((id) => id);
          const entitesNotFolders = (data || [])?.filter((e) => ids.includes(e.id));
          if (entitesNotFolders.length) {
            await updatePublicMany({ data: { ids, is_public: false } });
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
      },
    );
  }
  if (permissions?.is_owner) {
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
  }
  if (permissions?.delete_blueprint_instances) {
    selectedActions.push({
      icon: IconEnum.trash,
      variant: "error",
      hasNoBackground: true,
      isIconOnly: true,
      tooltip: "Delete selected rows",
      onClick: () => {
        const ids = Object.values(selection || {}).flatMap((id) => id);
        if (ids.length) {
          setDialog((prev) => ({
            ...prev,
            title: "Delete many",
            description: `Are you sure you want to delete ${ids.length} ${
              ids.length === 1 ? "blueprint instance" : "blueprint_instances"
            }?`,
            warning: "This action cannot be undone.",
            isOverlay: true,
            cancel: {
              label: "Cancel",
              variant: "primary",
              action: resetDialog,
            },
            confirm: {
              label: "Delete",
              icon: IconEnum.trash,
              action: async () =>
                deleteMany(
                  { data: { ids } },
                  {
                    onSuccess: () => dispatch({ type: "clearSelection" }),
                  },
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

export function BlueprintInstanceView({ arkived }: { arkived: "active" | "arkive" }) {
  const { project_id, item_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const resetDialog = useResetAtom(dialogAtom);

  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(
    ["read_blueprint_instances", "update_blueprint_instances", "delete_blueprint_instances"],
    undefined,
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
  useChangeNavbarTitle(`Blueprints | ${blueprint?.data?.title}`, !!blueprint?.data?.title);
  const { mutateAsync: updatePublicMany } = useUpdateManyPublic("blueprint_instances", project_id as string);
  const { mutateAsync: deleteMany } = useDeleteMany("blueprint_instances", project_id);

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
    },
  );

  return (
    <TablePageLayout>
      <div>
        {blueprint?.data ? (
          <Table
            columns={createColumns(
              blueprint?.data,
              blueprint?.data?.title_name || "",
              project_id as string,
              setDrawer,
              setDialog,
              createNotification,
              updatePublicMany,
              user?.webhooks || [],
              permissions,
              isProjectOwner,
              user?.id as string,
              user?.role?.id,
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
                updatePublicMany,
                resetDialog,
                deleteMany,
                dispatch,
                setDialog,
                setDrawer,
              }),
              getLink: (rowData: BlueprintInstanceType) =>
                `/projects/${project_id}/blueprints/${item_id}/${rowData.id}/resources`,
            }}
            data={instances?.data || []}
            dispatch={dispatch}
            isLoading={isLoading}
            pagination={pagination}
            type="blueprint_instances"
          />
        ) : null}
      </div>
    </TablePageLayout>
  );
}
