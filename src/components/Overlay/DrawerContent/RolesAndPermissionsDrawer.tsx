import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntities, useHandleChange } from "../../../hooks";
import { PermissionType, RoleType } from "../../../types";
import { capitalizeFirstLetter, drawerAtom, getSentenceCase, IconEnum, permissionsByEntity } from "../../../utils";
import { InsertRoleSchema } from "../../../validation";
import { Button, Checkbox, Input } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";

export function RolesAndPermissionsDrawer() {
  const { project_id } = useParams();
  const [role, setRole] = useState<
    Partial<Pick<RoleType, "id" | "title" | "project_id"> & { permissions: Record<string, boolean> }>
  >({
    id: "",
    title: "New role",
    permissions: {},
    project_id: project_id as string,
  });
  const { handleChange } = useHandleChange({ data: role, setData: setRole });
  const { data: permissions } = useGetEntities<PermissionType>({ fields: ["id", "title"] }, "permissions", {
    staleTime: Infinity,
  });
  const { mutateAsync, isLoading: isMutating } = useCreateEntity<{
    data: {
      title: string;
      project_id: string;
      permissions: string[];
    };
  }>("roles");
  const resetDrawerAtom = useResetAtom(drawerAtom);

  const formattedPermissions = permissionsByEntity(permissions?.data || []);

  return (
    <DrawerLayout>
      <Input label="Role title" name="title" onChange={handleChange} placeholder="New project" value={role?.title || ""} />

      {formattedPermissions.map((permission) => (
        <Collapsible key={permission.title} label={capitalizeFirstLetter(getSentenceCase(permission.title))}>
          <div className="grid grid-cols-2 gap-2 p-2 text-center">
            {permission.permissions.map((p) => (
              <Checkbox
                key={p.title}
                label={p.title}
                name={`permissions[${p.id}]`}
                onChange={handleChange}
                value={role?.permissions?.[p.id]}
              />
            ))}
          </div>
        </Collapsible>
      ))}
      <div>
        <Button
          icon={IconEnum.add}
          isDisabled={!role?.title || isMutating}
          isLoading={isMutating}
          label="Create role"
          onClick={async () => {
            if (role) {
              const formattedRole = {
                title: role.title,
                project_id: role.project_id,
                permissions: Object.keys(role.permissions ?? {}),
              };
              const parsed = InsertRoleSchema.parse({ data: formattedRole });
              await mutateAsync(parsed, {
                onSuccess: resetDrawerAtom,
              });
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
