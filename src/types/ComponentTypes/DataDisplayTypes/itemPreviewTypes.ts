export interface ItemPreviewType {
  id: string;
  title: string;
  icon?: string;
  clearAction?: (id: string) => void;
}
