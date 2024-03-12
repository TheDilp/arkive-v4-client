import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { PermissionCodeType, UserHasPermissionsType } from "../../types";
import { currentUserPermissions, isProjectOwnerAtom, userAtom } from "../../utils";

export function useHasPermissions(requiredPermissions: PermissionCodeType[], owner_id: string | undefined) {
  const { type } = useParams();
  const [permissions, setPermissions] = useState<UserHasPermissionsType>({});

  const isProjectOwner = useAtomValue(isProjectOwnerAtom);
  const user = useAtomValue(userAtom);
  const userPermissions = useAtomValue(currentUserPermissions);

  useEffect(() => {
    setPermissions({});
    if (user?.id) {
      const finalPermissions: UserHasPermissionsType = {};
      finalPermissions.is_owner = isProjectOwner || user?.id === owner_id;
      for (let index = 0; index < requiredPermissions.length; index += 1) {
        finalPermissions[requiredPermissions[index]] = isProjectOwner || userPermissions.includes(requiredPermissions[index]);
      }
      setPermissions(finalPermissions);
    }
  }, [owner_id, user, type]);
  return permissions;
}
