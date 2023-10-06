/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import omit from "lodash.omit";
import { Dispatch, Fragment, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useGetEntities, useHandleChange } from "../../hooks";
import {
  FilterEnumType,
  MetaType,
  RequestFilterTypes,
  RequestOrderByType,
  TableColumnFilterComponentType,
  TableColumnFilterType,
  TableDispatch,
  TableParams,
  TableType,
  TagType,
} from "../../types";
import {
  applyFilter,
  capitalizeSentence,
  getAreColumnFiltersActive,
  getFilterTooltip,
  getIsApplyColumnFiltersDisabled,
  getSentenceCase,
  getTableColumns,
  getTableColumnWidths,
  groupFiltersByField,
  IconEnum,
  relationFiltersList,
  removeColumnFilter,
} from "../../utils";
import { Button, ButtonGroup, Checkbox, Input, Select } from "../Form";
import { Alert, Badge, Icon, Skeleton } from "../Misc";
import { Tooltip } from "../Overlay";
import { ExpandedTableRow } from "./TableComponents/ExpandedRow";

export { createColumnHelper } from "@tanstack/react-table";

const TableClasses = tv({
  slots: {
    container: "flex max-h-full h-full overflow-hidden w-full min-h-full",
    table: "flex flex-col h-full min-h-full w-full overflow-y-hidden relative",
    head: "border-x border-t border-zinc-600 z-50 shadow-lg bg-zinc-950 sticky top-0 flex min-w-full flex-col mb-4 w-max mih-h-[3rem] border-b",
    headerGroup: "flex w-full h-12",
    select: "select-none",
    header: "font-merriweather truncate select-none flex-1 min-h-[2.5rem]",
    sortableHeader: "flex cursor-pointer items-center gap-x-1",
    subheaderContainer: "px-2",
    subheaderFiltersRow: "flex flex-nowrap items-center py-1 gap-x-2 h-10",
    subheaderFilterBadges: "flex max-w-full items-center gap-x-2 overflow-x-hidden",
    subheaderRowTitle: "font-medium",
    bodyContainer: "min-w-full content-start overflow-auto max-h-full w-max flex flex-col justify-start",
    body: "flex flex-col flex-1 w-full bg-zinc-950 border-x border-y border-zinc-600 overflow-hidden",
    rowContainer: "flex flex-col first:border-t-0 border-b border-zinc-600 hover:bg-zinc-800",
    row: "flex flex-1 cursor-default min-h-[3rem] max-h-[3rem] transition-all duration-100 font-lato",
    hasLinkRow: "hover:text-blue-400 transition-all cursor-pointer",
    contentWrapper: "block truncate",
    content: "flex flex-1 items-center truncate px-2 box-border border-zinc-600 border-r last:border-r-0",
    centeredContent: "flex items-center justify-center",
    paginationContainer:
      "flex lg:h-10 h-8 max-h-8 lg:max-h-10 items-start justify-between border-zinc-600 pl-2 pt-0.5 z-50 sticky bottom-0 bg-zinc-950 pb-9 pt-1",
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
        head: "max-h-20 h-20",
        headerGroup: "border-b border-zinc-600",
      },
    },
    hasNoHeaderGap: {
      true: {
        head: "mb-0 border-b-0",
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
    columnFilterDivider: "border-zinc-600",
  },
});

