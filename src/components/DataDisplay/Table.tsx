/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Dispatch, Fragment, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useHandleChange } from "../../hooks";
import {
  AvailableEntityType,
  BlueprintFieldTypes,
  FilterEnumType,
  HandleChangePropsType,
  MetaType,
  RequestFilterTypes,
  RequestOrderByType,
  SearchableEntities,
  TableColumnFilterComponentType,
  TableColumnFilterType,
  TableParams,
  TableType,
} from "../../types";
import {
  applyFilter,
  capitalizeSentence,
  getAreColumnFiltersActive,
  getFieldValueFromType,
  getFilterTooltip,
  getIsApplyColumnFiltersDisabled,
  getPinnedOffset,
  getSentenceCase,
  getTableColumns,
  getTableColumnWidths,
  groupFiltersByHeader,
  IconEnum,
  removeColumnFilter,
} from "../../utils";
import { Button, ButtonGroup, Checkbox, Input, Search, Select } from "../Form";
import { Badge, Icon, Skeleton } from "../Misc";
import { Tooltip } from "../Overlay";
import { EntityPreview } from "./EntityPreview";
import { ExpandedTableRow } from "./TableComponents/ExpandedRow";

export { createColumnHelper } from "@tanstack/react-table";

const TableClasses = tv({
  slots: {
    head: "border-r border-t border-zinc-800 z-40 shadow-lg bg-zinc-950 flex min-w-full w-fit mb-4 mih-h-[3rem] max-h-[3rem] h-12 sticky top-0 border-b select-none",
    select: "select-none z-20",
    sortableHeader: "flex cursor-pointer items-center gap-x-1",
    subheaderContainer: "py-0.5 max-h-[2.5rem] sticky top-0 left-0",
    subheaderFiltersRow: "flex flex-nowrap items-center py-1 gap-x-2 h-8 w-full",
    subheaderFilterBadges: "flex max-w-full items-center gap-x-2 overflow-x-hidden flex-1 sticky left-0 top-0",
    subheaderRowTitle: "font-medium",
    rowContainer:
      "flex flex-col bg-zinc-950 min-h-[3rem] relative min-w-fit last:border-b last:min-h-[3.04rem] border-zinc-800",
    row: "flex flex-1 cursor-default min-h-[3rem] max-h-[3rem] transition-all duration-100 font-lato border-t border-r border-zinc-800",
    hasLinkRow: "group-hover:bg-zinc-700 cursor-pointer",
    hasRowAction: "cursor-pointer",
    contentWrapper: "flex items-center truncate h-full",
    content: "flex flex-1 items-center  px-2 border-zinc-800 border-r last:border-r-0 first:border-l",
    centeredContent: "flex items-center justify-center",
    paginationContainer:
      "flex h-10 max-h-[2.5rem] min-h-[2.5rem] items-start justify-between border-zinc-800 pl-2 pt-0.5 sticky bottom-0 bg-zinc-950 pb-9 pt-1",
    pageCountContainer: "font-lato flex flex-nowrap items-center gap-x-2",
    pageCount: "w-max",
    showPageCount: "flex flex-nowrap items-center gap-x-2",
    showPageCountSelectContainer: "w-20",
    paginationButtonsContainer:
      "flex min-h-full lg:h-9 h-8 flex-nowrap [&>*>button]:w-10 [&>*>button]:border-y-0 [&>*>button]:border-r-0",
  },
  variants: {
    isSubheaderEnabled: {
      true: {
        head: "mb-0",
        headerGroup: "border-b border-zinc-800",
      },
    },
    hasNoHeaderGap: {
      true: {
        head: "mb-0 border-b-0",
        body: "mt-0",
      },
    },
    hasNoData: {
      true: {
        head: "mb-0",
      },
    },
  },
});

