import { Dispatch } from "react";

import { RequestFilterType, RequestOrderByType, RequestPaginationType, SortType } from "../../CRUD/CRUDTypes";
import { AvailableEntityType } from "../../EntityTypes";
import { SelectOptionType } from "../FormTypes/selectTypes";

export interface MetaType {
  sortable?: boolean;
  centered?: boolean;
  noLink?: boolean;
  filterOptions?: SelectOptionType[];
}

export type TableColumnFilterType = RequestFilterType & { id: string };
export interface TableParams {
  orderBy?: RequestOrderByType;
  filters?: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
  pagination?: RequestPaginationType;
}
export type TableActionTypes = "setSort" | "removeFilter" | "setSelected" | "setAllSelected" | "clearSelected" | "clearFilters";
export type TableActionType =
  | {
      type: "setPagination";
      payload: { limit?: number; page?: number };
    }
  | { type: "setFilter"; payload: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[]; field?: string } }
  | { type: "clearAllFilters" }
  | { type: "removeFilter"; payload: { and?: TableColumnFilterType; or?: TableColumnFilterType } }
  | {
      type: "removeFilterByField";
      payload: string;
    }
  | {
      type: "setSort";
      payload: { field: string; sort: SortType };
    };

export interface TableDispatch extends Dispatch<TableActionType> {}
export interface TableType {
  columns: any[];
  data: any[];
  dispatch: TableDispatch;
  pagination?: RequestPaginationType;
  isLoading?: boolean;
  config?: {
    hasSelect?: boolean;
    orderBy?: RequestOrderByType;
    expandable?: boolean;
    filters?: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
    getLink?: (rowData: any) => string;
  };
  type: AvailableEntityType;
}

export interface TableColumnFilterComponentType {
  columnId: string | undefined;
  filters: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
  filterOptions: SelectOptionType[];
  dispatch: TableDispatch;
}
