import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Avatar, Badge, Button, createColumnHelper, Dropdown, Table, TablePageLayout, Tooltip } from "../../components";
import { useChangeNavbarTitle, useGetEntities, useGetEntity, useTable } from "../../hooks";
import {
  BlueprintInstanceBlueprintFieldType,
  BlueprintInstanceType,
  DialogAtomType,
  DrawerAtomType,
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
    <div className="flex max-w-full items-center gap-x-2">
      <div className="max-w-full truncate">{titles?.[0]}</div>
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
    </div>
  );
}
const columnHelper = createColumnHelper<BlueprintInstanceType>();

function CharacterColumn({ characters }: { characters: BlueprintInstanceBlueprintFieldType["characters"] }) {
  const { project_id } = useParams();

  return (
    <div className="flex items-center gap-x-2">
      <div className="flex w-full items-center justify-center -space-x-4">
        {characters?.slice(0, 5)?.map((char) => (
          <Avatar
            key={char.related_id}
            image={getImageURL(project_id as string, "images", char?.character?.portrait_id || "")}
            initials={getAvatarInitials(char.character.first_name, char.character?.last_name || "")}
            isBordered
            label={getCharacterFullName(char.character.first_name, char?.character?.last_name || "")}
            size="sm"
            tooltipAllowedPlacements={["left", "right"]}
          />
        ))}
      </div>
      {characters && characters?.length && characters?.length > 5 ? (
        <Tooltip
          content={characters
            ?.slice(5)
            .map((char) => getCharacterFullName(char?.character?.first_name, undefined, char?.character?.last_name))
            .join(", ")}>
          <div className="w-min max-w-min">
            <Badge label={`+${characters.length - 5}`} size="sm" variant="secondary" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}
function BlueprintColumn({ ids }: { ids: string | string[] }) {
  const { data: blueprint_instances } = useGetEntities<BlueprintInstanceType>(
    {
      data: {},
      fields: ["id", "title"],
      filters: { and: [{ field: "id", value: ids, operator: Array.isArray(ids) ? "in" : "eq" }] },
    },
    "blueprint_instances",
    { enabled: !!ids?.length, queryKeyConcat: Array.isArray(ids) ? ids : [ids], staleTime: 3 * 60 * 1000 },
  );

  return (
    <ShowMultipleWithBadge titles={blueprint_instances?.data?.map((blueprint_instance) => blueprint_instance.title) || []} />
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
          id: map_pin.id,
          label: map_pin.title || "",
          icon: map_pin?.icon,
          subItems: [
            {
              id: `go_to_${map_pin.id}`,
              label: `Go to ${map_pin.title}`,
              onClick: () => navigate(`/projects/${project_id}/maps/${map_pin?.parent_id}/${map_pin?.id}`),
            },
            {
              id: `preview_${map_pin.id}`,
              label: `Preview ${map_pin.title} map`,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  type: "entity_preview",
                  size: "half",
                  title: "Preview map",
                  data: { id: map_pin?.parent_id, subitem_id: map_pin.id, entity_type: "maps" },
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
      meta: {
        pinned: true,
      },
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
            const fieldData = row.original?.blueprint_fields?.find((instanceField) => instanceField?.id === field.id);

            if (field.field_type === "text" || field.field_type === "number") return fieldData?.value || "";
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
            if (field.field_type === "images_single" || field.field_type === "images_multiple") {
              return (
                <div className="flex w-full">
                  {fieldData?.images?.map((image) => (
                    <div key={image.related_id} className="-ml-2 flex items-center first:ml-0 hover:z-10">
                      <Avatar
                        hasShowImage
                        image={getImageURL(project_id as string, "images", image.related_id)}
                        label={image.image.title}
                        shape="rounded"
                        size="sm"
                        tooltipAllowedPlacements={["left", "right"]}
                      />
                    </div>
                  ))}
                </div>
              );
            }
            if (field.field_type === "characters_single" || field.field_type === "characters_multiple") {
              return <CharacterColumn characters={fieldData?.characters || []} />;
            }
            if (field.field_type === "documents_single" || field.field_type === "documents_multiple") {
              return <ShowMultipleWithBadge titles={(fieldData?.documents || []).map((doc) => doc.document.title)} />;
            }
            if (field.field_type === "locations_single" || field.field_type === "locations_multiple") {
              return <LocationColumn locations={fieldData?.map_pins || []} />;
            }

            if (field.field_type === "random_table") {
              const randomTable = fieldData
                ? field.random_table?.random_table_options?.find((opt) => opt.id === fieldData?.random_table.option_id)
                : null;
              const subOption =
                randomTable && fieldData?.random_table?.suboption_id
                  ? randomTable.random_table_suboptions?.find((subOpt) => subOpt.id === fieldData?.random_table?.suboption_id)
                  : null;

              return `${randomTable?.title ?? ""} ${subOption ? `(${subOption?.title})` : ""}`;
            }
            // }
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
            if (field.field_type === "blueprints_single" || field.field_type === "blueprints_multiple") {
              return <BlueprintColumn ids={fieldData?.value as string | string[]} />;
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
  const [{ selection, pagination, orderBy }, dispatch] = useTable({
    selection: {},
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { page: 0, limit: 10 },
  });

  const { data: blueprint, isFetching } = useGetEntity<BlueprintType>(item_id, "blueprints", {
    data: {
      id: item_id,
    },
    relations: {
      blueprint_fields: true,
    },
    fields: ["id", "title", "title_name"],
  });
  useChangeNavbarTitle(`Blueprints | ${blueprint?.data?.title}`, !!blueprint?.data?.title);

  const { data: instances, isLoading } = useGetEntities<BlueprintInstanceType>(
    {
      data: {
        project_id,
        parent_id: item_id,
      },
      relations: {
        blueprint_fields: true,
      },
      orderBy,
      pagination,
    },
    "blueprint_instances",
  );

  return (
    <TablePageLayout>
      <div className="flex w-full items-center justify-end gap-x-2">
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
