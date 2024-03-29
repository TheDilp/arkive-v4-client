import { AssetType, Size } from "../../baseTypes";
import { ImageType } from "../../EntityTypes";

export interface GalleryType {
  images: Omit<ImageType, "owner_id" | "permissions">[];
  columns: number;
  isOpenable?: boolean;
  size?: Size;
  type: AssetType;
}
