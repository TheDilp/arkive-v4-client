export interface ContextMenuItemType {
  title: string;
  onClick?: (props: { contextId: string; contextTitle: string }) => void;
  icon?: string;
  subItems?: ContextMenuItemType[];
}

export interface ContextMenuType {
  items: ContextMenuItemType[];
}
