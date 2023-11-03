import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Avatar,
  Badge,
  Button,
  createColumnHelper,
  Dropdown,
  Skeleton,
  Table,
  TablePageLayout,
  Tooltip,
} from "../../components";
import { useChangeNavbarTitle, useGetEntities, useGetEntity, useTable } from "../../hooks";
import {
  BlueprintInstanceType,
  CharacterType,
  DialogAtomType,
  DrawerAtomType,
  MapPinType,
  NotificationType,
} from "../../types";
import { BlueprintType } from "../../types/EntityTypes/blueprintTypes";
import {
  dialogAtom,
  DiceRollRegex,
  drawerAtom,
  getAvatarInitials,
  getBlueprintInstanceColumnWidth,
  getCharacterFullName,
  getImageURL,
  IconEnum,
  rollDiceWithNotification,
  useNotifications,
} from "../../utils";

function ShowMultipleWithBadge({ titles }: { titles: string[] }) {
  return (
    <>
      <div className="w-full truncate">{titles?.[0]}</div>
      {titles?.length > 1 ? (
        <Tooltip
          content={titles
            ?.slice(1)
            ?.map((title) => title)
            .join(", ")}>
          <div className="w-min max-w-min">
            <Badge label={`+${titles.length - 1}`} size="sm" variant="secondary" />
          </div>
        </Tooltip>
      ) : null}
    </>
  );
}
const columnHelper = createColumnHelper<BlueprintInstanceType>();

