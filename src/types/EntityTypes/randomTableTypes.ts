import { BaseEntityType } from "./baseEntityTypes";

export interface RandomTableOption {
  id: string;
  title: string;
  description?: string;
  parent_id: string;
  icon: string;
  icon_color?: string | null;
}

export interface RandomTableType extends BaseEntityType {
  description?: string;
  dice_color?: string;
  random_table_options: RandomTableOption[];
}
