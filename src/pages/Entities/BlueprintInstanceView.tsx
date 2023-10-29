import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Table, TablePageLayout } from "../../components";
import { useGetEntities, useGetEntity, useTable } from "../../hooks";
import { BlueprintInstanceType } from "../../types";
import { BlueprintType } from "../../types/EntityTypes/blueprintTypes";
import { IconEnum } from "../../utils";

const columnHelper = createColumnHelper<any>();
function createColumns(blueprint: BlueprintType) {
  return blueprint.blueprint_fields
    .filter((field) => !["characters_single", "characters_multiple"].includes(field.field_type))
    .map((field) =>
      columnHelper.accessor(field.title, {
        id: field.title,
        header: field.title,
        cell: () => "test",
      }),
    );
}

// function createColumns(fields: CharacterFieldType[]) {
//   return fields.map((field) => {
//     if (field.field_type === "text")
//       return columnHelper.accessor(field.title, {
//         id: field.id,
//         header: capitalizeFirstLetter(field.title),
//         cell: "Cell",
//       });
//   });
//   // columnHelper.display({
//   //   id: "action",
//   //   header: "Actions",
//   //   meta: {
//   //     centered: true,
//   //   },
//   //   cell: () => (
//   //     <div className="flex items-center justify-center">
//   //       <Dropdown
//   //         allowedPlacements={["left", "left-start", "left-end"]}
//   //         items={[
//   //           {
//   //             id: "1",
//   //             label: "Edit character",
//   //             icon: IconEnum.edit,
//   //             onClick: () => {
//   //               // setDrawer((prev) => ({
//   //               //   ...prev,
//   //               //   data: row.original,
//   //               //   title: `Edit character - ${getCharacterFullName(row.original.first_name, "", row.original?.last_name)}`,
//   //               //   size: "lg",
//   //               //   type: "characters",
//   //               // }));
//   //             },
//   //           },

//   //           {
//   //             id: "2",
//   //             label: "View relationship tree",
//   //             icon: IconEnum.family_tree,
//   //             onClick: () => {
//   //               // setDialog({
//   //               //   type: "family_tree",
//   //               //   title: `Relationship tree of ${getCharacterFullName(
//   //               //     row.original.first_name,
//   //               //     "",
//   //               //     row.original?.last_name || "",
//   //               //   )}`,
//   //               //   data: { id: row.original.id },
//   //               //   size: "lg",
//   //               // });
//   //             },
//   //           },
//   //           {
//   //             id: "delete_character",
//   //             label: "Delete character",
//   //             icon: IconEnum.trash,
//   //             onClick: () => {
//   //               // setDialog((prev) => ({
//   //               //   ...prev,
//   //               //   data: {
//   //               //     ...row.original,
//   //               //     entity_title: "characters",
//   //               //   },
//   //               //   title: "Delete character",
//   //               //   size: "sm",
//   //               //   type: "delete_entity",
//   //               // }));
//   //             },
//   //           },
//   //         ]}>
//   //         <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
//   //       </Dropdown>
//   //     </div>
//   //   ),
//   // }),
// }

export function BlueprintInstanceView() {
  const { item_id } = useParams();
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
            onClick={
              () => {}
              //   setDrawer((prev) => ({
              //     ...prev,
              //     data: {},
              //     title: "Create new word",
              //     type: "words",
              //     size: "lg",
              //   }))
            }
          />
        </div>
      </div>
      <div className="w-full flex-1 overflow-hidden">
        {data?.data ? (
          <Table
            columns={createColumns(data?.data)}
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
