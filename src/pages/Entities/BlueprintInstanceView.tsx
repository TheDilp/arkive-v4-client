import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Table, TablePageLayout } from "../../components";
import { useChangeNavbarTitle, useGetEntities, useGetEntity, useTable } from "../../hooks";
import { BlueprintInstanceType, DialogAtomType, DrawerAtomType } from "../../types";
import { BlueprintType } from "../../types/EntityTypes/blueprintTypes";
import { dialogAtom, drawerAtom, IconEnum } from "../../utils";

const columnHelper = createColumnHelper<{ id: string; title: string; value: { id: string; value: any }[] }>();
function createColumns(
  blueprint: BlueprintType,
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
    .filter((field) => !["characters_single", "characters_multiple", "textarea"].includes(field.field_type))
    .slice(0, 4)
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
            // const randomTable =
            //   field.field_type === "random_table"
            //     ? blueprint?.blueprint_fields
            //         .find((f) => f.id === field?.id)
            //         ?.random_table_options?.find((opt) => opt.id === fieldData?.value?.value)
            //     : null;

            // const subOption = randomTable
            //   ? randomTable.suboptions?.find((subOpt) => subOpt.id === fieldData?.value?.subOptionValue)
            //   : null;

            // const date =
            //   field.field_type === "date" ? (fieldData?.value?.value as { day: number; year: number; month: string }) : null;
            if ((field.field_type === "text" || field.field_type === "number" || field.field_type === "dice_roll") && value)
              return value;
            if (field.field_type === "select" || (field.field_type === "select_multiple" && value)) {
              return fieldData?.value?.value
                .map((id: string) => {
                  const opt = field?.options?.find((o) => o.id === id);
                  return opt?.value || "";
                })
                .join(", ");
            }

            return "";
          },
          minSize: 15,
          maxSize: 20,
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
  const { item_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const [, dispatch] = useTable({});

  const { data, isFetching } = useGetEntity<BlueprintType>(item_id, "blueprints", {
    data: {
      id: item_id,
    },
    relations: {
      blueprint_instances: true,
      blueprint_fields: true,
    },
  });
  useChangeNavbarTitle(`The Arkive | Blueprints | ${data?.data?.title}`, !!data?.data?.title);

  const { data: instances } = useGetEntities<BlueprintInstanceType>(
    {
      data: {
        project_id: "",
        parent_id: item_id,
      },
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
            columns={createColumns(data?.data, setDrawer, setDialog)}
            config={{
              hasSelect: true,
            }}
            data={instances?.data || []}
            dispatch={dispatch}
            //   isLoading={isLoading}
            //   pagination={pagination}
            type="characters"
          />
        ) : null}
      </div>
    </TablePageLayout>
  );
}
