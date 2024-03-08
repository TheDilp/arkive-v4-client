import { useState } from "react";

import { useHandleChange } from "../../../hooks";
import { EntityPermissionType, PermissionCodeType } from "../../../types";
import { IconEnum } from "../../../utils";
// import { BulkAccessUpdateSchema } from "../../../validation/bulk/bulk_access";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button } from "../../Form";
import { DrawerLayout } from "../../Layout";

type Props = { data: { ids: string[]; selectablePermissions: PermissionCodeType[] } };

export function BulkAccessDrawer({ data }: Props) {
  const [permissions, setPermissions] = useState<{ permissions: EntityPermissionType[] }>({ permissions: [] });
  const { handleChange } = useHandleChange({ data, setData: setPermissions });
  return (
    <DrawerLayout>
      <EntityPermission
        handleChange={handleChange}
        permissions={permissions?.permissions || []}
        related_id=""
        selectablePermissions={["read_characters", "update_characters", "delete_characters"]}
      />

      <Button
        icon={IconEnum.save}
        label="Change access"
        onClick={async () => {
          // const formattedPermissions: EntityPermissionType[] = [];
          // for (let i = 0; i < data.ids.length; i += 1) {
          //   for (let j = 0; j < permissions.permissions.length; j += 1) {
          //     const permissionToInsert = permissions.permissions[j];
          //     if (permissionToInsert.user_id && permissionToInsert.permission_id) {
          //       formattedPermissions.push({
          //         permission_id: permissionToInsert.permission_id,
          //         user_id: permissionToInsert.user_id,
          //         role_id: null,
          //         related_id: data.ids[i],
          //       });
          //     } else if (permissionToInsert.role_id) {
          //       formattedPermissions.push({
          //         permission_id: null,
          //         user_id: null,
          //         role_id: permissionToInsert.role_id,
          //         related_id: data.ids[i],
          //       });
          //     }
          //   }
          // }
          // const parsedData = BulkAccessUpdateSchema.parse({ data: { permissions: formattedPermissions } });
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
