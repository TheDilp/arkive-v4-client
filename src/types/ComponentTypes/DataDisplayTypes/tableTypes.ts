import { Dispatch } from "react";

import { RequestFilterType, RequestOrderByType, RequestPaginationType, SortType } from "../../CRUD/CRUDTypes";
import { AvailableEntityType } from "../../EntityTypes";
import { SelectOptionType } from "../FormTypes/selectTypes";

export type TableSelectionType = { [key: number]: number[] };

export interface FilterEnumType extends SelectOptionType {
  type: "boolean" | "text" | "number";
  options?: SelectOptionType[];
}
export interface MetaType {
  sortable?: boolean;
  centered?: boolean;
  noLink?: boolean;
  selection: TableSelectionType;
  filterOptions?: FilterEnumType[];
}

export type TableColumnFilterType = RequestFilterType & { id: string };

export interface TableParams {
  orderBy?: RequestOrderByType[];
  filters?: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
  relationFilters?: Record<string, string[]>;
  pagination?: RequestPaginationType;
  selection?: TableSelectionType;
}
export type TableActionTypes =
  | "setSort"
  | "removeFilter"
  | "setSelected"
  | "setAllSelected"
  | "clearSelected"
  | "clearFilters"
  | "setRelationFilters"
  | "clearrelationFilters";
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
  | { type: "setRelationFilters"; payload: Record<string, string[]> }
  | {
      type: "setSort";
      payload: { field: string; sort: SortType };
    }
  | { type: "setSelection"; payload: { row: number } }
  | { type: "selectAll"; payload: { rows: number[] } }
  | { type: "clearSelection" };

export interface TableDispatch extends Dispatch<TableActionType> {}
export interface TableType {
  columns: any[];
  data: any[];
  dispatch: TableDispatch;
  pagination?: RequestPaginationType;
  isLoading?: boolean;
  config?: {
    hasFavorite?: boolean;
    hasSelect?: boolean;
    hasTags?: boolean;
    hasTagsWarning?: boolean;
    hasNoHeaderGap?: boolean;
    orderBy?: RequestOrderByType[];
    selection?: TableSelectionType;
    expandable?: boolean;
    filters?: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
    relationFilters?: Record<string, string[]>;
    getLink?: (rowData: any) => string;
    onRowClick?: (rowData: any) => void;
    setFavorite?: (rowData: any) => Promise<void>;
  };
  type: AvailableEntityType | "random_table_options" | "icons" | "words" | "context" | "images";
  skeletonLimit?: number;
}

export interface TableColumnFilterComponentType {
  columnId: string | undefined;
  filters: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
  filterOptions: FilterEnumType[];
  dispatch: TableDispatch;
  isAndDisabled?: boolean;
  isOrDisabled?: boolean;
}

export type SetFavoriteType = (data: { is_favorite: boolean; id: string }) => Promise<void>;
