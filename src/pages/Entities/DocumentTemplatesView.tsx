import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { Dispatch, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Select, Table } from "../../components";
import { useBreakpoint, useGetEntities, useHasPermissions, useNavbarTitle, useTable } from "../../hooks";
import { DialogAtomType, DocumentTemplateType, DrawerAtomType, UserHasPermissionsType } from "../../types";
import { dialogAtom, drawerAtom, hasActionPermission, IconEnum, isProjectOwnerAtom, userAtom } from "../../utils";

const columnHelper = createColumnHelper<DocumentTemplateType>();

function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  isProjectOwner: boolean,
  permissions: UserHasPermissionsType,
  user_id: string,
  user_role_id: string | undefined,
) {
  return [
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
      },
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
            items={
              row.original.deleted_at
                ? [
                    {
                      id: "1",
                      title: "Restore character template",
                      icon: IconEnum.restore,
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "document_field_template",
                          },

                          title: "Restore character template",
                          size: "sm",
                          type: "restore_entity",
                          isOverlay: true,
                        }));
                      },
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        [],
                        "delete_documents",
                        user_role_id,
                      ),
                    },
                    {
                      id: "delete_template",
                      title: "Delete character template",
                      icon: IconEnum.trash,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        [],
                        "delete_documents",
                        user_role_id,
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "document_field_template",
                          },
                          title: "Delete character template",
                          size: "sm",
                          type: "delete_entity",
                          isOverlay: true,
                        }));
                      },
                    },
                  ]
                : [
                    {
                      id: "1",
                      title: "Edit template",
                      icon: IconEnum.edit,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        [],
                        "update_documents",
                        user_role_id,
                      ),
                      onClick: () => {
                        setDrawer((prev) => ({
                          ...prev,
                          data: row.original,
                          title: "Edit template",
                          size: "half",
                          type: "document_template",
                        }));
                      },
                    },
                    {
                      id: "expand",
                      title: `${!row.getIsExpanded() ? "Show" : "Hide"} keys`,
                      icon: IconEnum.additional_fields,
                      onClick: row.getToggleExpandedHandler(),
                    },
                    {
                      id: "3",
                      title: "Arkive template",
                      icon: IconEnum.archive,
                      isDisabled: !hasActionPermission(
                        isProjectOwner,
                        user_id === row.original.owner_id,
                        permissions,
                        [],
                        "delete_documents",
                        user_role_id,
                      ),
                      onClick: () => {
                        setDialog((prev) => ({
                          ...prev,
                          data: {
                            ...row.original,
                            entity_title: "document_field_template",
                          },
                          title: "Arkive template",
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
  ];
}

export function DocumentTemplatesView() {
  const { project_id } = useParams();
  useNavbarTitle("Document templates", true);

  const { data: documentTemplates, isLoading } = useGetEntities<DocumentTemplateType>(
    {
      fields: ["id", "title", "owner_id", "project_id"],
      data: {
        project_id,
      },
    },
    "document_templates",
  );

  const [arkived, setArkived] = useState<"active" | "arkive">(ls.get("document-template-table-active") || "active");
  const { isMd } = useBreakpoint();
  const [{ orderBy, filters, relationFilters, pagination, selection }, dispatch] = useTable({
    orderBy: [{ field: "sort", sort: "desc" }],
    filters: {},
    relationFilters: {},
    pagination: { limit: 10, page: 0 },
    selection: {},
  });

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  // const resetDialogAtom = useResetAtom(dialogAtom);
  const user = useAtomValue(userAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const permissions = useHasPermissions(["create_documents", "update_documents", "delete_documents"], undefined);

  useEffect(() => {
    dispatch({ type: "clearSelection" });
    dispatch({ type: "setPagination", payload: { page: 0 } });
  }, [arkived]);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex h-12 w-full items-center justify-end gap-x-2">
        <div className="w-32">
          <Select
            name="view"
            onChange={({ value }) => {
              setArkived(value as "active" | "arkive");
              ls.set("document-template-table-active", value);
            }}
            options={[
              { label: "Active", value: "active", icon: IconEnum.eye },
              { label: "Arkived", value: "arkive", icon: IconEnum.archive },
            ]}
            placeholder="Active or arkived"
            value={arkived}
          />
        </div>
        <div className="w-fit lg:w-52">
          <Button
            icon={IconEnum.add}
            isDisabled={!permissions?.create_documents}
            label="Create new document template"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: {},
                title: "Create new document template",
                type: "document_template",
                size: "half",
              }))
            }
            tooltip={isMd ? undefined : "Create new document template"}
          />
        </div>
      </div>
      <div className="max-h-full w-full overflow-hidden">
        <Table
          columns={createColumns(setDrawer, setDialog, isProjectOwner, permissions, user?.id || "", user?.role?.id)}
          config={{
            relationFilters,
            hasSelect: true,
            hasArkived: arkived === "arkive",
            // expandable: true,
            // hasTags: true,
            // hasTagsWarning: true,
            filters,
            selection,
            orderBy,
            selectedActions: [],
          }}
          data={documentTemplates?.data || []}
          dispatch={dispatch}
          isLoading={isLoading}
          pagination={pagination}
          type="document_templates"
        />
      </div>
    </div>
  );
}
