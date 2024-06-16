import { useAtomValue } from "jotai";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useToggledResetAtom, useUpdateEntity } from "../../../hooks";
import { RoleType } from "../../../types";
import { capitalizeFirstLetter, getSentenceCase, IconEnum, permissionsAtom, permissionsByEntity } from "../../../utils";
import { InsertRoleSchema, UpdateRoleSchema } from "../../../validation";
import { Button, Checkbox, Input } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";
import { IconPicker } from "../IconPicker";

export function RolesAndPermissionsDrawer({ data }: { data: { id?: string } }) {
  const { project_id } = useParams();
  const [role, setRole] = useState<
    Partial<Pick<RoleType, "id" | "title" | "project_id" | "icon"> & { permissions: Record<string, boolean> }>
  >({
    id: "",
    title: "",
    icon: null,
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
  const resetDrawerAtom = useToggledResetAtom();

  const formattedPermissions = permissionsByEntity(permissions || []);

  useLayoutEffect(() => {
    if (existingRole?.data && !role?.id) {
      const existingPermissions: Record<string, boolean> = {};
      for (let index = 0; index < existingRole?.data?.permissions?.length; index += 1) {
        existingPermissions[existingRole?.data?.permissions[index].id] = true;
      }
      setRole({
        title: existingRole?.data?.title,
        icon: existingRole?.data?.icon,
        id: existingRole?.data?.id,
        permissions: existingPermissions,
      });
    }
  }, [existingRole]);

  if (isLoadingRole) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <div className="flex items-center gap-x-2">
        <Input label="Role title" name="title" onChange={handleChange} placeholder="New project" value={role?.title || ""} />
        <div className="mb-1 self-end">
          <IconPicker icon={role?.icon || IconEnum.permissions} name="icon" onChange={handleChange} />
        </div>
      </div>
      <div>
        <Alert
          label="The role will grant a user permission for a group of entities in general. They will be able to view, update and delete only entities they've created - otherwise, they must be granted explicit permissions by the project's or entity's owner."
          variant="info-bordered"
        />
      </div>
      {formattedPermissions.map((permission) => {
        const hasReadPermission = permission.permissions.some((p) => p.code.startsWith("read_") && role?.permissions?.[p.id]);
        return (
          <Collapsible key={permission.title} label={capitalizeFirstLetter(getSentenceCase(permission.title))}>
            <div className="grid grid-cols-2 gap-2 p-2 text-center">
              {permission.permissions.map((p) => (
                <Checkbox
                  isDisabled={!hasReadPermission && !p.code.startsWith("read_")}
                  key={p.title}
                  label={p.title}
                  name={`permissions[${p.id}]`}
                  onChange={handleChange}
                  value={role?.permissions?.[p.id]}
                />
              ))}
            </div>
          </Collapsible>
        );
      })}
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
                icon: role.icon || IconEnum.permissions,
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
