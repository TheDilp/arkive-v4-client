import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";

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
import { BlueprintInstanceType, CharacterType, DialogAtomType, DrawerAtomType, MapPinType } from "../../types";
import { BlueprintType } from "../../types/EntityTypes/blueprintTypes";
import { dialogAtom, drawerAtom, getAvatarInitials, getCharacterFullName, getImageURL, IconEnum } from "../../utils";

const columnHelper = createColumnHelper<{ id: string; title: string; value: { id: string; value: any }[] }>();

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
function LocationColumn({ ids }: { ids: string | string[] }) {
  const { project_id } = useParams();
  const { data: locations, isFetching } = useGetEntities<MapPinType>(
    {
      data: { project_id },
      fields: ["id", "title", "icon", "image_id"],
      filters: {
        and: [
          { field: "id", value: ids, operator: Array.isArray(ids) ? "in" : "eq" },
          { field: "character_id", operator: "is", value: null },
        ],
      },
    },
    "map_pins",
    { enabled: !!ids.length, queryKeyConcat: Array.isArray(ids) ? ids : [ids], staleTime: 3 * 60 * 1000 },
  );
  if (isFetching) return <Skeleton limit={ids.length > 1 ? 5 : 1} type="avatar" />;
  return (
    <div className="flex items-center gap-x-2">
      <div className="flex w-full items-center justify-center -space-x-4">
        {locations?.data?.slice(0, 5)?.map((location) => location?.title)}
      </div>
      {locations?.data && locations?.data?.length > 5 ? (
        <Tooltip
          content={locations?.data
            .slice(5)
            .map((location) => location.title)
            .join(", ")}>
          <div className="w-min max-w-min">
            <Badge label={`+${locations.data.length - 5}`} size="sm" variant="secondary" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}

function createColumns(
  blueprint: BlueprintType,
  project_id: string,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
) {
  const fieldColumns = [
    columnHelper.accessor("title", {
      id: "title",
      header: blueprint?.title_name,
      cell: ({ row }) => row.original?.title || "",
      minSize: 15,
    }),
  ];

  blueprint.blueprint_fields
    .filter((field) => field.field_type !== "textarea")
    .slice(0, 6)
    .forEach((field) => {
      fieldColumns.push(
        columnHelper.display({
          id: field.title,
          header: field.title,
          cell: ({ row }) => {
            const fieldData = row.original?.value?.find((val) => val?.id === field.id);
            const value =
              fieldData?.value && fieldData?.value?.value
                ? `${fieldData?.value?.value} ${
                    fieldData?.value?.subOptionValue ? `- ${fieldData?.value?.subOptionValue}` : ""
                  }`
                : "";

            // const date =
            //   field.field_type === "date" ? (fieldData?.value?.value as { day: number; year: number; month: string }) : null;
            if ((field.field_type === "text" || field.field_type === "number" || field.field_type === "dice_roll") && value)
              return value;
            if ((field.field_type === "select" || field.field_type === "select_multiple") && value) {
              return (Array.isArray(fieldData?.value?.value) ? fieldData?.value?.value : [fieldData?.value?.value])
                ?.map((id: string) => {
                  const opt = field?.options?.find((o) => o.id === id);
                  return opt?.value || "";
                })
                .join(", ");
            }
            if (field.field_type === "images_single") {
              return (
                <Avatar hasShowImage image={getImageURL(project_id as string, "images", fieldData?.value?.value)} size="sm" />
              );
            }
            if (field.field_type === "characters_single" || field.field_type === "characters_multiple") {
              return <CharacterColumn ids={fieldData?.value?.value} />;
            }
            if (field.field_type === "locations_single" || field.field_type === "locations_multiple") {
              return <LocationColumn ids={fieldData?.value?.value} />;
            }

            if (field.field_type === "random_table") {
              const randomTable =
                field.field_type === "random_table"
                  ? blueprint?.blueprint_fields
                      .find((f) => f.id === field?.id)
                      ?.random_table?.random_table_options?.find((opt) => opt.id === fieldData?.value?.value)
                  : null;

              const subOption = randomTable
                ? randomTable.suboptions?.find((subOpt) => subOpt.id === fieldData?.value?.subOptionValue)
                : null;

              return `${randomTable?.title} ${subOption ? `(${subOption?.title})` : ""}`;
            }

            return "";
          },
          minSize: 10,
          maxSize: 15,
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
  const [{ selection, pagination }, dispatch] = useTable({ selection: {}, pagination: { page: 0, limit: 10 } });

  const { data, isFetching } = useGetEntity<BlueprintType>(item_id, "blueprints", {
    data: {
      id: item_id,
    },
    relations: {
      blueprint_instances: true,
      blueprint_fields: true,
      random_table_options: true,
    },
  });
  useChangeNavbarTitle(`The Arkive | Blueprints | ${data?.data?.title}`, !!data?.data?.title);

  const { data: instances } = useGetEntities<BlueprintInstanceType>(
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
            label={`Create ${data?.data?.title ? `(${data?.data?.title})` : ""}`}
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: {},
                title: `Create new ${data?.data?.title}`,
                type: "blueprint_instances",
                size: "lg",
              }))
            }
          />
        </div>
      </div>
      <div className="w-full flex-1 overflow-hidden">
        {data?.data ? (
          <Table
            columns={createColumns(data?.data, project_id as string, setDrawer, setDialog)}
            config={{
              hasSelect: true,
              selection,
            }}
            data={instances?.data || []}
            dispatch={dispatch}
            //   isLoading={isLoading}

            pagination={pagination}
            type="characters"
          />
        ) : null}
      </div>
    </TablePageLayout>
  );
}
