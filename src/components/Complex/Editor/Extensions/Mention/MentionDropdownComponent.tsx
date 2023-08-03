import { FloatingWrapper, useMentionAtom } from "@remirror/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useMentionsSearch } from "../../../../../hooks";
import { SearchableMentionEntities } from "../../../../../types";

export function MentionDropdownComponent() {
  const { project_id } = useParams();
  const [options, setOptions] = useState<{ key: string; id: string; label: string; displayLabel?: string }[]>([]);
  const [filter, setFilter] = useState("");

  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } = useMentionAtom({
    items: options,
  });

  const { data, refetch, isFetching } = useMentionsSearch<{
    id: string;
    title: string;
    alterId?: string;
    parent_id?: string;
  }>(
    {
      data: {
        search_term: filter,
      },
      limit: 10,
    },
    state?.name as SearchableMentionEntities,
    project_id as string,
    {
      enabled: false,
    },
  );

  useEffect(() => {
    if (filter && filter.length >= 2) refetch();
  }, [filter, refetch]);

  useEffect(() => {
    if (state && state?.query?.full?.length >= 2) {
      const timeout = setTimeout(() => {
        setFilter(state.query.full.toLowerCase());
      }, 400);
      return () => {
        clearTimeout(timeout);
      };
    }
    setOptions([]);

    return () => {};
  }, [state]);

  useEffect(() => {
    if (data?.data && !isFetching) {
      setOptions(
        data?.data.map((item) => {
          return {
            key: item.id,
            id: item.id,
            alterId: item?.alterId ? item.alterId : null,
            label: item.title,
            projectId: project_id,
          };
        }),
      );
    }
  }, [data]);

  return (
    <FloatingWrapper
      containerClass="commandMenu overflow-hidden"
      enabled={Boolean(state)}
      placement="auto-end"
      positioner="always"
      renderOutsideEditor>
      <ul className="remirror-mention-atom-popup-wrapper" {...getMenuProps()}>
        {/* {isFetching ? <ProgressSpinner /> : null} */}
        {!isFetching
          ? (options || []).map((item, index) => {
              return (
                <li
                  key={item.key}
                  className={`remirror-mention-atom-popup-item box-border flex w-[12rem] items-center justify-between ${
                    indexIsSelected(index) ? "remirror-mention-atom-popup-highlight" : ""
                  } ${indexIsHovered(index) ? "remirror-mention-atom-popup-highlight" : ""}`}
                  {...getItemProps({ item, index })}>
                  {item?.displayLabel || item.label}
                </li>
              );
            })
          : null}
      </ul>
    </FloatingWrapper>
  );
}
