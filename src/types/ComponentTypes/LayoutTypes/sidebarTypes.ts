import { AvailableIcons } from "../../../utils";

export type SidebarItemType = {
  icon: AvailableIcons;
  navigate: string;
  tooltip: string;
  onClick?: () => void;
  isDisabled?: boolean | undefined;
};

export type SidebarType = { isLoading: boolean; items: SidebarItemType[]; isUsingPermissions: boolean };