function TableColumnFilterList({
  applyFilter: applyFilterFn,
  filters,
  handleChange,
  filterOptions,
  setColumnFilters,
  type,
}: {
  applyFilter: () => void;
  filters: TableColumnFilterType[];
  type: "and" | "or";
  handleChange: ({ name, value }: { name: string; value: any }) => void;
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
      {filters.map((filt, index) => {
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
              <div className="flex-1">
                {filt.operator && !Array.isArray(filt.value) && filterType?.type === "boolean" ? (
                  <Checkbox
                    name={`${type}[${index}].value`}
                    onChange={({ name, value }) => handleChange({ name, value: value as boolean })}
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
              </div>
              <div className="[&>button]:w-8">
                <Button
                  hasNoBackground
                  icon={IconEnum.close}
                  iconSize={20}
                  onClick={() => {
                    removeColumnFilter(filt.id, type, setColumnFilters);
                  }}
                  size="sm"
                />
              </div>
            </div>
            {index !== filters.length - 1 ? (
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
  filters,
  filterOptions,
  isAndDisabled,
  isOrDisabled,
  dispatch,
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

  const { handleChange } = useHandleChange({ data: columnFilters, setData: setColumnFilters });

  return (
    <div className={columnFilterContainer()}>
      <h4 className={columnFilterTitle()}>{getSentenceCase(columnId || "")} filters</h4>
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
                      [columnId === "is_favorite" ? "or" : "and"]: [
                        ...(prev[columnId === "is_favorite" ? "or" : "and"] || []),
                      ].concat({
                        id: crypto.randomUUID(),
                        field: columnId,
                        value: "",
                        operator: filterOptions[0].value as RequestFilterTypes,
                      }),
                    }));
                }}
                variant="info"
              />
            </div>
          </div>
          <TableColumnFilterList
            applyFilter={() => applyFilter(columnId as string, columnFilters, dispatch)}
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
          <div className={columnFilterCategoryTitle()}>OR FILTERS</div>
          <div className={columnFilterButtonContainer()}>
            <Button
              icon={IconEnum.add}
              onClick={() => {
                if (columnId)
                  setColumnFilters((prev) => ({
                    ...prev,
                    or: [...(prev.or || [])].concat({
                      id: crypto.randomUUID(),
                      field: columnId,
                      value: "",
                      operator: filterOptions[0].value as RequestFilterTypes,
                    }),
                  }));
              }}
              variant="info"
            />
          </div>
        </div>
      )}
      <TableColumnFilterList
        applyFilter={() => applyFilter(columnId as string, columnFilters, dispatch)}
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
          if (columnId === "is_favorite") {
            const orFilter = columnFilters?.or?.find((filt) => filt?.field === "is_favorite");
            // Favorites filter has an empty string by default
            // Needs to be converted to false
            if (orFilter && (orFilter?.value === "" || orFilter?.value === false)) {
              applyFilter(
                columnId as string,
                {
                  or: [
                    { ...orFilter, value: false },
                    { ...orFilter, operator: "is", value: null },
                  ],
                },
                dispatch,
              );
            } else if (orFilter && orFilter?.value === true) {
              applyFilter(
                columnId as string,
                {
                  or: [{ ...orFilter, value: true }],
                },
                dispatch,
              );
            }
          } else {
            applyFilter(columnId as string, columnFilters, dispatch);
          }
        }}
        variant="success"
      />
    </div>
  );
}

