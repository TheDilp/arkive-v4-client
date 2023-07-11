import { Avatar, Button, createColumnHelper, Dropdown, Select, Table, TablePageLayout } from "../../components";
import { useChangeNavbarTitle, useGetAllEntities, useTable } from "../../hooks";
import { CharacterType, DialogAtomType, DrawerAtomType } from "../../types";
import {
  dialogAtom,
  drawerAtom,
  getAvatarInitials,
  getCharacterFullName,
  getImageURL,
  IconEnum,
  NameFilters,
  NumberFilters,
  SetStateAction,
  useSetAtom,
} from "../../utils";
import { Dispatch, useState } from "react";
import { useParams } from "react-router-dom";

const columnHelper = createColumnHelper<CharacterType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  archived: boolean,
) {
  return [
    columnHelper.display({
      id: "imageId",
      header: "Portrait",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            image={getImageURL(row.original.projectId, "images", row.original?.image?.title || "")}
            initials={getAvatarInitials(row.original.firstName, row.original?.lastName || "")}
            isBordered
            isTooltipDisabled
            label={getCharacterFullName(row.original.firstName, row.original?.lastName || "")}
            size="sm"
          />
        </div>
      ),
      minSize: 5,
      maxSize: 5,
    }),
    columnHelper.accessor("firstName", {
      id: "firstName",
      header: "First name",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: NameFilters,
      },
    }),
    columnHelper.accessor("lastName", {
      id: "lastName",
      header: "Last name",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: NameFilters,
      },
    }),
    columnHelper.accessor("nickname", {
      id: "nickname",
      header: "Nickname",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: NameFilters,
      },
      maxSize: 20,
    }),
    columnHelper.accessor("age", {
      id: "age",
      header: "Age",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        centered: true,
        filterOptions: NumberFilters,
      },
      minSize: 6,
      maxSize: 6,
    }),
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
                label: "Edit character",
                icon: IconEnum.edit,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    data: row.original,
                    title: "Edit character",
                    size: "lg",
                    type: "characters",
                  }));
                },
              },
              ...(archived
                ? [
                    {
                      id: "2",
                      label: "Restore character",
                      icon: IconEnum.export,
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "characters",
                          },
                          title: "Restore character",
                          size: "sm",
                          type: "archive_entity",
                        }));
                      },
                    },
                    {
                      id: "3",
                      label: "Delete character",
                      icon: IconEnum.trash,
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "characters",
                          },
                          title: "Delete character",
                          size: "sm",
                          type: "delete_entity",
                        }));
                      },
                    },
                  ]
                : [
                    {
                      id: "2",
                      label: "Archive character",
                      icon: IconEnum.archive,
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "characters",
                          },
                          title: "Archive character",
                          size: "sm",
                          type: "archive_entity",
                        }));
                      },
                    },
                  ]),
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}

export function CharactersView() {
  useChangeNavbarTitle("The Arkive | Characters");
  const [view, setView] = useState<"card" | "list">("list");
  const [archived, setArchived] = useState<"active" | "archived">("active");
  const { projectId } = useParams();
  const [{ orderBy, filters, pagination }, dispatch] = useTable({
    orderBy: { field: "firstName", sort: "asc" },
    filters: {},
    pagination: { limit: 10, page: 0 },
  });
  const { data, isLoading } = useGetAllEntities<CharacterType>(
    {
      data: { projectId: projectId as string },
      orderBy,
      filters,
      pagination,
      archived: archived === "archived",
    },
    "characters",
    {
      staleTime: 5 * 60 * 1000,
      prefetch: true,
    },
  );

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);

  return (
    <TablePageLayout>
      <div className="flex w-full items-center justify-end gap-x-2">
        <div className="w-32">
          <Select
            name="view"
            onChange={({ value }) => setView(value as "card" | "list")}
            options={[
              { label: "Card", value: "card", icon: IconEnum.card },
              { label: "List", value: "list", icon: IconEnum.table },
            ]}
            placeholder="View"
            value={view}
          />
        </div>
        <div className="w-32">
          <Select
            name="archived"
            onChange={({ value }) => setArchived(value as "active" | "archived")}
            options={[
              { label: "Active", value: "active", icon: IconEnum.active },
              { label: "Archived", value: "archived", icon: IconEnum.archive },
            ]}
            placeholder="Active"
            value={archived}
          />
        </div>
        <div className="w-fit">
          <Button
            icon={IconEnum.add}
            label="Create new character"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { projectId },
                title: "Create new character",
                type: "characters",
                size: "lg",
              }))
            }
          />
        </div>
      </div>
      <div className="h-full max-h-full w-full overflow-hidden">
        <Table
          columns={createColumns(setDrawer, setDialog, archived === "archived")}
          config={{
            hasSelect: true,
            orderBy,
            filters,
            getLink: (rowData: any) => `/project/${projectId}/characters/${rowData.id}`,
          }}
          data={data?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          pagination={pagination}
          type="characters"
        />
      </div>
    </TablePageLayout>
  );
}
