export interface CharacterPreviewType {
  id: string;
  character_name: string;
  image_id?: string | null;
  clearAction?: (id: string) => void;
}
