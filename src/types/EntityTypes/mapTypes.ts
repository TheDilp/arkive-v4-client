import { CharacterType } from "./characterTypes";
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
  map_layers?: MapLayers[];
  characters: CharacterType[];

  tags?: TagType[];
}

export interface MapLayers {
  id: string;
  title: string;
  parent_id: string;
  is_public: boolean | null;
  image_id: string;
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
  image: ImageType;

  character: Pick<CharacterType, "id" | "first_name" | "last_name" | "portrait_id">;
}

export type CharacterLocationType = Pick<MapType, "id" | "title"> & { map_pin_id: string };
