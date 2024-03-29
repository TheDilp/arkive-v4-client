import { AssetType } from "../baseTypes";
import { EntityPermissionType } from "./baseEntityTypes";

export interface ImageType {
  id: string;
  title: string;
  project_id: string;
  owner_id: string;
  permissions: EntityPermissionType[];
  project_image_id?: string;
  character_id?: string | null;
  is_public?: boolean | null;
  type: AssetType;
}
