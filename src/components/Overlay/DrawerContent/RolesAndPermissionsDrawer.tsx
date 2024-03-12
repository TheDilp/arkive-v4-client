import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { RoleType } from "../../../types";
import {
  capitalizeFirstLetter,
  drawerAtom,
  getSentenceCase,
  IconEnum,
  permissionsAtom,
  permissionsByEntity,
} from "../../../utils";
import { InsertRoleSchema, UpdateRoleSchema } from "../../../validation";
import { Button, Checkbox, Input } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";

export function RolesAndPermissionsDrawer({ data }: { data: { id?: string } }) {
  const { project_id } = useParams();
  const [role, setRole] = useState<
    Partial<Pick<RoleType, "id" | "title" | "project_id"> & { permissions: Record<string, boolean> }>
  >({
    id: "",
    title: "",
    permissions: {},
    project_id: project_id as string,
  });
  const { handleChange } = useHandleChange({ data: role, setData: setRole });
  const permissions = useAtomValue(permissionsAtom);
  const { data: existingRole, isInitialLoading: isLoadingRole } = useGetEntity<RoleType>(
    data?.id,
    "roles",
    { fields: ["id", "title"], relations: { permissions: true } },
    { enabled: !!data?.id },
  );
  const { mutate: createRole, isLoading: isCreating } = useCreateEntity<{
    data: {
      title: string;
      project_id: string;
      permissions: string[];
    };
  }>("roles");
  const { mutate: updateRole, isLoading: isUpdating } = useUpdateEntity("roles", project_id as string);
  const resetDrawerAtom = useResetAtom(drawerAtom);

  const formattedPermissions = permissionsByEntity(permissions || []);

  useLayoutEffect(() => {
    if (existingRole?.data && !role?.id) {
      const existingPermissions: Record<string, boolean> = {};
      for (let index = 0; index < existingRole?.data?.permissions?.length; index += 1) {
        existingPermissions[existingRole?.data?.permissions[index].id] = true;
      }
      setRole({ title: existingRole?.data?.title, id: existingRole?.data?.id, permissions: existingPermissions });
    }
  }, [existingRole]);

  if (isLoadingRole) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Input label="Role title" name="title" onChange={handleChange} placeholder="New project" value={role?.title || ""} />
      <div>
        <Alert
          label="The role will grant a user permission for a group of entities in general. They will be able to view, update and delete only entities they've created - otherwise, they must be granted explicit permissions by the project's or entity's owner."
          variant="info-bordered"
        />
      </div>
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
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={!role?.title || isCreating || isUpdating}
          isLoading={isCreating || isUpdating}
          label={data?.id ? "Update" : "Create"}
          onClick={async () => {
            if (role) {
              const formattedRole = {
                title: role.title,
                project_id: role.project_id,
                permissions: Object.entries(role.permissions ?? {})
                  .map(([key, value]) => {
                    if (value) return key;
                    return null;
                  })
                  .filter((k) => !!k),
              };
              if (data?.id) {
                const parsed = UpdateRoleSchema.parse({ data: { ...formattedRole, id: data.id } });
                updateRole(parsed, {
                  onSuccess: resetDrawerAtom,
                });
              } else {
                const parsed = InsertRoleSchema.parse({ data: formattedRole });
                createRole(parsed, {
                  onSuccess: resetDrawerAtom,
                });
              }
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