function TableTagFilter({ activeTags, dispatch }: { activeTags: string[]; dispatch: TableDispatch }) {
  const { project_id } = useParams();
  const { data: tags, isFetching } = useGetEntities<TagType>(
    { data: { project_id }, orderBy: [{ field: "title", sort: "asc" }], pagination: { limit: 5000 } },
    "tags",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(activeTags);
  useEffect(() => {
    if (Array.isArray(activeTags)) setSelectedTags(activeTags);
  }, [activeTags]);
  return (
    <div className="flex min-w-[15rem] max-w-[15rem] flex-col gap-y-2">
      <Select
        hasSearch
        isDisabled={isFetching}
        isLoading={isFetching}
        isMultiple
        label="Match all"
        name="tags"
        onChange={({ value }) => setSelectedTags(value as string[])}
        options={tags?.data?.map((tag) => ({ label: tag.title, value: tag.id })) || []}
        value={selectedTags}
      />
      <Button
        icon={IconEnum.filter}
        isDisabled={isFetching || tags?.data?.length === 0 || selectedTags.length === 0}
        label="Apply filter"
        onClick={() => dispatch({ type: "setRelationFilters", payload: { tags: selectedTags } })}
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
  const andFiltersByField = groupFiltersByField(filters?.and || []);
  const orFiltersByField = groupFiltersByField(filters?.or || []);

  const fields = [...new Set(Object.keys(andFiltersByField).concat(Object.keys(orFiltersByField)))];
  const relationFields = [...new Set(Object.keys(relationFilters || {}))];
  return (
    <div className={subheaderFilterBadges()}>
      {fields.map((field) => (
        <Tooltip
          key={field}
          content={getFilterTooltip({ and: andFiltersByField[field] || [], or: orFiltersByField[field] || [] })}>
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
        <div key={field}>
          <Badge
            clearAction={() =>
              dispatch({
                type: "setRelationFilters",
                payload: omit(relationFilters, [field]),
              })
            }
            label={getSentenceCase(field)}
            variant="info"
          />
        </div>
      ))}
    </div>
  );
}

function OrderByHeaderIcon({ onClick, orderBy, id }: { onClick: () => void; orderBy?: RequestOrderByType; id?: string }) {
  return (
    <div className="w-min">
      <Button
        hasNoBackground
        icon={orderBy?.sort === "asc" ? IconEnum.sort_asc : IconEnum.sort_desc}
        onClick={onClick}
        variant={orderBy?.sort && orderBy?.field === id ? "primary" : "secondary"}
      />
    </div>
  );
}
export function Table({ columns, data = [], config, isLoading, pagination, dispatch, type }: TableType) {
  const { filters, relationFilters, orderBy, expandable, hasNoHeaderGap, getLink } = config || {};
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const areFiltersActive = !!filters?.and?.length || !!filters?.or?.length || !!Object.keys(relationFilters || {}).length;
  const isSubheaderEnabled = areFiltersActive;

  const {
    container,
    table: tableClasses,
    head,
    select: selectClasses,
    headerGroup: headerGroupClasses,
    header: headerClasses,
    sortableHeader,
    subheaderContainer,
    subheaderFiltersRow,
    subheaderRowTitle,
    bodyContainer,
    body,
    rowContainer,
    row: rowClasses,
    hasLinkRow,
    contentWrapper,
    content: contentClasses,
    centeredContent,
    paginationContainer,
    pageCountContainer,
    pageCount,
    showPageCount,
    showPageCountSelectContainer,
    paginationButtonsContainer,
  } = TableClasses({ isSubheaderEnabled, hasNoHeaderGap });

  const bodyRef = useRef() as MutableRefObject<HTMLDivElement>;

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
    estimateSize: () => 47,
    overscan: 15,
  });
  const { rows } = table.getRowModel();

  if (isLoading) return <Skeleton limit={pagination?.limit} type="table" />;
  return (
    <div className={container()}>
      <div className={tableClasses()}>
        <div className={bodyContainer()}>
          <div className={head()}>
            {table.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className={headerGroupClasses()}>
                {headerGroup.headers.map((hdr) => {
                  const { header, id, meta } = hdr.column.columnDef;
                  const activeColumnFilters = {
                    and: (filters?.and || []).filter((filt) => filt.field === id),
                    or: (filters?.or || []).filter((filt) => filt.field === id),
                  };
                  const isRelationFilter = relationFiltersList.includes(id || "");
                  return (
                    <div
                      key={hdr.id}
                      className={`${contentClasses()} ${headerClasses()}  ${hdr.id === "select" ? selectClasses() : ""}
                    ${(meta as MetaType)?.centered ? centeredContent() : ""}
                    ${hdr.column.getCanSort() ? sortableHeader() : ""}
                    `}
                      style={{
                        ...getTableColumnWidths(hdr.column.id, {
                          minSize: hdr.column.columnDef.minSize,
                          maxSize: hdr.column.columnDef.maxSize,
                        }),
                      }}>
                      {flexRender(header, hdr.getContext())}
                      {(meta as MetaType)?.filterOptions?.length && dispatch ? (
                        <Tooltip
                          allowedPlacements={["bottom", "left", "left-end", "left-start", "right", "right-start", "right-end"]}
                          arrowColor="#27272a"
                          content={
                            <div
                              className={baseFilterClasses()}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}>
                              {isRelationFilter ? null : (
                                <TableColumnFilter
                                  columnId={id}
                                  dispatch={dispatch}
                                  filterOptions={(meta as MetaType)?.filterOptions || []}
                                  filters={activeColumnFilters}
                                  isAndDisabled={["is_favorite"].includes(hdr.column.id)}
                                />
                              )}
                              {id === "tags" ? (
                                <TableTagFilter activeTags={relationFilters?.tags || []} dispatch={dispatch} />
                              ) : null}
                            </div>
                          }
                          customOffset={{ mainAxis: 8 }}
                          isClickable>
                          <div
                            className="flex w-min justify-center pl-0.5"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}>
                            <Icon
                              className={getAreColumnFiltersActive(filters, id) ? "text-blue-400" : "text-zinc-700"}
                              fontSize={20}
                              icon={IconEnum.filter}
                            />
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
                  );
                })}
              </div>
            ))}
            {isSubheaderEnabled ? (
              <div className={subheaderContainer()}>
                <div className={subheaderFiltersRow()}>
                  <h4 className={subheaderRowTitle()}>Filters:</h4>
                  <TableSubheaderFilterBadges dispatch={dispatch} filters={filters} relationFilters={relationFilters} />
                </div>
              </div>
            ) : null}
          </div>
          {data?.length ? (
            <div ref={bodyRef} className="h-full overflow-auto pb-1">
              <div className={body()} style={{ height: expandable ? "" : `${rowVirtualizer.getTotalSize()}px` }}>
                {rowVirtualizer.getVirtualItems().map((virtualRow, index) => {
                  const row = rows[virtualRow.index];
                  return (
                    <div
                      key={row.id}
                      className={rowContainer()}
                      style={{
                        height: expandable ? "" : `${virtualRow.size}px`,
                        transform: expandable ? "" : `translateY(${virtualRow.start - index * virtualRow.size}px)`,
                      }}>
                      <Link to={getLink ? getLink(row.original) : "#"}>
                        <div
                          className={`${rowClasses()} ${
                            config?.selection && config?.selection[pagination?.page || 0]?.includes(row.index)
                              ? "bg-blue-400 hover:bg-blue-300 hover:text-white"
                              : ""
                          }
                        ${getLink ? hasLinkRow() : ""}
                        `}>
                          {row.getVisibleCells().map((cell) => (
                            <div
                              key={cell.id}
                              className={`${contentClasses()} ${cell.column.id === "select" ? selectClasses() : ""} ${
                                (cell.column.columnDef.meta as MetaType)?.centered ? centeredContent() : ""
                              }
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
                              }}>
                              <div className={contentWrapper()}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Link>
                      {row.getIsExpanded() ? (
                        <div className="">
                          <ExpandedTableRow data={row.original} type={type} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <Alert label="There's no content." variant="info" />
          )}
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
        </div>
      </div>
    </div>
  );
}
