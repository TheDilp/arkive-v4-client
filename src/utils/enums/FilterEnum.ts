import { RequestFilterTypes } from "../../types";

export const inputFilters = ["eq", "gt", "gte", "lt", "lte"];
export const rangeFilters = ["between", "notBetween"];

export const FilterNamesEnum: Record<RequestFilterTypes, string> = {
  eq: "Equals",
  ne: "Doesn't equal",
  gt: "Greater than",
  gte: "Greater than or equal",
  lt: "Less than",
  lte: "Less than or equal",
  ilike: "Search",
  inArray: "In array",
  notInArray: "Not in array",
};

export const NameFilters = [
  { label: FilterNamesEnum.eq, value: "eq" },
  { label: FilterNamesEnum.ilike, value: "ilike" },
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
];

export const FavoritesFilters = [
  {
    label: "Is favorite",
    value: "eq",
    type: "boolean",
    options: [
      {
        label: "True",
        value: true,
      },
      {
        label: "False",
        value: false,
      },
    ],
  },
];
