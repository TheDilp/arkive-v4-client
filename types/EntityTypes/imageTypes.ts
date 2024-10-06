import { AssetType } from "../baseTypes";
import { EntityPermissionType } from "./baseEntityTypes";
import { TagType } from "./tagTypes";

export interface ImageType {
  id: string;
  title: string;
  description?: string | null;
  project_id: string;
  owner_id: string;
  permissions: EntityPermissionType[];
  project_image_id?: string;
  character_id?: string | null;
  is_public?: boolean | null;
  tags: TagType[];
  type: AssetType;
}