function CharacterColumn({ ids }: { ids: string | string[] }) {
  const { project_id } = useParams();
  const { data: characters, isFetching } = useGetEntities<CharacterType>(
    {
      data: { project_id },
      fields: ["id", "first_name", "last_name", "portrait_id"],
      filters: { and: [{ field: "id", value: ids, operator: Array.isArray(ids) ? "in" : "eq" }] },
    },
    "characters",
    { enabled: !!ids.length, queryKeyConcat: Array.isArray(ids) ? ids : [ids], staleTime: 3 * 60 * 1000 },
  );
  if (isFetching) return <Skeleton limit={ids.length > 1 ? 5 : 1} type="avatar" />;
  return (
    <div className="flex items-center gap-x-2">
      <div className="flex w-full items-center justify-center -space-x-4">
        {characters?.data?.slice(0, 5)?.map((char) => (
          <Avatar
            key={char.id}
            image={getImageURL(project_id as string, "images", char?.portrait_id || "")}
            initials={getAvatarInitials(char.first_name, char?.last_name || "")}
            isBordered
            label={getCharacterFullName(char.first_name, char?.last_name || "")}
            size="sm"
            tooltipAllowedPlacements={["left", "right"]}
          />
        ))}
      </div>
      {characters?.data && characters?.data?.length > 5 ? (
        <Tooltip
          content={characters?.data
            .slice(5)
            .map((char) => getCharacterFullName(char?.first_name, undefined, char?.last_name))
            .join(", ")}>
          <div className="w-min max-w-min">
            <Badge label={`+${characters.data.length - 5}`} size="sm" variant="secondary" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}
// function DocumentColumn({ ids }: { ids: string | string[] }) {
//   const { project_id } = useParams();
//   const { data: documents, isFetching } = useGetEntities<DocumentType>(
//     {
//       data: { project_id },
//       fields: ["id", "title", "icon", "image_id"],
//       filters: { and: [{ field: "id", value: ids, operator: Array.isArray(ids) ? "in" : "eq" }] },
//     },
//     "documents",
//     { enabled: !!ids.length, queryKeyConcat: Array.isArray(ids) ? ids : [ids], staleTime: 3 * 60 * 1000 },
//   );
//   if (isFetching) return <Skeleton limit={ids.length > 1 ? 5 : 1} type="avatar" />;
//   return (
//     <div className="flex items-center gap-x-2">
//       <ShowMultipleWithBadge titles={(documents?.data || []).map((doc) => doc.title)} />
//     </div>
//   );
// }
function LocationColumn({ ids }: { ids: string | string[] }) {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const setDrawer = useSetAtom(drawerAtom);
  const { data: locations, isFetching } = useGetEntities<MapPinType>(
    {
      data: { project_id },
      fields: ["id", "title", "icon", "image_id", "parent_id"],
      filters: {
        and: [
          { field: "id", value: ids, operator: Array.isArray(ids) ? "in" : "eq" },
          { field: "title", operator: "is not", value: null },
          { field: "character_id", operator: "is", value: null },
        ],
      },
    },
    "map_pins",
    { enabled: ids?.length > 0, queryKeyConcat: Array.isArray(ids) ? ids : [ids], staleTime: 3 * 60 * 1000 },
  );
  if (isFetching) return <Skeleton limit={ids.length > 1 ? 5 : 1} type="avatar" />;
  return (
    <div className="group flex w-full max-w-full items-center gap-x-2 truncate">
      <ShowMultipleWithBadge titles={(locations?.data || [])?.map((l) => l?.title || "").filter((l) => !!l)} />
      <Dropdown
        allowedPlacements={["left-start"]}
        items={(locations?.data || []).map((loc) => ({
          id: loc.id,
          label: loc.title || "",
          icon: loc?.icon,
          subItems: [
            {
              id: `go_to_${loc.id}`,
              label: `Go to ${loc.title}`,
              onClick: () => navigate(`/projects/${project_id}/maps/${loc?.parent_id}/${loc?.id}`),
            },
            {
              id: `preview_${loc.id}`,
              label: `Preview ${loc.title} map`,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  type: "entity_preview",
                  size: "half",
                  title: "Preview map",
                  data: { id: loc.parent_id, subitem_id: loc.id, entity_type: "maps" },
                })),
            },
          ],
        }))}>
        <div className="pointer-events-none w-min max-w-min opacity-0 transition-all group-hover:pointer-events-auto group-hover:opacity-100">
          <Button hasNoBackground icon={IconEnum.chevron_down} iconSize={14} isIconOnly onClick={undefined} size="xxs" />
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
) {
  const fieldColumns = [
    columnHelper.accessor("title", {
      id: "title",
      header: title_name,
      cell: ({ row }) => row.original?.title || "",
      minSize: 15,
    }),
  ];

  blueprint.blueprint_fields
    ?.filter((field) => field.field_type !== "textarea")
    .slice(0, 6)
    .forEach((field) => {
      const { minSize, maxSize } = getBlueprintInstanceColumnWidth(field.field_type);
      fieldColumns.push(
        columnHelper.display({
          id: field.title,
          header: field.title,
          cell: ({ row }) => {
            const fieldData = row.original?.blueprint_fields?.find(
              (instanceField) => instanceField?.value?.id === field.id,
            )?.value;
            const value =
              fieldData?.value && fieldData?.value?.value
                ? `${fieldData?.value?.value} ${
                    fieldData?.value?.subOptionValue ? `- ${fieldData?.value?.subOptionValue}` : ""
                  }`
                : "";
            // const date =
            //   field.field_type === "date" ? (fieldData?.value?.value as { day: number; year: number; month: string }) : null;
            if ((field.field_type === "text" || field.field_type === "number") && value) return value;
            if ((field.field_type === "select" || field.field_type === "select_multiple") && value) {
              return (
                (Array.isArray(fieldData?.value?.value) ? fieldData?.value?.value : [fieldData?.value?.value])
                  ?.map((id) => {
                    const opt = field?.options?.find((o) => o.id === id);
                    return opt?.value || "";
                  })
                  .join(", ") ?? ""
              );
            }
            if (field.field_type === "images_single" || field.field_type === "images_multiple") {
              return (
                <Avatar
                  hasShowImage
                  image={getImageURL(project_id as string, "images", fieldData?.value?.value as string)}
                  size="sm"
                />
              );
            }
            if (field.field_type === "characters_single" || field.field_type === "characters_multiple") {
              return <CharacterColumn ids={fieldData?.value?.value as string | string[]} />;
            }
            if (field.field_type === "locations_single" || field.field_type === "locations_multiple") {
              return <LocationColumn ids={fieldData?.value?.value as string | string[]} />;
            }

            if (field.field_type === "random_table") {
              const randomTable =
                field.field_type === "random_table" && fieldData
                  ? blueprint?.blueprint_fields
                      .find((f) => f.id === field?.id)
                      ?.random_table?.random_table_options?.find((opt) => opt.id === fieldData?.value?.value)
                  : null;

              const subOption =
                randomTable && fieldData?.value?.subOptionValue
                  ? randomTable.suboptions?.find((subOpt) => subOpt.id === fieldData?.value?.subOptionValue)
                  : null;

              return `${randomTable?.title ?? ""} ${subOption ? `(${subOption?.title})` : ""}`;
            }
            if (field.field_type === "dice_roll" && field?.formula) {
              return (
                <div className="flex items-center gap-x-2 [&>button]:px-0">
                  <span>{(fieldData?.value?.value as number) || ""}</span>
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
            centered: field.field_type === "images_single",
            noLink: ["images_single", "images_multiple", "locations_single", "locations_multiple", "dice_roll"].includes(
              field.field_type,
            ),
          },
          minSize,
          maxSize,
        }),
      );
    });

  fieldColumns.push(
    columnHelper.display({
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
                label: "Edit instance",
                icon: IconEnum.edit,
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
                id: "delete_instance",
                label: "Delete instance",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "blueprint_instances",
                    },
                    title: "Delete instance",
                    size: "sm",
                    type: "delete_entity",
                  }));
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  );
  return fieldColumns;
}

export function BlueprintInstanceView() {
  const { project_id, item_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const createNotification = useNotifications();
  const [{ selection, pagination }, dispatch] = useTable({ selection: {}, pagination: { page: 0, limit: 10 } });

  const { data: blueprint, isFetching } = useGetEntity<BlueprintType>(item_id, "blueprints", {
    data: {
      id: item_id,
    },
    relations: {
      blueprint_fields: true,
    },
    fields: ["id", "title", "title_name"],
  });
  useChangeNavbarTitle(` Blueprints | ${blueprint?.data?.title}`, !!blueprint?.data?.title);

  const { data: instances, isLoading } = useGetEntities<BlueprintInstanceType>(
    {
      data: {
        project_id,
        parent_id: item_id,
      },

      pagination,
    },
    "blueprint_instances",
  );

  return (
    <TablePageLayout>
      <div className="sticky top-0 flex w-full items-center justify-end gap-x-2">
        <div className="w-52">
          <Button
            icon={IconEnum.add}
            isDisabled={isFetching}
            label={`Create ${blueprint?.data?.title ? `(${blueprint?.data?.title})` : ""}`}
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: {},
                title: `Create new ${blueprint?.data?.title}`,
                type: "blueprint_instances",
                size: "lg",
              }))
            }
          />
        </div>
      </div>
      <div className="w-full flex-1 overflow-hidden">
        {blueprint?.data ? (
          <Table
            columns={createColumns(
              blueprint?.data,
              blueprint?.data?.title_name || "",
              project_id as string,
              setDrawer,
              setDialog,
              createNotification,
            )}
            config={{
              hasSelect: true,
              selection,
              getLink: (rowData: BlueprintInstanceType) =>
                `/projects/${project_id}/blueprints/${item_id}/${rowData.id}/resources`,
            }}
            data={instances?.data || []}
            dispatch={dispatch}
            isLoading={isLoading}
            pagination={pagination}
            type="characters"
          />
        ) : null}
      </div>
    </TablePageLayout>
  );
}
