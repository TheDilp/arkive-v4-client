import { AssetType } from "../../baseTypes";
import { ImageType } from "../../EntityTypes";

export interface ImageComponentType {
  image: Omit<ImageType, "owner_id" | "permissions" | "tags">;
  isOpenable?: boolean;
  hasTitle?: boolean;
  isLazyLoading?: boolean;
  url?: string;
  objectFit?: "cover" | "contain";
  type: AssetType;
}
