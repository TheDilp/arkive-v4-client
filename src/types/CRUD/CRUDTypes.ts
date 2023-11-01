export type RequestFilterTypes = "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not in" | "ilike" | "is" | "is not";

export interface RequestFilterType {
  field: string;
  value: string | number | string[] | number[] | boolean | null;
  operator: RequestFilterTypes;
}
export type SortType = "asc" | "desc" | null;
export interface RequestOrderByType {
  field: string;
  sort: SortType;
}

export interface RequestPaginationType {
  limit?: number;
  page?: number;
}

export type RequestColumnsType = {
  [key: string]: boolean;
};

export type RequestRelationsType = {
  [key: string]:
    | boolean
    | {
        and?: RequestFilterType[];
        or?: RequestFilterType[];
      };
};

export interface ResponseType<DataType = []> {
  data?: DataType;
  messsage: string;
  ok: boolean;
}

export interface RequestBodyType<InsertType> {
  data?: {
    [key: string]: any;
  };
  fields?: (keyof InsertType)[];
  orderBy?: RequestOrderByType[];
  filters?: {
    and?: RequestFilterType[];
    or?: RequestFilterType[];
  } | null;
  relationFilters?: {
    [key: string]: string[];
  };
  pagination?: RequestPaginationType;
  relations?: RequestRelationsType;
  columns?: RequestColumnsType;
}

export interface ResponseErrorType {
  statusCode: number;
  code: string;
  error: string;
  message: string;
}
