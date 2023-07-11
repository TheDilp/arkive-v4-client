import { ColumnDef } from "@tanstack/react-table";

import { IconEnum } from "../../../utils";
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

export const FavoriteColumn: ColumnDef<any> = {
  id: "favorite",
  cell: ({ row }) => (
    <Button
      hasNoBackground
      icon={IconEnum.star}
      iconThickness={row.original?.is_favorite ? "fill" : "regular"}
      onClick={undefined}
    />
  ),
};