const TableFilterClasses = tv({
  slots: {
    base: "rounded shadow bg-zinc-800 px-4 py-2",
    columnFilterContainer: "z-[99999] flex min-w-[25rem] flex-col gap-y-2",
    columnFilterCategory: "flex flex-nowrap items-center pl-1",
    columnFilterTitle: "font-lato text-center text-xl",
    columnFilterCategoryTitle: "font-lato w-full",
    columnFilterButtonContainer: "w-min [&>button]:h-8 [&>button]:w-8",
    columnFilterDivider: "border-zinc-800",
  },
});

function TableColumnFilterList({
  colId,
  applyFilter: applyFilterFn,
  filters,
  handleChange,
  filterOptions,
  setColumnFilters,
  type,
}: {
  colId: string;
  applyFilter: () => void;
  filters: TableColumnFilterType[];
  type: "and" | "or";
  handleChange: (newValue: HandleChangePropsType) => void;
  filterOptions: FilterEnumType[];
  setColumnFilters: Dispatch<
    SetStateAction<{
      and?: TableColumnFilterType[] | undefined;
      or?: TableColumnFilterType[] | undefined;
    }>
  >;
}) {
  return (
    <>
      {(colId === "is_public" || colId === "is_favorite" ? filters.slice(0, 1) : filters).map((filt, index) => {
        const filterType = filterOptions?.find((opt) => opt.value === filt.operator);

        return (
          <div key={filt.id} className="flex flex-col gap-y-2">
            <div className="flex w-full flex-nowrap items-center gap-x-2">
              <div className="w-1/3">
                <Select
                  name={`${type}[${index}].operator`}
                  onChange={handleChange}
                  options={filterOptions}
                  placeholder="Filter type"
                  size="sm"
                  value={filt.operator}
                />
              </div>
              <div className="flex flex-1 justify-end">
                {filt.operator && !Array.isArray(filt.value) && filterType?.type === "boolean" ? (
                  <Checkbox
                    name={`${type}[${index}].value`}
                    onChange={({ name, value }) => handleChange({ name, value: typeof value === "boolean" ? value : !!value })}
                    size="lg"
                    value={filt.value as boolean}
                  />
                ) : null}
                {filt.operator && !Array.isArray(filt.value) && filterType?.type === "text" ? (
                  <Input
                    name={`${type}[${index}].value`}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !!filt.value) applyFilterFn();
                    }}
                    size="sm"
                    value={filt.value as string}
                  />
                ) : null}
                {filt.operator && !Array.isArray(filt.value) && filterType?.type === "number" ? (
                  <Input
                    name={`${type}[${index}].value`}
                    onChange={({ name, value }) => handleChange({ name, value: parseFloat(value as string) })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !!filt.value) applyFilterFn();
                    }}
                    size="sm"
                    type="number"
                    value={filt.value as string}
                  />
                ) : null}
                {filt.operator &&
                !Array.isArray(filt.value) &&
                (filterType?.type === "select" || filterType?.type === "select_multiple") ? (
                  <Select
                    name={`${type}[${index}].value`}
                    onChange={(newValue) => {
                      const opt = filterOptions?.[0]?.options?.find((o) => o.value === newValue.value);
                      handleChange([newValue, { name: `${type}[${index}].relationalData.label`, value: opt?.label || "" }]);
                    }}
                    options={(filterOptions?.[0]?.options as { label: string; value: string }[]) || []}
                    size="sm"
                    value={filt?.value as string | undefined}
                  />
                ) : null}
                {filt.operator &&
                !Array.isArray(filt.value) &&
                filterType?.type === "search" &&
                filterType?.searchType &&
                filt?.relationalData ? (
                  <EntityPreview
                    clearAction={() =>
                      handleChange([
                        { name: `${type}[${index}].value`, value: "" },
                        { name: `${type}[${index}].relationalData`, value: undefined },
                      ])
                    }
                    icon={filt.relationalData.icon}
                    id={filt.relationalData.value}
                    image_id={filt.relationalData.image}
                    size="sm"
                    title={filt.relationalData.label}
                    type={filterType?.searchType as AvailableEntityType}
                  />
                ) : null}

                {filt.operator &&
                !Array.isArray(filt.value) &&
                filterType?.type === "search" &&
                filterType?.searchType &&
                !filt?.relationalData ? (
                  <Search
                    name={`${type}[${index}].value`}
                    onChange={({ name, value, label, image, icon }) =>
                      handleChange([
                        { name, value },
                        {
                          name: `${type}[${index}].relationalData`,
                          value: { value, label, image, icon, blueprint_field_id: colId },
                        },
                      ])
                    }
                    searchEntity={filterType?.searchType as SearchableEntities}
                    size="sm"
                    value={filt.value as string | undefined}
                  />
                ) : null}
              </div>
              <div className="[&>button]:w-8">
                <Button
                  hasNoBackground
                  icon={IconEnum.close}
                  iconSize={20}
                  onClick={() => {
                    if (colId === "is_public" || colId === "is_favorite") {
                      filters.forEach((flt) => removeColumnFilter(flt.id, type, setColumnFilters));
                    } else {
                      removeColumnFilter(filt.id, type, setColumnFilters);
                    }
                  }}
                  size="sm"
                />
              </div>
            </div>
            {index !== filters.length - 1 && colId !== "is_public" && colId !== "is_favorite" ? (
              <div className="flex h-full items-center justify-center">
                <div className="w-16">
                  <Badge label={capitalizeSentence(type)} variant="info" />
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function TableColumnFilter({
  columnId,
  columnHeader,
  filters,
  isAndDisabled,
  isOrDisabled,
  dispatch,
  meta,
}: TableColumnFilterComponentType) {
  const {
    columnFilterContainer,
    columnFilterTitle,
    columnFilterCategory,
    columnFilterCategoryTitle,
    columnFilterButtonContainer,
    columnFilterDivider,
  } = TableFilterClasses();

  const [columnFilters, setColumnFilters] = useState<{ and?: TableColumnFilterType[]; or?: TableColumnFilterType[] }>({
    and: (filters?.and || []).map((filt) => ({ ...filt, id: crypto.randomUUID() })),
    or: (filters?.or || []).map((filt) => ({ ...filt, id: crypto.randomUUID() })),
  });
  const { filterOptions, isRelationFilter, relationType } = meta as MetaType;
  const { handleChange } = useHandleChange({ data: columnFilters, setData: setColumnFilters });
  if (!filterOptions) return null;
  return (
    <div className={columnFilterContainer()}>
      <h4 className={columnFilterTitle()}>
        {getSentenceCase(typeof columnHeader === "string" ? columnHeader : "" || "")}{" "}
        {columnHeader && typeof columnHeader === "string" ? "filters" : ""}
      </h4>
      {isAndDisabled ? null : (
        <>
          <div className={columnFilterCategory()}>
            <div className={columnFilterCategoryTitle()}>AND FILTERS</div>
            <div className={columnFilterButtonContainer()}>
              <Button
                icon={IconEnum.add}
                onClick={() => {
                  if (columnId)
                    setColumnFilters((prev) => ({
                      ...prev,
                      and: [...(prev.and || [])].concat({
                        id: crypto.randomUUID(),
                        field: relationType
                          ? getFieldValueFromType((meta as MetaType)?.relationType as BlueprintFieldTypes) || ""
                          : columnId,
                        value: relationType === "boolean" ? false : "",
                        operator: filterOptions[0].value as RequestFilterTypes,
                        header_name: columnHeader,
                      }),
                    }));
                }}
                variant="info"
              />
            </div>
          </div>
          <TableColumnFilterList
            applyFilter={() => applyFilter(columnId as string, columnFilters, dispatch, !!isRelationFilter)}
            colId={columnId as string}
            filterOptions={filterOptions}
            filters={columnFilters?.and || []}
            handleChange={handleChange}
            setColumnFilters={setColumnFilters}
            type="and"
          />
          <hr className={columnFilterDivider()} />
        </>
      )}

      {isOrDisabled ? null : (
        <div className={columnFilterCategory()}>
          <div className={columnFilterCategoryTitle()}>{isAndDisabled ? "" : "OR"} FILTERS</div>
          <div className={columnFilterButtonContainer()}>
            <Button
              icon={IconEnum.add}
              isDisabled={
                columnId === "is_favorite" || columnId === "is_public"
                  ? columnFilters?.or?.some((filt) => filt.field === columnId)
                  : false
              }
              onClick={() => {
                if (columnId)
                  setColumnFilters((prev) => ({
                    ...prev,
                    or: [...(prev.or || [])].concat(
                      columnId === "is_favorite" || columnId === "is_public"
                        ? {
                            id: crypto.randomUUID(),
                            field: columnId,
                            value: false,
                            operator: filterOptions[0].value as RequestFilterTypes,
                            header_name: columnId,
                          }
                        : {
                            id: crypto.randomUUID(),
                            field: relationType
                              ? getFieldValueFromType((meta as MetaType)?.relationType as BlueprintFieldTypes) || ""
                              : columnId,
                            value: relationType === "boolean" ? false : "",
                            operator: filterOptions[0].value as RequestFilterTypes,
                            header_name: columnHeader,
                          },
                    ),
                  }));
              }}
              variant="info"
            />
          </div>
        </div>
      )}
      <TableColumnFilterList
        applyFilter={() => applyFilter(columnId as string, columnFilters, dispatch, !!isRelationFilter)}
        colId={columnId as string}
        filterOptions={filterOptions}
        filters={columnFilters?.or || []}
        handleChange={handleChange}
        setColumnFilters={setColumnFilters}
        type="or"
      />

      <Button
        icon={IconEnum.filter}
        isDisabled={getIsApplyColumnFiltersDisabled(columnFilters)}
        label="Apply filters"
        onClick={() => {
          if (columnId === "is_favorite" || columnId === "is_public") {
            const orFilter = columnFilters?.or?.find((filt) => filt?.field === columnId);
            // Favorites filter has an empty string by default
            // Needs to be converted to false
            if (orFilter && (orFilter?.value === "" || orFilter?.value === false)) {
              applyFilter(
                columnId as string,
                {
                  // header_name gets sentence_case'd for the badge when filter is applied
                  // left as snake case for backed
                  or: [
                    { ...orFilter, header_name: columnId, value: false },
                    { ...orFilter, header_name: columnId, operator: "is", value: null },
                  ],
                },
                dispatch,
                !!isRelationFilter,
              );
            } else if (orFilter && orFilter?.value === true) {
              applyFilter(
                columnId as string,
                {
                  // header_name gets sentence_case'd for the badge when filter is applied
                  // left as snake case for backed
                  or: [{ ...orFilter, header_name: columnId, value: true }],
                },
                dispatch,
                !!isRelationFilter,
              );
            }
          } else if (isRelationFilter) {
            if (columnFilters.and?.length || columnFilters.or?.length)
              applyFilter(
                columnId as string,
                {
                  and: (columnFilters?.and || [])?.map((filt) => ({
                    ...filt,
                    relationalData: { ...(filt?.relationalData || {}), blueprint_field_id: columnId },
                  })),
                  or: (columnFilters?.or || [])?.map((filt) => ({
                    ...filt,
                    relationalData: { ...(filt?.relationalData || {}), blueprint_field_id: columnId },
                  })),
                },
                dispatch,
                !!isRelationFilter,
              );
          } else if (columnFilters.and?.length || columnFilters.or?.length)
            applyFilter(columnId as string, columnFilters, dispatch, !!isRelationFilter);
        }}
        variant="success"
      />
    </div>
  );
}

function TableSubheaderFilterBadges({
  filters,
  relationFilters,
  dispatch,
}: Pick<TableParams, "filters" | "relationFilters"> & Pick<TableType, "dispatch">) {
  const { subheaderFilterBadges } = TableClasses();
  const andFiltersByField = groupFiltersByHeader(filters?.and || []);
  const orFiltersByField = groupFiltersByHeader(filters?.or || []);
  const andRelationFiltersByField = groupFiltersByHeader(relationFilters?.and || []);
  const orRelationFiltersByField = groupFiltersByHeader(relationFilters?.or || []);
  const fields = [...new Set(Object.keys(andFiltersByField).concat(Object.keys(orFiltersByField)))];
  const relationFields = [...new Set(Object.keys(andRelationFiltersByField).concat(Object.keys(orRelationFiltersByField)))];
  return (
    <div className={subheaderFilterBadges()}>
      {fields.map((field) => (
        <Tooltip
          key={field}
          content={getFilterTooltip({ and: andFiltersByField[field] || [], or: orFiltersByField[field] || [] })}
          isPortal>
          <div>
            <Badge
              clearAction={() =>
                dispatch({
                  type: "removeFilterByField",
                  payload: field,
                })
              }
              label={getSentenceCase(field)}
              variant="info"
            />
          </div>
        </Tooltip>
      ))}
      {relationFields.map((field) => (
        <Tooltip
          key={field}
          content={getFilterTooltip({
            and: andRelationFiltersByField[field] || [],
            or: orRelationFiltersByField[field] || [],
          })}
          isPortal
          variant="secondary">
          <div>
            <Badge
              clearAction={() =>
                dispatch({
                  type: "removeRelationFilterByField",
                  payload: field,
                })
              }
              label={getSentenceCase(field)}
              variant="info"
            />
          </div>
        </Tooltip>
      ))}
      <div className="ml-auto">
        <Button
          icon={IconEnum.close}
          label="Clear all"
          onClick={() => dispatch({ type: "clearAllFilters" })}
          size="sm"
          variant="secondary"
        />
      </div>
    </div>
  );
}

function OrderByHeaderIcon({ onClick, orderBy, id }: { onClick: () => void; orderBy?: RequestOrderByType<any>; id?: string }) {
  return (
    <div className="w-min">
      <Button
        hasNoBackground
        icon={orderBy?.sort === "asc" ? IconEnum.sort_asc : IconEnum.sort_desc}
        isIconOnly
        onClick={onClick}
        variant={orderBy?.sort && orderBy?.field === id ? "primary" : "secondary"}
      />
    </div>
  );
}
export function Table({ columns, data = [], config, isLoading, pagination, dispatch, type, skeletonLimit }: TableType) {
  const { filters, relationFilters, orderBy, expandable, hasNoHeaderGap, selection, selectedActions, getLink, onRowClick } =
    config || {};
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const isSubheaderEnabled =
    !!filters?.and?.length || !!filters?.or?.length || relationFilters?.and?.length || relationFilters?.or?.length;

  const {
    head,
    select: selectClasses,
    sortableHeader,
    subheaderContainer,
    subheaderFiltersRow,
    subheaderRowTitle,
    rowContainer,
    row: rowClasses,
    hasLinkRow,
    hasRowAction,
    contentWrapper,
    content: contentClasses,
    centeredContent,
    paginationContainer,
    pageCountContainer,
    pageCount,
    showPageCount,
    showPageCountSelectContainer,
    paginationButtonsContainer,
  } = TableClasses({ isSubheaderEnabled, hasNoHeaderGap, hasNoData: data?.length === 0 });

  const bodyRef = useRef() as MutableRefObject<HTMLDivElement>;
  const headerRef = useRef() as MutableRefObject<HTMLDivElement>;

  const { base: baseFilterClasses } = TableFilterClasses();

  const table = useReactTable({
    data,
    defaultColumn: {
      minSize: 10,
    },
    meta: config,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    manualSorting: true,
    columns: getTableColumns(columns, {
      hasSelect: config?.hasSelect,
      hasFavorite: config?.hasFavorite,
      hasTags: config?.hasTags,
      setFavorite: config?.setFavorite,
      dispatch,
      pagination,
      config: {
        hasTagsWarning: config?.hasTagsWarning,
      },
    }),
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => !!expandable,
    getExpandedRowModel: getExpandedRowModel(),
  });

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  }, [pagination?.page]);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => bodyRef.current,
    estimateSize: () => 48,
    overscan: 15,
  });
  const { rows } = table.getRowModel();

  const pinned = columns.filter((col) => col?.meta?.pinned);
  return (
    <>
      <div
        ref={bodyRef}
        className="scrollbar-hidden max-h-[calc(100%-2.5rem)] overflow-auto border-zinc-800"
        style={{
          height:
            expandable || isLoading
              ? ""
              : `${
                  // 20px added to account for the pagination
                  // 40px added to account for the subheader when it is enabled
                  rowVirtualizer.getTotalSize() +
                  Number(headerRef?.current?.clientHeight) +
                  (pagination ? 20 : 0) +
                  (!hasNoHeaderGap && !pagination ? 28 : 0) +
                  (hasNoHeaderGap && !pagination ? 28 : 0) +
                  (!hasNoHeaderGap && pagination ? 10 : 0) +
                  (isSubheaderEnabled && !pagination ? 40 : 0) +
                  (isSubheaderEnabled && pagination ? 40 : 0)
                }px`,
        }}>
        <div ref={headerRef} className={head()}>
          {table.getFlatHeaders().map((hdr) => {
            const { header, id, meta } = hdr.column.columnDef;
            const activeColumnFilters = {
              and: (filters?.and || [])
                .concat(relationFilters?.and || [])
                .filter(
                  (filt) =>
                    filt.field === id ||
                    filt.relationalData?.blueprint_field_id === id ||
                    filt?.relationalData?.character_field_id === id,
                ),
              or: (filters?.or || [])
                .concat(relationFilters?.or || [])
                .filter(
                  (filt) =>
                    filt.field === id ||
                    filt.relationalData?.blueprint_field_id === id ||
                    filt?.relationalData?.character_field_id === id,
                ),
            };

            return (
              <Fragment key={hdr.id}>
                <div
                  className={`${contentClasses()} ${hdr.id === "select" ? selectClasses() : ""}
                    ${(meta as MetaType)?.centered ? centeredContent() : ""}
                    ${(meta as MetaType)?.pinned ? "sticky" : ""}
                    ${hdr.column.getCanSort() ? sortableHeader() : ""}
                    ${hdr.id === "select" ? "sticky left-0 " : ""}
                    bg-zinc-950 first:border-l`}
                  style={{
                    ...getTableColumnWidths(hdr.column.id, {
                      minSize: hdr.column.columnDef.minSize,
                      maxSize: hdr.column.columnDef.maxSize,
                    }),
                    left: (meta as MetaType)?.pinned
                      ? `${getPinnedOffset(pinned, hdr.column.id) + (config?.hasSelect ? 2.75 : 0)}rem`
                      : "",
                  }}>
                  <div className="truncate">{flexRender(header, hdr.getContext())}</div>
                  {(meta as MetaType)?.filterOptions?.length && dispatch ? (
                    <Tooltip
                      allowedPlacements={["bottom", "left"]}
                      arrowColor="#27272a"
                      content={
                        <div
                          className={baseFilterClasses()}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}>
                          <TableColumnFilter
                            columnHeader={(hdr.column.columnDef.header as string) || ""}
                            columnId={id}
                            dispatch={dispatch}
                            filters={activeColumnFilters}
                            isAndDisabled={hdr.column.id === "is_favorite" || hdr.column.id === "is_public"}
                            meta={meta as MetaType}
                          />
                        </div>
                      }
                      customOffset={{ mainAxis: 8 }}
                      isClickable
                      isPortal>
                      <div
                        className="flex w-min justify-center pl-0.5"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}>
                        <span>
                          <Icon
                            className={
                              getAreColumnFiltersActive(hdr.column.columnDef.header as string, filters, relationFilters, id)
                                ? "text-blue-400"
                                : "text-zinc-700"
                            }
                            fontSize={20}
                            icon={IconEnum.filter}
                          />
                        </span>
                      </div>
                    </Tooltip>
                  ) : null}

                  {(meta as MetaType)?.sortable ? (
                    <OrderByHeaderIcon
                      id={id}
                      onClick={() => {
                        if ((meta as MetaType)?.sortable && dispatch) {
                          let sortValue;
                          const column_id = hdr.column.columnDef?.id;
                          const columnOrderBy = (orderBy || [])?.find((ob) => ob.field === column_id);
                          if (columnOrderBy) {
                            if (columnOrderBy?.sort === "asc" && column_id === columnOrderBy.field) {
                              sortValue = "desc" as const;
                            } else if (columnOrderBy?.sort === "desc" && column_id === columnOrderBy.field) {
                              sortValue = null;
                            } else {
                              sortValue = "asc" as const;
                            }

                            dispatch({
                              type: "setSort",
                              payload: {
                                field: id as string,
                                sort: sortValue,
                              },
                            });
                          } else {
                            dispatch({
                              type: "setSort",
                              payload: {
                                field: id as string,
                                sort: "asc",
                              },
                            });
                          }
                        }
                      }}
                      orderBy={orderBy?.find((ob) => ob.field === id)}
                    />
                  ) : null}
                  {hdr.column.getIsSorted() ? (
                    <Icon icon={hdr.column.getIsSorted() === "asc" ? IconEnum.sort_asc : IconEnum.sort_desc} />
                  ) : null}
                </div>
              </Fragment>
            );
          })}
          {Object.entries(selection || {}).some(([, selectedRows]) => selectedRows.length) ? (
            <div className="absolute left-[2.75rem] z-20 flex h-full w-[calc(100%-2.75rem)] items-center gap-x-1 bg-zinc-800 px-2">
              <span>Selected:</span>
              <b>
                {Object.values(selection || {}).reduce((accumulator, curr) => {
                  // eslint-disable-next-line no-param-reassign
                  accumulator += curr.length;
                  return accumulator;
                }, 0)}
              </b>
              <span className="border-r border-zinc-500 pr-2">rows </span>
              <span className="mx-2 flex items-center gap-x-4">
                {selectedActions?.length
                  ? selectedActions.map((action) => (
                      <div key={action?.label || action?.icon}>
                        <Button
                          hasNoBackground
                          icon={action.icon}
                          onClick={() => {
                            if (action.onClick) {
                              action.onClick();
                            }
                          }}
                          tooltip={action.tooltip}
                          variant={action.variant}
                        />
                      </div>
                    ))
                  : null}
              </span>
            </div>
          ) : null}
        </div>

        {isSubheaderEnabled ? (
          <div className={subheaderContainer()}>
            <div className={subheaderFiltersRow()}>
              <h4 className={subheaderRowTitle()}>Filters:</h4>
              <TableSubheaderFilterBadges dispatch={dispatch} filters={filters} relationFilters={relationFilters} />
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <Skeleton limit={pagination?.limit || skeletonLimit || 10} type="table" />
        ) : (
          rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
            const row = rows[virtualRow.index];
            return (
              <div
                key={row.id}
                className={`${rowContainer()} ${
                  config?.selection && config?.selection[pagination?.page || 0]?.includes(row.original.id)
                    ? "group hover:text-white"
                    : "hover:bg-zinc-800"
                }`}
                style={{
                  height: expandable ? "" : `${virtualRow.size}px`,
                  transform: expandable ? "" : `translateY(${virtualRow.start - index * virtualRow.size}px)`,
                }}>
                <Link
                  onClick={(e) => {
                    if (onRowClick) {
                      e.preventDefault();
                      e.stopPropagation();
                      onRowClick(row.original);
                    }
                  }}
                  to={getLink ? getLink(row.original) : "#"}>
                  <div className={`${rowClasses()} ${onRowClick ? hasRowAction() : ""} group`}>
                    {row.getVisibleCells().map((cell) => (
                      <div
                        key={cell.id}
                        className={`${contentClasses()} ${cell.column.id === "select" ? selectClasses() : ""} ${
                          (cell.column.columnDef.meta as MetaType)?.centered ? centeredContent() : ""
                        } ${cell.column.id === "select" ? "sticky left-0 z-10" : "z-0"}
                      ${config?.selection?.[pagination?.page || 0]?.includes(row.original.id) ? "group-hover:bg-blue-300" : ""}
                       ${
                         config?.selection && config?.selection[pagination?.page || 0]?.includes(row.original.id)
                           ? "bg-blue-400"
                           : "bg-zinc-950"
                       }
                      ${(cell.column.columnDef.meta as MetaType)?.pinned ? "sticky z-10" : ""}
                      ${getLink && !config?.selection?.[pagination?.page || 0]?.includes(row.original.id) ? hasLinkRow() : ""}
                    
                      `}
                        onClick={(e) => {
                          if (
                            cell.column.id === "select" ||
                            cell.column.id === "action" ||
                            cell.column.id === "is_favorite" ||
                            (cell.column.columnDef.meta as MetaType)?.noLink
                          ) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        style={{
                          ...getTableColumnWidths(cell.column.id, {
                            minSize: cell.column.columnDef.minSize,
                            maxSize: cell.column.columnDef.maxSize,
                          }),
                          width: cell.column.columnDef.size,
                          left: (cell.column.columnDef.meta as MetaType)?.pinned
                            ? `${getPinnedOffset(pinned, cell.column.id) + (config?.hasSelect ? 2.75 : 0)}rem`
                            : "",
                        }}>
                        <div className={contentWrapper()}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                      </div>
                    ))}
                  </div>
                </Link>
                {row.getIsExpanded() ? (
                  <div className="max-w-[calc(100vw-2rem)] overflow-x-hidden">
                    <ExpandedTableRow data={row.original} type={type} />
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
      {pagination ? (
        <div className={paginationContainer()}>
          <div className={pageCountContainer()}>
            <div className={pageCount()}>
              Page {(pagination?.page || 0) + 1} | Current count: {data?.length || ""} |
            </div>
            <div className={showPageCount()}>
              Show:
              <div className={showPageCountSelectContainer()}>
                <Select
                  name="limit"
                  onChange={({ value }) => {
                    if (value && !Array.isArray(value))
                      dispatch({
                        type: "setPagination",
                        payload: { ...pagination, limit: parseInt(value, 10) },
                      });
                  }}
                  options={
                    expandable
                      ? [
                          { label: "10", value: "10" },
                          { label: "20", value: "20" },
                          { label: "30", value: "30" },
                          { label: "40", value: "40" },
                          { label: "50", value: "50" },
                        ]
                      : [
                          { label: "10", value: "10" },
                          { label: "20", value: "20" },
                          { label: "30", value: "30" },
                          { label: "40", value: "40" },
                          { label: "50", value: "50" },
                          { label: "60", value: "60" },
                          { label: "70", value: "70" },
                          { label: "80", value: "80" },
                          { label: "90", value: "90" },
                          { label: "100", value: "100" },
                          { label: "200", value: "200" },
                          { label: "250", value: "250" },
                          { label: "300", value: "300" },
                          { label: "350", value: "350" },
                          { label: "400", value: "400" },
                          { label: "450", value: "450" },
                          { label: "500", value: "500" },
                        ]
                  }
                  size="sm"
                  value={pagination?.limit?.toFixed() || "10"}
                />
              </div>
            </div>
          </div>

          <div className={paginationButtonsContainer()}>
            <ButtonGroup
              buttons={[
                {
                  icon: IconEnum.chevron_left,
                  isDisabled: pagination?.page === 0,
                  onClick: () => {
                    if (pagination?.page && pagination?.page > 0) {
                      dispatch({
                        type: "setPagination",
                        payload: { ...pagination, page: pagination.page - 1 },
                      });
                    }
                  },
                  variant: "secondary",
                },
                {
                  icon: IconEnum.chevron_right,
                  isDisabled: data.length < (pagination?.limit || 10),
                  onClick: () =>
                    dispatch({
                      type: "setPagination",
                      payload: { ...pagination, page: (pagination?.page || 0) + 1 },
                    }),
                  variant: "secondary",
                },
              ]}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
