import { AvailableIcons } from "../../../utils";

export type TabType = {
  id: string;
  label: string;
  icon?: AvailableIcons | null;
};
export interface TabsTypes {
  selectedTab: number;
  tabs: TabType[];
  hasArrowNav?: boolean;
  onChange?: (tab: TabType, index: number) => void;
  isVertical?: boolean;
}

