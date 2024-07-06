import { AssetType, Size } from "../../baseTypes";
import { ImageType } from "../../EntityTypes";

export interface GalleryType {
  images: Omit<ImageType, "owner_id" | "permissions" | "tags">[];
  columns: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  isOpenable?: boolean;
  size?: Size;
  type: AssetType;
}

