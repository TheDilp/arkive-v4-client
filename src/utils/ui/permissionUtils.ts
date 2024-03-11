import { AvailableEntityType, AvailableSubEntityType, PermissionCodeType } from "../../types";

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
  if (type === "blueprint_instances") return ["create_blueprint_instances", "update_blueprint_instances", "update_blueprints"];
  return [];
}
