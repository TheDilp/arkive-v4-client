import { CharacterRelationshipType } from "./characterRelationshipTypes";
import { ImageType } from "./imageTypes";

export interface ProjectType {
  id: string;
  title: string;
  owner_id: string;
  image_id: string | null;
  images?: ImageType[];
  default_dice_color?: string;
  show_image_folder_view?: boolean;
  show_image_table_view?: boolean;
  character_relationship_types?: CharacterRelationshipType[];
}
