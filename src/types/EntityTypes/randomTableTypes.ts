import { BaseEntityType } from "./baseEntityTypes";

export interface RandomTableOptionType {
  id: string;
  title: string;
  description?: string;
  parent_id: string;
  icon?: string;
  icon_color?: string | null;
}

export interface RandomTableType extends BaseEntityType {
  description?: string | null;
  random_table_options: RandomTableOptionType[];
}
