import { ColumnDef } from "@tanstack/react-table";

import { SetFavoriteType, TagType } from "../../../types";
import { FavoritesFilters, IconEnum } from "../../../utils";
import { Badge, Button, Checkbox, Tooltip } from "../..";

export const SelectColumn: ColumnDef<any> = {
  id: "select",
  header: ({ table }) => (
    <Checkbox
      name="selectAll"
      onChange={(_, e) => {
        const t = table.getToggleAllRowsSelectedHandler();
        t(e);
      }}
      value={table.getIsAllRowsSelected()}
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      name={row.id}
      onChange={(_, e) => {
        const t = row.getToggleSelectedHandler();
        t(e);
      }}
      value={row.getIsSelected()}
    />
  ),
};

export const FavoriteColumn: (setFavorite: (data: SetFavoriteType) => Promise<void>) => ColumnDef<any> = (
  setFavorite: (data: SetFavoriteType) => Promise<void>,
) => ({
  id: "is_favorite",
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
  },
});

export const TagColumn: ColumnDef<any & { tags: TagType[] }> = {
  id: "tags",
  header: "Tags",
  meta: {
    noLink: true,
  },
  minSize: 12,
  maxSize: 12,
  cell: ({ row }) => (
    <div className="flex w-full max-w-full items-center gap-x-2">
      {row.original?.tags?.length ? (
        <div className="w-fit">
          <Badge customColor={row.original.tags[0].color} label={row.original.tags[0].title} />
        </div>
      ) : null}
      {row.original?.tags?.length > 1 ? (
        <Tooltip
          content={row.original.tags
            .slice(1)
            .map((tag: TagType) => tag.title)
            .join(", ")}>
          <div className="w-min max-w-min">
            <Badge label={`+${row.original.tags.length - 1}`} size="sm" variant="secondary" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  ),
};
