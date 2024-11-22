import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch, ReactNode, useLayoutEffect, useState } from "react";

import { useGetEntities } from "../../hooks";
import { AvailableEntityType, CharacterFilter, FilterType, TableDispatch } from "../../types";
import { applyCharacterFilter, drawerAtom, IconEnum } from "../../utils";
import { Button, Input } from "../Form";
import { Dropdown } from "../Overlay";

export function TableViewHeader({
  setFilter,
  children,
  dispatch,
  type,
}: {
  setFilter: Dispatch<SetStateAction<string>>;
  dispatch: TableDispatch<any>;
  children: ReactNode | null;
  type: AvailableEntityType;
}) {
  const [localFilter, setLocalFilter] = useState("");
  const setDrawer = useSetAtom(drawerAtom);
  useLayoutEffect(() => {
    const timeout = setTimeout(() => {
      setFilter(localFilter);
    }, 175);

    return () => {
      clearTimeout(timeout);
    };
  }, [localFilter]);

  const { data: quickFilters, isLoading: isLoadingQuickFilters } = useGetEntities<FilterType>(
    {
      fields: ["id", "title", "content"],
      filters: {
        and: [
          {
            id: "favorite",
            header_name: "Favorite",
            field: "is_favorite",
            operator: "eq",
            value: true,
          },
        ],
      },
      orderBy: [
        {
          field: "title",
          sort: "asc",
        },
      ],
      pagination: {
        limit: 30,
        page: 0,
      },
    },
    "filters",
    {
      enabled: type === "characters",
    }
  );

  return (
    <div className="sticky top-0 flex h-12 max-h-12 min-h-[3rem] w-full items-center justify-end gap-x-2">
      {type === "characters" ? (
        <div className="mr-auto">
          <Dropdown
            allowedPlacements={["right-start"]}
            items={[
              {
                id: "new",
                title: "New",
                icon: IconEnum.add,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    type: "character_filter",
                    data: { dispatch },
                    size: "xl",
                    title: "Create character filter",
                  }));
                },
              },
              {
                id: "existing",
                title: "Existing",
                icon: IconEnum.filter,
                onClick: () => {
                  setDrawer((prev) => ({
                    ...prev,
                    type: "character_filter",
                    data: { dispatch },
                    size: "xl",
                    title: "Character filters",
                    exceptions: { existingFilter: true },
                  }));
                },
              },
              {
                id: "quick_filters",
                title: "Favorite filters",
                icon: IconEnum.star,
                isDisabled: isLoadingQuickFilters,
                subItems: (quickFilters?.data || []).map((filt) => ({
                  id: filt.id,
                  title: filt.title,
                  onClick: () => applyCharacterFilter(filt.content as CharacterFilter[], dispatch),
                })),
              },
            ]}>
            <div className="h-11 w-11">
              <Button icon={IconEnum.filter} isIconOnly onClick={undefined} tooltip="Filter characters" />
            </div>
          </Dropdown>
        </div>
      ) : null}
      <div className="w-52">
        <Input
          isClearable
          name="quick_filter"
          onChange={({ value }) => setLocalFilter(value as string)}
          placeholder="Quick search by first name"
          type="search"
          value={localFilter}
        />
      </div>
      {children}
    </div>
  );
}
