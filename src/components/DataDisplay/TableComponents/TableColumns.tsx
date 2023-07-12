import { ColumnDef } from "@tanstack/react-table";

import { SetFavoriteType } from "../../../types";
import { FavoritesFilters, IconEnum } from "../../../utils";
import { Button, Checkbox } from "../..";

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
  id: "favorite",
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
