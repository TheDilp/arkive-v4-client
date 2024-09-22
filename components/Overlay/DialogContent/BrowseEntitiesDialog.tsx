import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetInfiniteAssets, useGetInfiniteEntities, useTable } from "../../../hooks";
import { AssetType, AvailableEntityType, HandleChangePropsType, RequestOrderByType } from "../../../types";
import { getEntityFields } from "../../../utils";
import { Image } from "../../DataDisplay";
import { Input } from "../../Form";

function getOrderBy(type: AvailableEntityType): RequestOrderByType<{ full_name?: string; title?: string }> {
  return { sort: "asc", field: type === "characters" ? "full_name" : "title" };
}

export function BrowseEntitiesDialog({
  data,
}: {
  data: {
    onChange: (props: HandleChangePropsType) => void;
    isMultiple?: boolean;
    type: AvailableEntityType;
    imageType: AssetType;
  };
}) {
  const { project_id } = useParams();

  const [filter, setFilter] = useState("");
  const [{ orderBy, pagination, filters }, dispatch] = useTable<{ full_name?: string; title?: string }>({
    orderBy: [getOrderBy(data.type)],
    pagination: { limit: 24 },
  });

  const {
    data: cardData,
    isFetching: isFetchingEntities,
    fetchNextPage: fetchNextEntityPage,
  } = useGetInfiniteEntities<Record<string, string>>(
    {
      data: {
        project_id,
      },
      relations: {
        portrait: true,
        is_favorite: true,
      },
      fields: getEntityFields(data.type),
      orderBy,
      pagination,
      permissions: true,
    },
    data?.type,
    {
      enabled: data.type !== "images",
      keepPreviousData: true,
      getNextPageParam: (_, allPages) => {
        if (allPages[allPages.length - 1]?.data?.length < 10) return undefined;
        return allPages.length;
      },
    }
  );

  const {
    data: infiniteAssets,
    isFetching,
    fetchNextPage,
  } = useGetInfiniteAssets(
    {
      permissions: true,
      fields: ["id", "title", "type"],
      pagination: {
        limit: 24,
      },
      filters,
      orderBy: [
        {
          field: "title",
          sort: "asc",
        },
      ],
    },
    data.imageType,
    project_id,
    {
      enabled: data.type === "images",
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
              and: [
                {
                  id: "quick_filter",
                  header_name: "title",
                  field: "title",
                  operator: "ilike",
                  value: filter,
                },
              ],
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
    <div className="flex h-full flex-col gap-y-2 overflow-hidden">
      <Input
        isClearable
        name="quick_filter"
        onChange={({ value }) => setFilter(value as string)}
        placeholder="Quick search by title"
        value={filter}
      />
      <div
        className="grid grid-cols-1 gap-2 overflow-y-auto p-4 pb-36 md:grid-cols-2 lg:grid-cols-6"
        onScroll={(e) => {
          const { currentTarget } = e;
          if (currentTarget) {
            // @ts-ignore
            const scrollFetchMarker = currentTarget.scrollHeight - currentTarget.scrollTop - currentTarget.clientHeight <= 1000;
            if (scrollFetchMarker && !isFetching && !isFetchingEntities) {
              if (data.type === "images") fetchNextPage();
              else fetchNextEntityPage();
            }
          }
        }}>
        {data.type === "images"
          ? (infiniteAssets?.pages || [])?.map((page) =>
              page.data.map((img) => (
                <div
                  key={img.id}
                  className="animate-in fade-in relative col-span-1 flex h-[8rem] flex-col items-center justify-center overflow-hidden rounded bg-cover shadow transition-all duration-500">
                  <Image
                    hasTitle
                    image={{ title: img.title, project_id: project_id as string, type: data.imageType, id: img.id }}
                    isLazyLoading
                    type={data.imageType}
                  />
                </div>
              ))
            )
          : (cardData?.pages || [])?.map((page) =>
              page.data.map((entity) => (
                <div key={entity.id}>
                  <div className="animate-in fade-in relative col-span-1 flex h-[8rem] flex-col items-center justify-center overflow-hidden rounded bg-cover shadow transition-all duration-500">
                    <Image
                      hasTitle
                      image={{
                        title: entity?.full_name || entity?.title,
                        project_id: project_id as string,
                        type: data.type === "maps" ? "map_images" : "images",
                        id: entity?.portrait_id || entity?.image,
                      }}
                      isLazyLoading
                      type={data.type === "maps" ? "map_images" : "images"}
                    />
                  </div>
                </div>
              ))
            )}
      </div>
    </div>
  );
}
