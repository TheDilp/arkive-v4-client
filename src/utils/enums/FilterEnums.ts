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
  in: "In list",
  is: "is",
  "not in": "Not in list",
};

export const NameFilters = [
  { label: FilterNamesEnum.eq, value: "eq", type: "text" },
  { label: FilterNamesEnum.ilike, value: "ilike", type: "text" },
];

export const NumberFilters = [
  {
    label: FilterNamesEnum.eq,
    value: "eq",
    type: "text",
  },
  {
    label: FilterNamesEnum.gt,
    value: "gt",
    type: "number",
  },
  {
    label: FilterNamesEnum.gte,
    value: "gte",
    type: "number",
  },
  {
    label: FilterNamesEnum.lt,
    value: "lt",
    type: "number",
  },
  {
    label: FilterNamesEnum.lte,
    value: "lte",
    type: "number",
  },
];

export const TagFilters = [
  { label: FilterNamesEnum.in, value: "in", type: "relation" },
  { label: FilterNamesEnum["not in"], value: "not in", type: "relation" },
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
