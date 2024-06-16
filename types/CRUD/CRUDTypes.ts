export type RequestFilterTypes = "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not in" | "ilike" | "is" | "is not";

export interface RequestFilterType {
  field: string;
  value: string | number | string[] | number[] | boolean | null;
  operator: RequestFilterTypes;
  id: string;
  header_name: string;
  relationalData?: { [key: string]: any };
}
export type SortType = "asc" | "desc" | null;
export interface RequestOrderByType<InsertType> {
  field: keyof InsertType;
  sort: SortType;
}

export interface RequestPaginationType {
  limit?: number;
  page?: number;
}

type RequestColumnsType = {
  [key: string]: boolean;
};

type RequestRelationsType = {
  [key: string]:
    | boolean
    | {
        and?: RequestFilterType[];
        or?: RequestFilterType[];
      };
};

export interface RequestBodyType<InsertType> {
  data?: {
    [key: string]: any;
  };
  fields: (keyof InsertType)[];
  orderBy?: RequestOrderByType<InsertType>[];
  filters?: {
    and?: RequestFilterType[];
    or?: RequestFilterType[];
  } | null;
  relationFilters?: {
    and?: RequestFilterType[];
    or?: RequestFilterType[];
  } | null;
  pagination?: RequestPaginationType;
  relations?: RequestRelationsType;
  permissions?: boolean;
  arkived?: boolean;
  columns?: RequestColumnsType;
}
