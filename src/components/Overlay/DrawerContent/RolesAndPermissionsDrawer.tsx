import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateProject, useHandleChange } from "../../../hooks";
import { RoleType } from "../../../types";
import { drawerAtom, IconEnum, RolePermissions } from "../../../utils";
import { InsertProjectSchema, InsertProjectType } from "../../../validation/project";
import { Button, Checkbox, Input } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";

export function RolesAndPermissionsDrawer() {
  const { project_id } = useParams();
  const [role, setRole] = useState<Partial<RoleType>>({
    id: "",
    title: "New role",
    permissions: [],
    project_id: project_id as string,
  });
  const { handleChange } = useHandleChange({ data: role, setData: setRole });
  const { mutateAsync, isLoading: isMutating } = useCreateProject<InsertProjectType>();
  const resetDrawerAtom = useResetAtom(drawerAtom);

  return (
    <DrawerLayout>
      <Input label="Role title" name="title" onChange={handleChange} placeholder="New project" value={role?.title || ""} />

      {RolePermissions.map((permission) => (
        <Collapsible key={permission.title} label={permission.title}>
          <div className="grid grid-cols-2 gap-2 p-2 text-center">
            {permission.permissions.map((p) => (
              <Checkbox key={p.code} label={p.title} name={p.code} onChange={handleChange} value={false} />
            ))}
          </div>
        </Collapsible>
      ))}

      <Button
        icon={IconEnum.add}
        isDisabled={!role?.title || isMutating}
        isLoading={isMutating}
        label="Create role"
        onClick={async () => {
          if (role) {
            const parsed = InsertProjectSchema.parse({ data: role });
            await mutateAsync(parsed, {
              onSuccess: resetDrawerAtom,
            });
          }
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
