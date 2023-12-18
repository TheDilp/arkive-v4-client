import { AssetType, Size } from "../../baseTypes";
import { ImageType } from "../../EntityTypes";

export interface GalleryType {
  images: ImageType[];
  columns: number;
  isOpenable?: boolean;
  size?: Size;
  type: AssetType;
}
