import { BlueprintFieldTypes, FilterEnumType, RequestFilterTypes, SearchableEntities } from "../../types";

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

export const TextFilters: FilterEnumType[] = [
  { label: FilterNamesEnum.eq, value: "eq", type: "text" },
  { label: FilterNamesEnum.ilike, value: "ilike", type: "text" },
];

export const NumberFilters: FilterEnumType[] = [
  {
    label: FilterNamesEnum.eq,
    value: "eq",
    type: "number",
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

export const BooleanFilters: FilterEnumType[] = [
  {
    label: "Is",
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

export const TagFilters: FilterEnumType[] = [{ label: "Includes", value: "in", type: "search", searchType: "tags" }];

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

export function getSearchType(type: string) {
  let entity = type.replace(/_(single|multiple)/, "");
  if (entity === "locations") entity = "map_pins";
  if (entity === "blueprints") entity = "blueprint_instances";
  return entity;
}

export function CharacterBlueprintRelationFilter(
  type: BlueprintFieldTypes,
  selectOptions?: { label: string; value: string }[],
): FilterEnumType[] {
  if (type === "text") return TextFilters;
  if (type === "number") return NumberFilters;
  if (type === "boolean") return BooleanFilters;
  if ((type === "select" || type === "select_multiple") && selectOptions?.length)
    return [
      {
        label: "Includes",
        value: "eq",
        type,
        options: selectOptions,
      },
    ];

  return [
    {
      label: "Includes",
      value: "in",
      type: "search",
      searchType: getSearchType(type) as SearchableEntities,
    },
  ];
}
