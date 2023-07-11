export type RequestFilterTypes = "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "inArray" | "notInArray" | "like";

export interface RequestFilterType {
  field: string;
  value: string | number | string[] | number[];
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
  [key: string]: boolean;
};

export interface ResponseType<DataType = []> {
  data?: DataType;
  messsage: string;
  ok: boolean;
}

export interface RequestBodyType {
  data: {
    [key: string]: any;
  };
  orderBy?: RequestOrderByType;
  filters?: {
    and?: RequestFilterType[];
    or?: RequestFilterType[];
  } | null;
  pagination?: RequestPaginationType;
  relations?: RequestRelationsType;
  columns?: RequestColumnsType;
  archived?: boolean;
}

export interface ResponseErrorType {
  statusCode: number;
  code: string;
  error: string;
  message: string;
}
