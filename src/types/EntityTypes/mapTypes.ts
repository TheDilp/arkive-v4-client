export interface MapType {
  id: string;
  title: string;
  is_folder: boolean | null;
  is_public: boolean | null;
  cluster_pins: boolean | null;
  icon: string | null;
  project_id: string;
  parent_id: string | null;
  image_id: string | null;
}

export interface MapPinType {
  id: string;
  text: string | null;
  parent_id: string;
  lat: number;
  lng: number;
  color: string | null;
  border_color: string | null;
  background_color: string | null;
  icon: string | null;
  show_background: boolean;
  show_border: boolean;
  is_public: boolean | null;
  map_link: string | null;
  doc_id: string | null;
  image_id: string | null;
}
