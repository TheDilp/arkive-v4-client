import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Avatar, CharacterCard, createColumnHelper, Icon, Input, Table } from "../../../components";
import { useGetEntities, useGetInfiniteEntities, useTable } from "../../../hooks";
import { AvailableEntityType, BaseEntityType, CharacterType } from "../../../types";
import { getDefaultEntityIcon, getEntityFields, getEntityLink, IconEnum } from "../../../utils";

const columnHelper = createColumnHelper<BaseEntityType>();

function columns(entityType: "documents" | "maps" | "graphs" | "calendars" | "dictionaries" | "blueprints") {
  return [
    columnHelper.display({
      id: "is_folder",
      header: "",
      cell: ({ row }) =>
        "image_id" in row.original && row.original?.image_id ? (
          <Avatar
            imageType={entityType === "maps" ? "map_images" : "images"}
            image_id={row.original?.image_id as string | null | undefined}
            isBordered
            isTooltipDisabled
            size="sm"
          />
        ) : (
          <Icon
            fontSize={24}
            icon={row.original.is_folder ? IconEnum.folder : row.original.icon || getDefaultEntityIcon(entityType)}
          />
        ),
      maxSize: 3.25,
      minSize: 3.25,
      meta: {
        centered: true,
        noLink: true,
      },
    }),
    columnHelper.display({
      id: "title",
      header: "Title",
      cell: ({ row }) => <div className="truncate">{row.original.title}</div>,
      size: 15,
    }),
  ];
}

function PublicCharacterList() {
  const { project_id } = useParams();
  const [filter, setFilter] = useState("");
  const [{ orderBy, filters }, dispatch] = useTable({
    orderBy: [{ field: "full_name", sort: "asc" }],
    selection: {},
  });

  const {
    data: cardData,
    isFetching,
    fetchNextPage,
  } = useGetInfiniteEntities<CharacterType>(
    {
      data: {
        project_id,
      },

      fields: ["id", "full_name", "age", "owner_id", "portrait_id"],
      filters,
      pagination: {
        limit: 25,
      },
      orderBy,
    },
    "characters",
    {
      keepPreviousData: true,
      getNextPageParam: (_, allPages) => {
        if (allPages[allPages.length - 1]?.data?.length < 10) return undefined;
        return allPages.length;
      },
    }
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
              and: [{ id: "quick_filter", header_name: "quick_filter", field: "full_name", operator: "ilike", value: filter }],
              field: "full_name",
            },
          });
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [filter, dispatch]);

  return (
    <div className="flex max-h-full flex-col gap-y-2 overflow-hidden p-2">
      <div className="w-full lg:ml-auto lg:w-52">
        <Input
          isClearable
          name="quick_filter"
          onChange={({ value }) => setFilter(value as string)}
          placeholder="Quick search by first name"
          type="search"
          value={filter}
        />
      </div>
      <div
        className="grid grid-cols-1 gap-4 overflow-y-auto p-4 pb-36 md:grid-cols-2 lg:grid-cols-4"
        onScroll={(e) => {
          const { currentTarget } = e;
          if (currentTarget) {
            // @ts-ignore
            const scrollFetchMarker = currentTarget.scrollHeight - currentTarget.scrollTop - currentTarget.clientHeight <= 1250;
            if (scrollFetchMarker && !isFetching) {
              fetchNextPage();
            }
          }
        }}>
        {(cardData?.pages || [])?.map((page) =>
          page.data.map((char: CharacterType) => (
            <CharacterCard
              key={char.id}
              full_name={char.full_name}
              id={char?.id}
              is_favorite={char?.is_favorite}
              portrait_id={char?.portrait_id}
            />
          ))
        )}
      </div>
    </div>
  );
}

function PublicEntitiesList({ type }: { type: "documents" | "maps" | "graphs" | "calendars" | "dictionaries" | "blueprints" }) {
  const { project_id } = useParams();
  const [filter, setFilter] = useState("");

  const [{ pagination, filters }, dispatch] = useTable({ selection: [], pagination: { limit: 10, page: 0 } });

  const { data: base, isInitialLoading } = useGetEntities<BaseEntityType & { image_id?: string }>(
    {
      pagination,
      data: {
        project_id,
      },
      filters,
      // @ts-ignore
      fields: type === "blueprints" ? ["id", "title"] : getEntityFields(type as AvailableEntityType),
      orderBy: [
        {
          field: "title",
          sort: "asc",
        },
      ],
    },
    type as AvailableEntityType,
    {
      staleTime: 60 * 1000,
      prefetch: true,
    }
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
              and: [{ id: "quick_filter", header_name: "quick_filter", field: "title", operator: "ilike", value: filter }],
              field: "title",
            },
          });
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [filter, dispatch]);
  return (
    <div className="flex h-full w-full flex-col gap-y-2 p-2">
      <div className="w-full lg:ml-auto lg:w-52">
        <Input
          isClearable
          name="quick_filter"
          onChange={({ value }) => setFilter(value as string)}
          placeholder="Quick search by title"
          type="search"
          value={filter}
        />
      </div>
      <Table
        key={type}
        columns={columns(type as "documents" | "maps" | "graphs" | "calendars" | "dictionaries" | "blueprints")}
        config={{
          getLink: (rowData: any) => getEntityLink(project_id as string, type, rowData.id, null),
        }}
        data={base?.data || []}
        dispatch={dispatch}
        isLoading={isInitialLoading}
        pagination={pagination}
        type={type as AvailableEntityType}
      />
    </div>
  );
}

export function PublicListView() {
  const { type } = useParams();
  if (type === "characters") return <PublicCharacterList />;
  return <PublicEntitiesList type={type as "documents"} />;
}
