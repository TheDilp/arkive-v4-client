import { ColumnDef } from "@tanstack/react-table";
import { SetStateAction } from "jotai";
import { Dispatch } from "react";

import { FavoriteColumn, SelectColumn, TagColumn } from "../../components/DataDisplay/TableComponents/TableColumns";
import { SetFavoriteType, TableColumnFilterType, TableDispatch } from "../../types";
import { FilterNamesEnum } from "../enums";

export function getTableColumns(
  columns: ColumnDef<any>[],
  {
    hasSelect,
    hasFavorite,
    hasTags,
    setFavorite,
  }: { hasSelect?: boolean; hasFavorite?: boolean; hasTags?: boolean; setFavorite?: (data: SetFavoriteType) => Promise<void> },
) {
  const finalColumns = [...columns];

  if (hasFavorite && setFavorite) {
    finalColumns.unshift(FavoriteColumn(setFavorite));
  }
  if (hasSelect) {
    finalColumns.unshift(SelectColumn);
  }
  if (hasTags) {
    finalColumns.splice(finalColumns.length - 1, 0, TagColumn);
  }

  return finalColumns;
}

export function getTableColumnWidths(
  id: string,
  { minSize, maxSize }: { minSize?: number; maxSize?: number },
): {
  minWidth: string;
  maxWidth?: string;
} {
  if (id === "select" || id === "is_favorite") {
    return { minWidth: "2.5rem", maxWidth: "2.5rem" };
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
  setColumnFilters: Dispatch<SetStateAction<{ and?: TableColumnFilterType[]; or?: TableColumnFilterType[] }>>,
) {
  setColumnFilters((prev) => ({
    ...prev,
    [type]: (prev[type] || []).filter((filt) => filt.id !== id),
  }));
}

export function getFilterBadgeLabel(filter: Pick<TableColumnFilterType, "operator" | "value">) {
  return `${FilterNamesEnum[filter.operator]}: "${filter.value}"`;
}

export function groupFiltersByField(
  items: TableColumnFilterType[],
): Record<string, Pick<TableColumnFilterType, "id" | "operator" | "value">[]> {
  return items.reduce((accumulator: Record<any, any>, item) => {
    const { field, ...rest } = item;
    if (!accumulator[field]) {
      accumulator[field] = [];
    }
    accumulator[field].push(rest);
    return accumulator;
  }, {});
}

export function getAreColumnFiltersActive(
  filters?: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] },
  id?: string,
): boolean {
  if (id) {
    if (filters?.and?.some((filt) => filt.field === id)) return true;
    if (filters?.or?.some((filt) => filt.field === id)) return true;
    return false;
  }
  return false;
}

export function getIsApplyColumnFiltersDisabled(filters: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] }) {
  if (!filters?.and?.length && !filters?.or?.length) return true;
  if (filters?.and) {
    if (filters.and.some((filt) => filt.value === undefined || filt.value === null)) return true;
  }
  if (filters?.or) {
    if (filters.or.some((filt) => filt.value === undefined || filt.value === null)) return true;
  }
  return false;
}
export function getFilterTooltip({
  and,
  or,
}: {
  and?: Pick<TableColumnFilterType, "id" | "value" | "operator">[];
  or?: Pick<TableColumnFilterType, "id" | "value" | "operator">[];
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
) {
  dispatch({ type: "setFilter", payload: { ...columnFilters, field: columnId } });
}
