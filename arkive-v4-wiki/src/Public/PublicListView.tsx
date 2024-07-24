import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Avatar, createColumnHelper, Icon, Input, Table } from "../../../components";
import { useGetEntities, useTable } from "../../../hooks";
import { AvailableEntityType, BaseEntityType, CharacterType } from "../../../types";
import { getAvatarInitials, getDefaultEntityIcon, getEntityFields, getEntityLink, getImageURL, IconEnum } from "../../../utils";

const characterColumnHelper = createColumnHelper<CharacterType>();
const columnHelper = createColumnHelper<BaseEntityType>();

function characterColumns(project_id: string) {
  return [
    characterColumnHelper.display({
      id: "portrait_id",
      header: "Portrait",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar
            hasShowImage
            image={getImageURL(project_id, "images", row.original?.portrait?.id || "")}
            initials={getAvatarInitials(row.original.full_name)}
            isBordered
            isTooltipDisabled
            label={row.original.full_name}
            size="md"
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
    characterColumnHelper.accessor("full_name", {
      id: "full_name",
      header: "Full name",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
      },
      minSize: 12,
    }),
  ];
}
function columns(
  entityType: "documents" | "maps" | "graphs" | "calendars" | "dictionaries" | "blueprints",
  project_id: string
) {
  return [
    columnHelper.display({
      id: "is_folder",
      header: "",
      cell: ({ row }) =>
        "image_id" in row.original && row.original?.image_id ? (
          <Avatar
            image={getImageURL(
              project_id,
              entityType === "maps" ? "map_images" : "images",
              (row.original?.image_id as string) || ""
            )}
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
  const [{ orderBy, filters, pagination }, dispatch] = useTable({
    orderBy: [{ field: "full_name", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
    selection: {},
  });

  const { data, isLoading } = useGetEntities<CharacterType>(
    {
      data: { project_id: project_id as string },
      relations: {
        portrait: true,
      },
      orderBy,
      filters,
      pagination,
      fields: ["id", "full_name", "portrait_id"],
    },
    "characters",
    {
      staleTime: 5 * 60 * 1000,
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
    <div className="flex flex-col gap-y-2 p-2">
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
      <Table
        columns={characterColumns(project_id as string)}
        config={{
          orderBy,
          filters,
          getLink: (rowData: any) => getEntityLink(project_id as string, "characters", rowData.id, null),
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
      staleTime: 5 * 60 * 1000,
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
          placeholder="Quick search by first name"
          type="search"
          value={filter}
        />
      </div>
      <Table
        columns={columns(
          type as "documents" | "maps" | "graphs" | "calendars" | "dictionaries" | "blueprints",
          project_id as string
        )}
        config={{
          getLink: (rowData: any) => getEntityLink(project_id as string, type, rowData.id, null),
        }}
        data={base?.data || []}
        dispatch={dispatch}
        isLoading={isInitialLoading}
        key={type}
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
