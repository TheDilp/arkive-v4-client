/* eslint-disable no-use-before-define */
import { BaseEntityType } from "./baseEntityTypes";

export type RandomTableSubOptionType = Pick<RandomTableOptionType, "id" | "title" | "description" | "parent_id">;

export interface RandomTableOptionType {
  id: string;
  title: string;
  description?: string | null;
  parent_id: string;
  icon?: string | null;
  icon_color?: string | null;
  random_table_suboptions?: RandomTableSubOptionType[];
}

export interface RandomTableType extends BaseEntityType {
  description?: string | null;
  random_table_options: RandomTableOptionType[];
}
