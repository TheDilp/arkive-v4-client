export type TabType = {
  id: string;
  label: string;
  icon?: string;
};
export interface TabsTypes {
  selectedTab: number;
  tabs: TabType[];
  onChange?: (tab: TabType, index: number) => void;
  isVertical?: boolean;
}
