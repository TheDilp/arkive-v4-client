import { ImageType } from ".";

export interface DocumentType {
  id: string;
  title: string;
  content: string | null;
  icon: string | null;
  is_folder: boolean | null;
  is_public: boolean | null;
  is_template: boolean | null;
  properties: string | null;
  project_id: string;
  parent_id: string | null;
  image_id?: string | null;
  image: ImageType;
}
