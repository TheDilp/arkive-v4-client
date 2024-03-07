import { useAtomValue } from "jotai";

import { EntityPermissionType, HandleChangePropsType } from "../../types";
import { IconEnum, membersAtom, permissionsAtom, rolesAtom } from "../../utils";
import { Checkbox, Title } from "../Form";
import { Collapsible } from "../Layout";

type Props = {
  related_id: string;
  permissions: EntityPermissionType[];
  handleChange: (newData: HandleChangePropsType) => void;
  selectablePermissions: string[];
};

export function EntityPermission({ related_id, permissions, handleChange, selectablePermissions }: Props) {
  const roles = useAtomValue(rolesAtom);
  const members = useAtomValue(membersAtom);
  const availablePermissions = useAtomValue(permissionsAtom).filter((p) => selectablePermissions.includes(p.code));
  return (
    <div className="flex flex-col gap-y-2">
      <Collapsible icon={IconEnum.permissions} initialOpen label="Role access">
        <ul className="flex max-h-96 flex-col gap-y-2 overflow-y-auto p-2">
          {roles.map((role) => (
            <li key={role.id} className="flex items-center justify-between">
              <span>{role.title}</span>
              <div>
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

      <Collapsible icon={IconEnum.user} initialOpen label="Member access">
        <ul className="flex max-h-96 flex-col gap-y-2 overflow-y-auto px-2">
          {members.map((member) => (
            <li key={member.id} className="flex flex-col">
              <Title isDrawerTitle label={member.email} size="lg" />
              <div className="grid grid-cols-4">
                {availablePermissions.map((p) => (
                  <div key={p.id} className="flex flex-col items-center">
                    <span>{p.title.split(" ").at(0) || ""}</span>
                    <Checkbox
                      name="permissions"
                      onChange={(e) => {
                        if (e.value && !permissions.some((perm) => perm.permission_id === p.id && perm.user_id === member.id)) {
                          handleChange({
                            name: "permissions",
                            value: permissions.concat({ related_id, permission_id: p.id, user_id: member.id, role_id: null }),
                          });
                        }
                        if (!e.value && permissions.some((perm) => perm.permission_id === p.id && perm.user_id === member.id)) {
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
