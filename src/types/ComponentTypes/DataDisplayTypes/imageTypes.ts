import { AssetType } from "../../baseTypes";
import { ImageType } from "../../EntityTypes";

export interface ImageComponentType {
  image: ImageType;
  isOpenable?: boolean;
  hasTitle?: boolean;
  isLazyLoading?: boolean;
  url?: string;
  objectFit?: "cover" | "contain";
  type: AssetType;
}
