import { BaseComponentType } from "../../baseTypes";
import { ImageType } from "../../EntityTypes";

export interface ImageComponentType extends BaseComponentType {
  image: ImageType;
  isOpenable?: boolean;
}
