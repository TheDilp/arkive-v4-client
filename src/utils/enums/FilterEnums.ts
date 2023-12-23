import { FilterEnumType, RequestFilterTypes } from "../../types";

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
  "is not": "is not",
  "not in": "Not in list",
};

export const NameFilters: FilterEnumType[] = [
  { label: FilterNamesEnum.eq, value: "eq", type: "text" },
  { label: FilterNamesEnum.ilike, value: "ilike", type: "text" },
];

export const NumberFilters: FilterEnumType[] = [
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

export const TagFilters: FilterEnumType[] = [
  { label: FilterNamesEnum.in, value: "in", type: "search", searchType: "tags" },
  { label: FilterNamesEnum["not in"], value: "not in", type: "search", searchType: "tags" },
];

export const FavoritesFilters: FilterEnumType[] = [
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

export const CharacterFilters: FilterEnumType[] = [
  {
    label: "Includes",
    value: FilterNamesEnum.in,
    type: "search",
    searchType: "characters",
  },
  {
    label: "Does not include",
    value: FilterNamesEnum["not in"],
    type: "search",
    searchType: "characters",
  },
];
