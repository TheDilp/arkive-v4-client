import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetInfiniteAssets, useGetInfiniteEntities, useTable } from "../../../hooks";
import { AssetType, AvailableEntityType, OnSearchChangePropsType, RequestOrderByType } from "../../../types";
import { AvailableIcons, dialogAtom, getEntityFields, IconEnum } from "../../../utils";
import { Image } from "../../DataDisplay";
import { Button, Input } from "../../Form";

function getOrderBy(type: AvailableEntityType): RequestOrderByType<{ full_name?: string; title?: string }> {
  return { sort: "asc", field: type === "characters" ? "full_name" : "title" };
}
const cardClasses =
  "animate-in fade-in relative col-span-1 flex h-[8rem] flex-col items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden rounded border-2 border-zinc-700 bg-cover shadow transition-all";
export function BrowseEntitiesDialog({
  data,
}: {
  data: {
    name: string;
    onChange: (props: OnSearchChangePropsType) => void;
    isMultiple?: boolean;
    type: AvailableEntityType;
    imageType: AssetType;
  };
}) {
  const { project_id } = useParams();
  const resetDialog = useResetAtom(dialogAtom);
  const [selection, setSelection] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [{ orderBy, pagination, filters }, dispatch] = useTable<{ full_name?: string; title?: string }>({
    orderBy: [getOrderBy(data.type)],
    pagination: { limit: 48 },
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
      filters,
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
  } = useGetInfiniteAssets<Record<string, string>>(
    {
      permissions: true,
      fields: ["id", "title", "type"],
      pagination,
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
                  field: data.type === "characters" ? "full_name" : "title",
                  operator: "ilike",
                  value: filter,
                },
              ],
              field: data.type === "characters" ? "full_name" : "title",
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
        {((data.type === "images" ? infiniteAssets?.pages : cardData?.pages) || [])?.map((page) =>
          page.data.map((entity: Record<string, string>) => {
            const isSelected = selection.includes(entity.id);
            return (
              <div
                key={entity.id}
                className={`${cardClasses} ${isSelected ? "border-blue-300 bg-blue-500" : ""}`}
                onClick={() => {
                  if (data?.isMultiple) {
                    if (isSelected)
                      setSelection((prev) => {
                        const temp = [...prev];
                        const idx = temp.findIndex((item) => item === entity.id);
                        if (idx > -1) {
                          temp.splice(idx, 1);
                          return temp;
                        }
                        return prev;
                      });
                    else setSelection((prev) => [...prev, entity.id]);
                  } else {
                    if (isSelected) setSelection([]);
                    else setSelection([entity.id]);
                  }
                }}>
                <div className={`absolute z-20 h-full w-full bg-blue-500 ${isSelected ? "opacity-50" : "opacity-0"}`} />
                <Image
                  hasTitle
                  image={{
                    title: entity?.full_name || entity?.title,
                    project_id: project_id as string,
                    type: data.imageType || (data.type === "maps" ? "map_images" : "images"),
                    id: data.type === "images" ? entity.id : entity?.portrait_id || entity?.image,
                  }}
                  isLazyLoading
                  type={data.imageType || (data.type === "maps" ? "map_images" : "images")}
                />
              </div>
            );
          })
        )}
      </div>
      <div className="mt-auto">
        <Button
          icon={IconEnum.check}
          label="Select"
          onClick={() => {
            const selected = ((data.type === "images" ? infiniteAssets?.pages : cardData?.pages) || [])
              .flatMap((page) => page.data)
              .filter((entity) => selection.includes(entity.id));

            if (data.type === "characters") {
              for (let index = 0; index < selected.length; index++) {
                data.onChange({
                  name: data.name,
                  value: selected[index].id,
                  label: selected[index].full_name,
                  image: selected[index]?.portrait_id,
                  type: "characters",
                });
              }
            } else if (data.type === "images") {
              for (let index = 0; index < selected.length; index++) {
                data.onChange({
                  name: data.name,
                  value: selected[index].id,
                  label: selected[index].title,
                  image: selected[index]?.id,
                  type: "images",
                });
              }
            } else {
              for (let index = 0; index < selected.length; index++) {
                data.onChange({
                  name: data.name,
                  value: selected[index].id,
                  label: selected[index].title,
                  image: selected[index]?.image,
                  icon: selected[index]?.icon as AvailableIcons | undefined,
                  type: data.type,
                });
              }
            }
            resetDialog();
          }}
          variant="info"
        />
      </div>
    </div>
  );
}
