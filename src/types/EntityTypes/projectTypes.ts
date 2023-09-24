import { ImageType } from "./imageTypes";

export interface ProjectType {
  id: string;
  title: string;
  owner_id: string;
  image_id: string | null;
  images?: ImageType[];
  default_dice_color?: string;
}
