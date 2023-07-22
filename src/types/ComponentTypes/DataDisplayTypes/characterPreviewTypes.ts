export interface CharacterPreviewType {
  id: string;
  character_name: string;
  image_id?: string;
  clearAction?: (id: string) => void;
}
