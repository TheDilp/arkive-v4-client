import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Avatar, createColumnHelper, Input, Table } from "../../components";
import { useGetEntities, useTable } from "../../hooks";
import { CharacterType } from "../../types";
import { getAvatarInitials, getCharacterFullName, getEntityLink, getImageURL } from "../../utils";

const characterColumnHelper = createColumnHelper<CharacterType>();

function createColumns(project_id: string) {
  return [
    characterColumnHelper.display({
      id: "portrait_id",
      header: "Portrait",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            hasShowImage
            image={getImageURL(project_id, "images", row.original?.portrait?.id || "")}
            initials={getAvatarInitials(`${row.original.first_name} ${row.original?.last_name || ""}`)}
            isBordered
            isTooltipDisabled
            label={getCharacterFullName(row.original.first_name, row.original?.last_name || "")}
            size="xl"
          />
        </div>
      ),
      meta: {
        pinned: true,
        noLink: true,
        centered: true,
      },
      minSize: 4.5,
      maxSize: 4.5,
    }),
    characterColumnHelper.accessor("first_name", {
      id: "first_name",
      header: "First name",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
      },
      minSize: 12,
    }),
    characterColumnHelper.accessor("last_name", {
      id: "last_name",
      header: "Last name",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
      },
      minSize: 12,
    }),
  ];
}

function PublicCharacterList() {
  const { project_id } = useParams();
  const [filter, setFilter] = useState("");
  const [{ orderBy, filters, pagination }, dispatch] = useTable({
    orderBy: [{ field: "first_name", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
    selection: {},
  });

  const { data, isLoading } = useGetEntities<CharacterType>(
    {
      data: { project_id: project_id as string },
      relations: {
        portrait: true,
        tags: true,
      },
      orderBy,
      filters,
      pagination,
      fields: ["id", "first_name", "nickname", "last_name", "portrait_id"],
    },
    "characters",
    {
      staleTime: 5 * 60 * 1000,
      prefetch: true,
      isPublic: true,
    },
  );

  useLayoutEffect(() => {
    if (!filter) {
      dispatch({
        type: "clearAllFilters",
      });
    }
    if (filter.length >= 3) {
      const timeout = setTimeout(() => {
        if (filter) {
          dispatch({
            type: "clearAllFilters",
          });
          dispatch({
            type: "setFilter",
            payload: {
              and: [{ id: "quick_filter", header_name: "quick_filter", field: "first_name", operator: "ilike", value: filter }],
              field: "first_name",
            },
          });
        }
      }, 750);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [filter, dispatch]);

  return (
    <div className="flex flex-col gap-y-2 p-2">
      <div className="ml-auto w-52">
        <Input
          isClearable
          name="quick_filter"
          onChange={({ value }) => setFilter(value as string)}
          placeholder="Quick search by first name"
          type="search"
          value={filter}
        />
      </div>
      <Table
        columns={createColumns(project_id as string)}
        config={{
          orderBy,
          filters,
          getLink: (rowData: any) => getEntityLink(project_id as string, "characters", rowData.id, null, true),
        }}
        data={data?.data || []}
        dispatch={dispatch}
        isLoading={isLoading}
        pagination={pagination}
        type="characters"
      />
    </div>
  );
}

export function PublicListView() {
  const { type } = useParams();
  if (type === "characters") return <PublicCharacterList />;
  return null;
}
