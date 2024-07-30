import { ColumnDef } from "@tanstack/react-table";
import { SetStateAction } from "jotai";
import { Dispatch } from "react";

import {
  ArkivedAtColumn,
  FavoriteColumn,
  SelectColumn,
  TagColumn,
} from "../../components/DataDisplay/TableComponents/TableColumns";
import { RequestPaginationType, SetFavoriteType, TableColumnFilterType, TableDispatch } from "../../types";
import { FilterNamesEnum } from "../enums";

export const relationFiltersList = [
  "tags",
  "characters_single",
  "characters_multiple",
  "blueprints_single",
  "blueprints_multiple",
  "locations_single",
  "locations_multiple",
  "documents_single",
  "documents_multiple",
  "events_single",
  "events_multiple",
  "value",
];

export function getTableColumns(
  columns: ColumnDef<any>[],
  {
    hasSelect,
    hasFavorite,
    hasTags,
    hasArkived,
    setFavorite,
    dispatch,
    pagination,
    selected,
    config,
  }: {
    hasSelect?: boolean;
    hasFavorite?: boolean;
    hasTags?: boolean;
    hasArkived?: boolean;
    setFavorite?: (data: SetFavoriteType) => void;
    dispatch?: TableDispatch;
    pagination?: RequestPaginationType;
    selected?: string[];
    config?: {
      hasTagsWarning?: boolean;
    };
  }
) {
  const finalColumns = [...columns];

  if (hasFavorite && setFavorite) {
    finalColumns.unshift(FavoriteColumn(setFavorite));
  }
  if (hasSelect && dispatch) {
    finalColumns.unshift(SelectColumn(dispatch, pagination, selected));
  }
  if (hasTags) {
    if (finalColumns.some((c) => c.id === "is_public")) {
      finalColumns.splice(finalColumns.length - 2, 0, TagColumn(config?.hasTagsWarning, dispatch));
    } else if (finalColumns.some((c) => c.id === "action")) {
      finalColumns.splice(finalColumns.length - 1, 0, TagColumn(config?.hasTagsWarning, dispatch));
    } else {
      finalColumns.splice(finalColumns.length, 0, TagColumn(config?.hasTagsWarning, dispatch));
    }
  }
  if (hasArkived) {
    finalColumns.splice(finalColumns.length - 1, 0, ArkivedAtColumn());
  }

  return finalColumns;
}

export function getTableColumnWidths(
  id: string,
  { minSize, maxSize }: { minSize?: number; maxSize?: number }
): {
  minWidth: string;
  maxWidth?: string;
} {
  if (id === "select" || id === "is_favorite") {
    return { minWidth: "2.75rem", maxWidth: "2.75rem" };
  }
  if (id === "action") {
    return { minWidth: "5rem", maxWidth: "5rem" };
  }
  const sizes = { minWidth: "", maxWidth: "" };

  if (minSize) {
    sizes.minWidth = `${minSize}rem`;
  } else {
    sizes.minWidth = "10rem";
  }
  if (maxSize) {
    sizes.maxWidth = `${maxSize}rem`;
  }
  return sizes;
}

export function removeColumnFilter(
  id: string,
  type: "and" | "or",
  setColumnFilters: Dispatch<SetStateAction<{ and?: TableColumnFilterType[]; or?: TableColumnFilterType[] }>>
) {
  setColumnFilters((prev) => ({
    ...prev,
    [type]: (prev[type] || []).filter((filt) => filt.id !== id),
  }));
}

function getFilterBadgeLabelOperator(operator: TableColumnFilterType["operator"], isRelationFilter: boolean): string {
  if (isRelationFilter) return "";
  return `${FilterNamesEnum[operator]}:`;
}

function getFilterBadgeLabel(filter: Pick<TableColumnFilterType, "operator" | "value" | "relationalData">) {
  return `${getFilterBadgeLabelOperator(filter.operator, !!filter?.relationalData)} "${
    filter?.relationalData?.label || filter.value
  }"`;
}

export function groupFiltersByHeader(
  items: TableColumnFilterType[]
): Record<string, Pick<TableColumnFilterType, "id" | "operator" | "value">[]> {
  return items.reduce((accumulator: Record<any, any>, item) => {
    const { header_name, ...rest } = item;
    if (!accumulator[header_name]) {
      accumulator[header_name] = [];
    }
    accumulator[header_name].push(rest);
    return accumulator;
  }, {});
}

export function getAreColumnFiltersActive(
  header: string,
  filters?: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] },
  relationFilters?: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] },
  id?: string
): boolean {
  if (id) {
    if (filters?.and?.some((filt) => filt.field === id)) return true;
    if (filters?.or?.some((filt) => filt.field === id)) return true;
    if (
      relationFilters?.and?.some(
        (filt) => filt.field === id || header === filt.header_name || filt?.relationalData?.blueprint_field_id === id
      )
    )
      return true;
    if (
      relationFilters?.or?.some(
        (filt) => filt.field === id || header === filt.header_name || filt?.relationalData?.blueprint_field_id === id
      )
    )
      return true;
    return false;
  }
  return false;
}

export function getIsApplyColumnFiltersDisabled(filters: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] }) {
  if (filters?.and) {
    if (filters.and.some((filt) => filt.value === undefined || filt.value === null || filt.value === "")) return true;
  }
  if (filters?.or) {
    if (
      filters.or.some((filt) => {
        if (filt.field === "is_favorite" || filt.field === "is_public") return false;
        return filt.value === undefined || filt.value === null || filt.value === "";
      })
    )
      return true;
  }
  return false;
}
export function getFilterTooltip({
  and,
  or,
}: {
  and?: Pick<TableColumnFilterType, "id" | "value" | "operator" | "relationalData">[];
  or?: Pick<TableColumnFilterType, "id" | "value" | "operator" | "relationalData">[];
}) {
  let base = "";
  if (and?.length) {
    if (or?.length) {
      base = base.concat("(");
    }
    base = base.concat((and || []).map((v) => getFilterBadgeLabel(v)).join(" AND "));
  }
  if (or?.length) {
    if (and?.length) {
      base = base.concat(") AND (");
    }
    base = base.concat((or || []).map((v) => getFilterBadgeLabel(v)).join(" OR "));
    if (and?.length) {
      base = base.concat(")");
    }
  }

  return base;
}

export function applyFilter(
  columnId: string,
  columnFilters: {
    and?: TableColumnFilterType[] | undefined;
    or?: TableColumnFilterType[] | undefined;
  },
  dispatch: TableDispatch,
  isRelationFilter: boolean
) {
  dispatch({ type: isRelationFilter ? "setRelationFilter" : "setFilter", payload: { ...columnFilters, field: columnId } });
}

export function getPinnedOffset(pinnedColumns: { id: string; minSize: number; maxSize: number }[], id: string) {
  const colIdx = pinnedColumns.findIndex((c) => c.id === id);
  if (colIdx === 0 || colIdx === -1) return 0;
  let offset = 0;
  for (let index = 0; index < colIdx; index += 1) {
    offset += pinnedColumns[index].minSize;
  }
  return offset;
}
