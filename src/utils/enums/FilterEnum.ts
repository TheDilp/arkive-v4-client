import { RequestFilterTypes } from "@thearkive/types";

export const inputFilters = ["eq", "gt", "gte", "lt", "lte"];
export const rangeFilters = ["between", "notBetween"];

export const FilterNamesEnum: Record<RequestFilterTypes, string> = {
  eq: "Equals",
  ne: "Doesn't equal",
  gt: "Greater than",
  gte: "Greater than or equal",
  lt: "Less than",
  lte: "Less than or equal",
  between: "Between",
  notBetween: "Not between",
  isNull: "Is empty",
  isNotNull: "Is not empty",
  like: "Search",
  ilike: "Search",
  notIlike: "Search",
  inArray: "In array",
  notInArray: "Not in array",
};

export const NameFilters = [
  { label: FilterNamesEnum.eq, value: "eq" },
  { label: FilterNamesEnum.ilike, value: "ilike" },
  {
    label: FilterNamesEnum.isNull,
    value: "isNull",
  },
  {
    label: FilterNamesEnum.isNotNull,
    value: "isNotNull",
  },
];

export const NumberFilters = [
  {
    label: FilterNamesEnum.eq,
    value: "eq",
  },
  {
    label: FilterNamesEnum.gt,
    value: "gt",
  },
  {
    label: FilterNamesEnum.gte,
    value: "gte",
  },
  {
    label: FilterNamesEnum.lt,
    value: "lt",
  },
  {
    label: FilterNamesEnum.lte,
    value: "lte",
  },
  {
    label: FilterNamesEnum.between,
    value: "between",
  },
  {
    label: FilterNamesEnum.notBetween,
    value: "notBetween",
  },
  {
    label: FilterNamesEnum.isNull,
    value: "isNull",
  },
  {
    label: FilterNamesEnum.isNotNull,
    value: "isNotNull",
  },
];
