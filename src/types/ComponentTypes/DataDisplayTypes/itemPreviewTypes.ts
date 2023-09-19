export interface ItemPreviewType {
  id: string;
  title: string;
  icon?: string;
  link?: string;
  clearAction?: (id: string) => void;
}
