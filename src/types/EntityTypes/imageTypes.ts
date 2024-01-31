import { AssetType } from "../baseTypes";

export interface ImageType {
  id: string;
  title: string;
  project_id: string;
  project_image_id?: string;
  character_id?: string | null;
  is_public?: boolean | null;
  type: AssetType;
}
