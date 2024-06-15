import { AssetType } from "../../baseTypes";
import { ImageType } from "../../EntityTypes";

export type ImageComponentType = {
  isOpenable?: boolean;
  hasTitle?: boolean;
  isLazyLoading?: boolean;

  objectFit?: "cover" | "contain";
  type: AssetType;
} & (
  | {
      image: Omit<ImageType, "owner_id" | "permissions" | "tags">;
      url?: string;
    }
  | {
      image?: Omit<ImageType, "owner_id" | "permissions" | "tags">;
      url: string;
    }
);
