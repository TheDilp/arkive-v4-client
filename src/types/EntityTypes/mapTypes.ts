import { CharacterType } from "./characterTypes";
import { DocumentType } from "./documentTypes";
import { ImageType } from "./imageTypes";
import { TagType } from "./tagTypes";

/* eslint-disable no-use-before-define */
export interface MapType {
  id: string;
  title: string;
  is_folder?: boolean | null;
  is_public?: boolean | null;
  cluster_pins?: boolean | null;
  icon?: string | null;
  project_id: string;
  parent_id?: string | null;
  image_id: string | null;

  map_pins?: MapPinType[];
  map_layers?: MapLayerType[];
  characters: CharacterType[];

  tags?: TagType[];
}

export interface MapLayerType {
  id: string;
  title: string;
  parent_id: string;
  is_public: boolean | null;
  image_id: string;
  image?: ImageType;
}

export interface MapPinType {
  id: string;
  title: string | null;
  parent_id: string;
  lat: number;
  lng: number;
  color: string | null;
  border_color: string | null;
  background_color: string | null;
  icon: string;
  show_background: boolean;
  show_border: boolean;
  is_public: boolean | null;
  map_link?: string | null;
  doc_id?: string | null;
  image_id?: string | null;
  character_id?: string | null;
  map_pin_type_id?: string | null;
  document?: DocumentType;
  linked_map?: MapType;
  image?: ImageType;
  character?: Pick<CharacterType, "id" | "full_name" | "portrait_id">;
  map_pin_type?: MapPinType | null;
}

export interface MapPinTypesType {
  id: string;
  title: string;
  project_id: string;
}

export type CharacterLocationType = Pick<MapType, "id" | "title" | "image_id"> & { map_pin_id: string };
