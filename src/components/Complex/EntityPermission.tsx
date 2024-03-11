import { useAtomValue } from "jotai";
import { useParams } from "react-router-dom";

import { useGetEntities } from "../../hooks";
import {
  AvailableEntityType,
  AvailableSubEntityType,
  EntityPermissionType,
  HandleChangePropsType,
  RoleType,
} from "../../types";
import { getSingularEntityType, IconEnum, isProjectOwnerAtom, membersAtom, permissionsAtom, userAtom } from "../../utils";
import { Checkbox, Title } from "../Form";
import { Collapsible } from "../Layout";
import { Icon } from "../Misc";
import { Tooltip } from "../Overlay";

type Props = {
  related_id: string | null;
  permissions: (Pick<EntityPermissionType, "permission_id" | "role_id" | "user_id"> & { related_id: string | null })[];
  handleChange: (newData: HandleChangePropsType) => void;
  selectablePermissions: string[];
  type: AvailableEntityType | AvailableSubEntityType;
};

export function EntityPermission({ related_id, permissions, handleChange, selectablePermissions, type }: Props) {
  const { project_id } = useParams();
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const user = useAtomValue(userAtom);
  const { data: roles } = useGetEntities<RoleType>(
    { data: { project_id }, fields: ["id"], relations: { permissions: true } },
    "roles",
    {
      enabled: isProjectOwner,
      staleTime: 5 * 60 * 1000,
    },
  );
  const members = useAtomValue(membersAtom);
  const availablePermissions = useAtomValue(permissionsAtom).filter((p) => selectablePermissions.includes(p.code as string));
  return (
    <div className="flex flex-col gap-y-2">
      {isProjectOwner ? (
        <Collapsible icon={IconEnum.permissions} initialOpen label="Role access">
          <ul className="flex max-h-96 flex-col gap-y-2 overflow-y-auto p-2">
            {(roles?.data || [])?.map((role) => (
              <li key={role.id} className="flex items-center justify-between">
                <span>{role.title}</span>
                <div className="flex items-center justify-end gap-x-4">
                  <Tooltip
                    content={
                      role.permissions.length
                        ? `Anyone with this roll will have permission to ${role.permissions
                            .filter((p) => selectablePermissions.includes(p.code as string))
                            .map((p) => p.title.split(" ")[0])
                            .join("/")} this ${getSingularEntityType(type).toLowerCase()}.`
                        : `This role does not grant any permissions for ${type.replaceAll("_", " ")}.`
                    }
                    isInline={false}>
                    <div>
                      <Icon fontSize={20} icon={IconEnum.permissions} />
                    </div>
                  </Tooltip>
                  <Checkbox
                    name="permissions"
                    onChange={(e) => {
                      if (e.value) {
                        handleChange({
                          name: "permissions",
                          value: permissions.concat({ related_id, role_id: role.id, permission_id: null, user_id: null }),
                        });
                      } else {
                        handleChange({
                          name: "permissions",
                          value: permissions.filter((p) => p.role_id !== role.id),
                        });
                      }
                    }}
                    value={permissions.some((p) => p.role_id === role.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Collapsible>
      ) : null}

      <Collapsible icon={IconEnum.user} initialOpen label="Member access">
        <ul className="flex max-h-96 flex-col gap-y-2 overflow-y-auto px-2">
          {members
            .filter((member) => member.id !== user?.id)
            .map((member) => (
              <li key={member.id} className="flex flex-col">
                <Title isDrawerTitle label={member.email} size="lg" />
                <div className="grid grid-cols-4">
                  {availablePermissions.map((p) => (
                    <div key={p.id} className="flex flex-col items-center">
                      <span>{p.title.split(" ").at(0) || ""}</span>
                      <Checkbox
                        name="permissions"
                        onChange={(e) => {
                          if (
                            e.value &&
                            !permissions.some((perm) => perm.permission_id === p.id && perm.user_id === member.id)
                          ) {
                            handleChange({
                              name: "permissions",
                              value: permissions.concat({ related_id, permission_id: p.id, user_id: member.id, role_id: null }),
                            });
                          }
                          if (
                            !e.value &&
                            permissions.some((perm) => perm.permission_id === p.id && perm.user_id === member.id)
                          ) {
                            handleChange({
                              name: "permissions",
                              value: permissions.filter((perm) => {
                                if (perm.user_id === member.id) {
                                  return p.id !== perm.permission_id;
                                }
                                return true;
                              }),
                            });
                          }
                        }}
                        value={permissions.some((perm) => perm.permission_id === p.id && perm.user_id === member.id)}
                      />
                    </div>
                  ))}
                </div>
              </li>
            ))}
        </ul>
      </Collapsible>
    </div>
  );
}
