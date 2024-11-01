import { EntityPermissionType } from "./baseEntityTypes";
import { BlueprintType } from "./blueprintTypes";
import { FieldDataType } from "./fieldsTypes";
import { TagType } from "./tagTypes";

export interface BlueprintInstanceType {
  id: string;
  deleted_at: string;
  title: string;
  parent_id: string;
  owner_id: string;
  is_public?: boolean;
  blueprint?: BlueprintType;
  tags: Omit<TagType, "owner_id" | "permissions">[];
  blueprint_fields: FieldDataType[];
  permissions: EntityPermissionType[];
}
