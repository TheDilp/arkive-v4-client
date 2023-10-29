import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Table, TablePageLayout } from "../../components";
import { useGetEntities, useGetEntity, useTable } from "../../hooks";
import { BlueprintInstanceType, DialogAtomType, DrawerAtomType } from "../../types";
import { BlueprintType } from "../../types/EntityTypes/blueprintTypes";
import { dialogAtom, drawerAtom, IconEnum } from "../../utils";

const columnHelper = createColumnHelper<any>();
function createColumns(
  blueprint: BlueprintType,
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
) {
  const fieldColumns = blueprint.blueprint_fields
    .filter((field) => !["characters_single", "characters_multiple"].includes(field.field_type))
    .map((field) =>
      columnHelper.display({
        id: field.title,
        header: field.title,
        cell: () => {
          // if (field.field_type === "text") return info.row.original.
          return "test";
        },
      }),
    );

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

  const { data } = useGetEntity<BlueprintType>(item_id, "blueprints", {
    data: {
      id: item_id,
    },
    relations: {
      blueprint_instances: true,
      blueprint_fields: true,
    },
  });
  useGetEntities<BlueprintInstanceType>(
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
            label={`Create (${data?.data?.title})`}
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
            data={data?.data?.blueprint_instances || []}
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
