import { ColumnDef } from "@tanstack/react-table";
import { useAtomValue } from "jotai";

import { MetaType, RequestPaginationType, SetFavoriteType, TableDispatch, TagType } from "../../../types";
import { FavoritesFilters, getDeletedAtParams, IconEnum, projectFeatureFlagsAtom, sortTags, TagFilters } from "../../../utils";
import { Alert, Badge, Button, Checkbox, Tooltip } from "../..";

export function SelectColumn(dispatch: TableDispatch, pagination?: RequestPaginationType): ColumnDef<any> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        name="selectAll"
        onChange={({ value }) => {
          if (value) {
            dispatch({
              type: "selectAll",
              payload: { rows: table.getPaginationRowModel().flatRows.map((row) => row.original.id) },
            });
          } else {
            dispatch({ type: "clearSelection" });
          }
        }}
        value={
          table.getPaginationRowModel().flatRows.length ===
          (table.options.meta as MetaType)?.selection?.[pagination?.page || 0]?.length
        }
      />
    ),
    cell: ({ table, row }) => (
      <Checkbox
        name={row.id}
        onChange={() => dispatch({ type: "setSelection", payload: { row: row.original.id } })}
        value={((table.options.meta as MetaType)?.selection?.[pagination?.page || 0] || []).includes(row.original.id)}
      />
    ),
    meta: {
      centered: true,
    },
  };
}

export function FavoriteColumn(setFavorite: (data: SetFavoriteType) => Promise<void>): ColumnDef<any> {
  return {
    id: "is_favorite",
    header: "",
    cell: ({ row }) => (
      <Button
        hasNoBackground
        icon={IconEnum.star}
        iconThickness={row.original?.is_favorite ? "fill" : "regular"}
        onClick={async () => setFavorite(row.original)}
      />
    ),
    meta: {
      filterOptions: FavoritesFilters,
      centered: true,
    },
  };
}

export function TagColumn(hasTagsWarning?: boolean): ColumnDef<any & { tags: TagType[] }> {
  const featureFlags = useAtomValue(projectFeatureFlagsAtom);

  return {
    id: "tags",
    header: "Tags",
    meta: {
      noLink: true,
      filterOptions: TagFilters,
      isRelationFilter: true,
    },
    minSize: 12,
    maxSize: 12,
    cell: ({ row }) => {
      const sortedTags = featureFlags?.sort_tags_alphabetically ? row.original?.tags?.sort(sortTags) : row.original?.tags;

      return (
        <div className="flex w-full max-w-full items-center justify-center gap-x-2">
          {sortedTags?.length ? (
            <div className="w-fit">
              <Badge customColor={row.original.tags[0].color} label={row.original.tags[0].title} />
            </div>
          ) : null}
          {sortedTags?.length > 1 ? (
            <Tooltip
              content={row.original.tags
                .slice(1)
                .map((tag: TagType) => tag.title)
                .join(", ")}
              isPortal>
              <div className="w-min max-w-min">
                <Badge label={`+${row.original.tags.length - 1}`} size="sm" variant="secondary" />
              </div>
            </Tooltip>
          ) : null}
          {sortedTags?.length === 0 && hasTagsWarning ? <Alert label="There are no tags." variant="error-bordered" /> : null}
        </div>
      );
    },
  };
}
export function ArkivedAtColumn(): ColumnDef<any & { deleted_at: string | null }> {
  return {
    id: "deleted_at",
    header: "",
    meta: {
      centered: true,
      noLink: true,
    },
    cell: ({ row }) => {
      const params = getDeletedAtParams(row.original.deleted_at);
      return (
        <Tooltip content={params.tooltip} isDisabled={!params.tooltip}>
          <div>
            <Button
              hasNoBackground
              icon={IconEnum.archive}
              isIconOnly
              onClick={undefined}
              variant={params.isSoonToBeDeleted ? "error" : "primary"}
            />
          </div>
        </Tooltip>
      );
    },
    minSize: 3.25,
    maxSize: 3.25,
  };
}
