import {
  AvailableEntityType,
  AvailableSubEntityType,
  EntityPermissionType,
  PermissionCodeType,
  UserHasPermissionsType,
} from "../../types";

export function createOrEditPermission(
  create: boolean | undefined,
  edit: boolean | undefined,
  is_owner: boolean | undefined,
  id: string | undefined,
): boolean {
  if (is_owner) return true;
  if (create && !id) return true;
  if (edit && id) return true;
  return false;
}

export function getPermissionsForTypeView(type: AvailableEntityType | AvailableSubEntityType): PermissionCodeType[] {
  if (type === "blueprints")
    return ["create_blueprint_instances", "create_blueprints", "delete_blueprints", "update_blueprints"];
  if (type === "blueprint_instances")
    return ["create_blueprint_instances", "update_blueprint_instances", "update_blueprints", "delete_blueprint_instances"];
  if (type === "documents") return ["read_documents", "create_documents", "update_documents", "delete_documents"];
  if (type === "maps") return ["read_maps", "create_maps", "update_maps", "delete_maps"];
  if (type === "graphs") return ["read_graphs", "create_graphs", "update_graphs", "delete_graphs"];
  if (type === "calendars") return ["read_calendars", "create_calendars", "update_calendars", "delete_calendars"];
  if (type === "dictionaries")
    return ["read_dictionaries", "create_dictionaries", "update_dictionaries", "delete_dictionaries"];
  if (type === "random_tables")
    return ["read_random_tables", "create_random_tables", "update_random_tables", "delete_random_tables"];
  return [];
}

export function hasActionPermission(
  isProjectOwner: boolean,
  isEntityOwner: boolean,
  userPermissions: UserHasPermissionsType,
  entityPermissions: Pick<EntityPermissionType, "code" | "role_id">[],
  required_permission: PermissionCodeType,
  user_role_id: string | undefined,
) {
  if (isProjectOwner) return true;
  if (!userPermissions?.[required_permission]) return false;
  if (isEntityOwner) return true;
  return entityPermissions?.some(
    (perm) => (user_role_id && user_role_id === perm?.role_id) || perm?.code === required_permission,
  );
}
