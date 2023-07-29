/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { ExpandedState, flexRender, getCoreRowModel, getExpandedRowModel, useReactTable } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useState } from "react";
import { Link } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useHandleChange } from "../../hooks";
import {
  FilterEnumType,
  MetaType,
  RequestFilterTypes,
  RequestOrderByType,
  TableColumnFilterComponentType,
  TableColumnFilterType,
  TableDispatch,
  TableType,
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
  removeColumnFilter,
} from "../../utils";
import { Button, ButtonGroup, Checkbox, Input, Select } from "../Form";
import { Badge, Icon, Skeleton } from "../Misc";
import Alert from "../Misc/Alert";
import { Tooltip } from "../Overlay";
import { ExpandedTableRow } from "./TableComponents/ExpandedRow";

export { createColumnHelper } from "@tanstack/react-table";

const TableClasses = tv({
  slots: {
    container: "flex max-h-full h-full overflow-hidden w-full min-h-full",
    table: "flex flex-col h-full min-h-full w-full overflow-y-auto relative",
    head: "border-x border-t border-zinc-600 bg-zinc-950 flex min-w-full flex-col mb-4 w-max flex-1 max-h-10 border-b",
    headerGroup: "flex w-full h-10",
    select: "select-none",
    header: "font-merriweather truncate select-none h-10",
    sortableHeader: "flex cursor-pointer items-center gap-x-1",
    subheaderContainer: "px-2",
    subheaderFiltersRow: "flex flex-nowrap items-center py-1 gap-x-2 h-10",
    subheaderFilterBadges: "flex max-w-full items-center gap-x-2 overflow-x-auto",
    subheaderRowTitle: "font-medium",
    bodyContainer: "min-w-full content-start overflow-hidden max-h-full w-max flex flex-col justify-start",
    body: "flex flex-col w-full max-h-full lg:max-h-full bg-zinc-950 border-x border-t overflow-y-auto border-zinc-600",
    rowContainer: "flex flex-col",
    row: "flex flex-1 min-h-[3rem] max-h-[3rem] border-b border-zinc-600 transition-all duration-100 font-lato",
    selectedRow: "bg-blue-400",
    content: "flex flex-1 items-center h-full truncate max-w-full px-2 box-border border-zinc-600 border-r last:border-r-0",
    centeredContent: "flex items-center justify-center",
    paginationContainer:
      "flex lg:h-10 h-8 max-h-8 lg:max-h-10 items-start justify-between border-zinc-600 pl-2 pt-0.5 max-w-full sticky bottom-0 bg-zinc-950",
    pageCountContainer: "font-lato flex flex-nowrap items-center gap-x-2",
    pageCount: "w-max",
    showPageCount: "flex flex-nowrap items-center gap-x-2",
    showPageCountSelectContainer: "w-16",
    paginationButtonsContainer: "flex h-full flex-nowrap [&>*>button]:w-10 [&>*>button]:border-y-0 [&>*>button]:border-r-0",
  },
  variants: {
    isSubheaderEnabled: {
      true: {
        head: "max-h-20 h-20",
        headerGroup: "border-b border-zinc-600",
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
                      and: [...(prev.and || [])].concat({
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
        onClick={() => applyFilter(columnId as string, columnFilters, dispatch)}
        variant="success"
      />
    </div>
  );
}

function TableSubheaderFilterBadges({
  filters,
  dispatch,
}: {
  filters: { and?: TableColumnFilterType[]; or?: TableColumnFilterType[] };
  dispatch: TableDispatch;
}) {
  const { subheaderFilterBadges } = TableClasses();
  const andFiltersByField = groupFiltersByField(filters?.and || []);
  const orFiltersByField = groupFiltersByField(filters?.or || []);

  const fields = [...new Set(Object.keys(andFiltersByField).concat(Object.keys(orFiltersByField)))];

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
export function Table({ columns, data, config, isLoading, pagination, dispatch, type }: TableType) {
  const { filters, orderBy, expandable, getLink } = config || {};
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const areFiltersActive = !!filters?.and?.length || !!filters?.or?.length;
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
    selectedRow,
    content: contentClasses,
    centeredContent,
    paginationContainer,
    pageCountContainer,
    pageCount,
    showPageCount,
    showPageCountSelectContainer,
    paginationButtonsContainer,
  } = TableClasses({ isSubheaderEnabled });

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
    }),
    getCoreRowModel: getCoreRowModel(),
    getRowCanExpand: () => !!expandable,
    getExpandedRowModel: getExpandedRowModel(),
  });
  if (isLoading) return <Skeleton type="table" />;
  return (
    <div className={container()}>
      <div className={tableClasses()}>
        <div className={head()}>
          {table.getHeaderGroups().map((headerGroup) => (
            <div key={headerGroup.id} className={headerGroupClasses()}>
              {headerGroup.headers.map((hdr) => {
                const { header, id, meta } = hdr.column.columnDef;
                const activeColumnFilters = {
                  and: (filters?.and || []).filter((filt) => filt.field === id),
                  or: (filters?.or || []).filter((filt) => filt.field === id),
                };
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
                            <TableColumnFilter
                              columnId={id}
                              dispatch={dispatch}
                              filterOptions={(meta as MetaType)?.filterOptions || []}
                              filters={activeColumnFilters}
                              isOrDisabled={["is_favorite"].includes(hdr.column.id)}
                            />
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
                            if (orderBy?.sort === "asc" && column_id === orderBy.field) {
                              sortValue = "desc" as const;
                            } else if (orderBy?.sort === "desc" && column_id === orderBy.field) {
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
                          }
                        }}
                        orderBy={orderBy}
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
                <TableSubheaderFilterBadges dispatch={dispatch} filters={filters} />
              </div>
            </div>
          ) : null}
        </div>
        <div className={bodyContainer()}>
          {data?.length ? (
            <div className={body()}>
              {table.getRowModel().rows.map((row) => (
                <Link key={row.id} className={rowContainer()} to={getLink ? getLink(row.original) : "#"}>
                  <div className={`${rowClasses()} ${row.getIsSelected() ? selectedRow() : ""}`}>
                    {row.getVisibleCells().map((cell) => (
                      <div
                        key={cell.id}
                        className={`${contentClasses()} ${cell.column.id === "select" ? selectClasses() : ""} ${
                          (cell.column.columnDef.meta as MetaType)?.centered ? centeredContent() : ""
                        }`}
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                  {row.getIsExpanded() ? <ExpandedTableRow data={row.original} type={type} /> : null}
                </Link>
              ))}
            </div>
          ) : (
            <Alert label="There's no content." variant="info" />
          )}
        </div>
        {pagination ? (
          <div className={paginationContainer()}>
            <div className={pageCountContainer()}>
              <div className={pageCount()}>Page {(pagination?.page || 0) + 1} |</div>
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
                    options={[
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
                    ]}
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
  );
}
