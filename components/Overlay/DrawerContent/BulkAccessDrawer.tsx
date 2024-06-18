import { useState } from "react";
import { useParams } from "react-router-dom";

import { useBulkUpdateAccess, useHandleChange, useToggledResetAtom } from "../../../hooks";
import { AvailableWikiEntityType, AvailableWikiSubEntityType, EntityPermissionType, PermissionCodeType } from "../../../types";
import { IconEnum } from "../../../utils";
import { BulkAccessUpdateSchema } from "../../../validation/bulk/bulk_access";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button } from "../../Form";
import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    ids: string[];
    selectablePermissions: PermissionCodeType[];
    type: AvailableWikiEntityType | AvailableWikiSubEntityType;
  };
};

export function BulkAccessDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [permissions, setPermissions] = useState<{ permissions: Omit<EntityPermissionType, "code">[] }>({ permissions: [] });
  const { handleChange } = useHandleChange({ data, setData: setPermissions });
  const { mutate } = useBulkUpdateAccess(project_id, data?.type);
  const resetDrawer = useToggledResetAtom();
  return (
    <DrawerLayout>
      <EntityPermission
        handleChange={handleChange}
        permissions={permissions?.permissions || []}
        related_id=""
        selectablePermissions={data?.selectablePermissions || []}
      />

      <Button
        icon={IconEnum.save}
        label="Change access"
        onClick={() => {
          const formattedPermissions: (
            | Omit<EntityPermissionType, "code">
            | { related_id: string; permission_id: null; user_id: null; role_id: null }
          )[] = [];
          if (permissions.permissions.length === 0) {
            for (let i = 0; i < data.ids.length; i += 1) {
              formattedPermissions.push({
                permission_id: null,
                user_id: null,
                role_id: null,
                related_id: data.ids[i],
              });
            }
          } else {
            for (let i = 0; i < data.ids.length; i += 1) {
              for (let j = 0; j < permissions.permissions.length; j += 1) {
                const permissionToInsert = permissions.permissions[j];
                if (permissionToInsert.user_id && permissionToInsert.permission_id) {
                  formattedPermissions.push({
                    permission_id: permissionToInsert.permission_id,
                    user_id: permissionToInsert.user_id,
                    role_id: null,
                    related_id: data.ids[i],
                  });
                } else if (permissionToInsert.role_id) {
                  formattedPermissions.push({
                    permission_id: null,
                    user_id: null,
                    role_id: permissionToInsert.role_id,
                    related_id: data.ids[i],
                  });
                }
              }
            }
          }
          const parsedData = BulkAccessUpdateSchema.parse({ data: { permissions: formattedPermissions } });

          mutate(parsedData, { onSuccess: resetDrawer });
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
