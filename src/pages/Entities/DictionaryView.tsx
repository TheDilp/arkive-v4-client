import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Dropdown, Input, Select, Table, TablePageLayout } from "../../components";
import { useGetEntities, useGetEntity, useTable } from "../../hooks";
import { DialogAtomType, DictionaryType, DrawerAtomType, WebhookType, WordType } from "../../types";
import { baseURLS, dialogAtom, drawerAtom, FetchFunction, IconEnum, TextFilters, userAtom } from "../../utils";

type FilterType = "title" | "translation";
const columnHelper = createColumnHelper<WordType>();
function createColumns(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  setDialog: Dispatch<SetStateAction<DialogAtomType>>,
  parent_id: string,
  webhooks: WebhookType[],
  is_public: boolean,
) {
  const actions = [
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => <div className="pr-1 italic">{info.getValue()}</div>,
      meta: {
        sortable: true,
        filterOptions: TextFilters,
      },
    }),
    columnHelper.accessor("translation", {
      id: "translation",
      header: "Translation",
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        filterOptions: TextFilters,
      },
    }),
  ];
  if (!is_public)
    actions.push(
      columnHelper.display({
        id: "action",
        header: "Actions",
        meta: {
          centered: true,
        },
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Dropdown
              allowedPlacements={["left", "left-start", "left-end"]}
              items={[
                {
                  id: "1",
                  title: "Edit Word",
                  icon: IconEnum.edit,
                  onClick: () => {
                    setDrawer((prev) => ({
                      ...prev,
                      data: row.original,
                      title: `Edit word - ${row.original.title}`,
                      size: "lg",
                      type: "words",
                    }));
                  },
                },
                {
                  id: "expand",
                  title: `${!row.getIsExpanded() ? "Show" : "Hide"} context`,
                  icon: IconEnum.text_align_justify,
                  onClick: row.getToggleExpandedHandler(),
                },
                {
                  id: "send_to_discord",
                  title: "Send to Discord",
                  icon: IconEnum.discord,
                  isDisabled: !is_public,
                  subItems: webhooks.map((webhook) => ({
                    id: webhook.id,
                    title: webhook.title,
                    onClick: () =>
                      FetchFunction({
                        url: `${baseURLS.baseServer}/webhooks/send/${webhook.id}`,
                        body: JSON.stringify({
                          data: {
                            id: row.original.id,
                            type: "words",
                          },
                        }),
                        method: "POST",
                      }),
                  })),
                },
                {
                  id: "delete_word",
                  title: "Delete word",
                  icon: IconEnum.trash,
                  onClick: () => {
                    setDialog((prev) => ({
                      ...prev,
                      data: {
                        ...row.original,
                        parent_id,
                        entity_title: "words",
                      },
                      title: "Delete word",
                      size: "sm",
                      type: "delete_entity",
                    }));
                  },
                },
              ]}>
              <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
            </Dropdown>
          </div>
        ),
      }),
    );

  if (is_public)
    actions.push(
      columnHelper.display({
        id: "action",
        header: "Actions",
        meta: {
          centered: true,
        },
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Dropdown
              allowedPlacements={["left", "left-start", "left-end"]}
              items={[
                {
                  id: "expand",
                  title: `${!row.getIsExpanded() ? "Show" : "Hide"} context`,
                  icon: IconEnum.text_align_justify,
                  onClick: row.getToggleExpandedHandler(),
                },
              ]}>
              <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
            </Dropdown>
          </div>
        ),
      }),
    );

  return actions;
}

export function DictionaryView({ id, isPublic }: { id?: string; isPublic?: boolean }) {
  const { item_id } = useParams();
  const [filter, setFilter] = useState("");
  const user = useAtomValue(userAtom);
  const [filterType, setFilterType] = useState<FilterType>("title");
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);

  const [{ orderBy, filters, pagination, selection }, dispatch] = useTable({
    orderBy: [{ field: "title", sort: "asc" }],
    pagination: { limit: 10, page: 0 },
    selection: {},
  });

  const { data, isInitialLoading } = useGetEntity<DictionaryType>(
    item_id || id,
    "dictionaries",
    {
      fields: ["id", "title", "is_public"],
      relations: {
        words: !!isPublic,
      },
    },
    {
      staleTime: 5 * 60 * 1000,
      isPublic,
    },
  );

  const { data: words, isInitialLoading: isInitialLoadingWords } = useGetEntities<WordType>(
    {
      data: {
        parent_id: item_id || id,
      },
      fields: ["id", "title", "translation"],
      filters,
      pagination,
      orderBy,
    },
    "words",
    { enabled: !!data?.data && !isInitialLoading && !isPublic, isPublic },
  );
  useLayoutEffect(() => {
    if (!filter) {
      dispatch({
        type: "clearAllFilters",
      });
    }
    if (filter.length >= 1) {
      const timeout = setTimeout(() => {
        if (filter) {
          dispatch({
            type: "clearAllFilters",
          });
          dispatch({
            type: "setFilter",
            payload: {
              and: [{ id: "quick_filter", header_name: "title", field: filterType, operator: "ilike", value: filter }],
              field: filterType,
            },
          });
        }
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [filter, dispatch, filterType]);
  return (
    <TablePageLayout>
      <div className="sticky top-0 flex w-full items-center justify-end gap-x-2">
        {isPublic ? <h2 className="flex-1 font-lato text-3xl">{data?.data?.title || ""}</h2> : null}
        <div className="w-48">
          <Input
            isClearable
            name="quick_filter"
            onChange={({ value }) => setFilter(value as string)}
            placeholder={`Search by ${filterType}`}
            value={filter}
          />
        </div>
        <div className="w-40">
          <Select
            name="filterType"
            onChange={({ value }) => setFilterType(value as FilterType)}
            options={[
              { label: "Title", value: "title", icon: IconEnum.word },
              { label: "Translation", value: "translation", icon: IconEnum.dictionary },
            ]}
            placeholder="View"
            value={filterType}
          />
        </div>
        {id || isPublic ? null : (
          <div className="w-52">
            <Button
              icon={IconEnum.add}
              label="Create new word"
              onClick={() =>
                setDrawer((prev) => ({
                  ...prev,
                  data: {},
                  title: "Create new word",
                  type: "words",
                  size: "lg",
                }))
              }
            />
          </div>
        )}
      </div>
      <div className="h-fit w-full">
        <Table
          columns={createColumns(
            setDrawer,
            setDialog,
            (item_id || id) as string,
            user?.webhooks || [],
            data?.data?.is_public || false,
          )}
          config={{
            hasSelect: !id && !isPublic,
            orderBy,
            filters,
            selection,
            expandable: true,
          }}
          data={words?.data || data?.data?.words || []}
          dispatch={dispatch}
          isLoading={isInitialLoading || isInitialLoadingWords}
          pagination={pagination}
          type="words"
        />
      </div>
    </TablePageLayout>
  );
}
