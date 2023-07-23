export interface ContextMenuItemType {
  title: string;
  onClick?: () => void;
  icon?: string;
  subItems?: ContextMenuItemType[];
}
