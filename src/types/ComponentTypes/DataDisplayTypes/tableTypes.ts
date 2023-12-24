import { Dispatch } from "react";

import { AssetType } from "../../baseTypes";
import { RequestFilterType, RequestOrderByType, RequestPaginationType, SortType } from "../../CRUD/CRUDTypes";
import { AvailableEntityType, SearchableEntities } from "../../EntityTypes";
import { ButtonType } from "../FormTypes";
import { SelectOptionType } from "../FormTypes/selectTypes";

export type TableSelectionType = { [key: number]: string[] };

export interface FilterEnumType extends SelectOptionType {
  type: "boolean" | "text" | "number" | "search";
  options?: (SelectOptionType | { label: string; value: boolean })[];
  searchType?: SearchableEntities;
}
export interface MetaType {
  sortable?: boolean;
  centered?: boolean;
  noLink?: boolean;
  pinned?: boolean;
  selection: TableSelectionType;
  filterOptions?: FilterEnumType[];
  relationType?: string;
}

export type TableColumnFilterType = RequestFilterType & { id: string; relationalData?: { [key: string]: any } };

export interface TableParams {
  orderBy?: RequestOrderByType[];
  filters?: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
  relationFilters?: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
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
  | {
      type: "setFilter" | "setRelationFilter";
      payload: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[]; field?: string };
    }
  | { type: "clearAllFilters" }
  | { type: "removeFilter"; payload: { and?: TableColumnFilterType; or?: TableColumnFilterType } }
  | {
      type: "removeFilterByField" | "removeRelationFilterByField";
      payload: string;
    }
  | {
      type: "setSort";
      payload: { field: string; sort: SortType };
    }
  | { type: "setSelection"; payload: { row: string } }
  | { type: "selectAll"; payload: { rows: string[] } }
  | { type: "clearSelection" };

export interface TableSelectedAction extends ButtonType {}

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
    relationFilters?: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
    selectedActions?: TableSelectedAction[];
    getLink?: (rowData: any) => string;
    onRowClick?: (rowData: any) => void;
    setFavorite?: (rowData: any) => Promise<void>;
  };
  type: AvailableEntityType | AssetType | "random_table_options" | "icons" | "words" | "context" | "map_pin_types";
  skeletonLimit?: number;
}

export interface TableColumnFilterComponentType {
  columnId: string | undefined;
  columnHeader: string;
  filters: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
  filterOptions: FilterEnumType[];
  dispatch: TableDispatch;
  isAndDisabled?: boolean;
  isOrDisabled?: boolean;
  isRelationFilter?: boolean;
  meta: MetaType | undefined;
}

export type SetFavoriteType = (data: { is_favorite: boolean; id: string }) => Promise<void>;
