import { FloatingWrapper, useMentionAtom } from "@remirror/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

import { baseURLS, FetchFunction } from "../../../../../utils";

export function MentionDropdownComponent() {
  const { project_id } = useParams();
  const [options, setOptions] = useState<{ key: string; id: string; label: string; displayLabel?: string }[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } = useMentionAtom({
    items: options,
  });

  const search = useDebouncedCallback(async () => {
    setIsFetching(true);
    const items: {
      data: { key: string; id: string; title: string; displayLabel?: string; parentId?: string; translation?: string }[];
    } = await FetchFunction({
      url: `${baseURLS.baseServer}/search/${project_id}/${state?.name}/mentions`,
      method: "POST",
      body: JSON.stringify({
        data: {
          search_term: state?.query?.full,
        },
        limit: 5,
      }),
    });
    setIsFetching(false);
    setOptions(
      items.data
        .sort()
        .map((item) => {
          if (item?.translation)
            return {
              key: item.id,
              id: item?.parentId || item.id,
              searchItem: item.translation,
              label: item.title,
              displayLabel: `${item.title} (${item.translation})`,
              projectId: project_id,
            };
          return {
            key: item.id,
            id: item?.parentId || item.id,
            alterId: item?.parentId ? item.id : null,
            label: item.title,
            projectId: project_id,
          };
        })
        .slice(0, 10),
    );
  }, 700);

  useEffect(() => {
    if (state && state?.query?.full?.length >= 3) {
      search();
    } else {
      setOptions([]);
    }
  }, [state?.query?.full]);
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
                  {...getItemProps({
                    item,
                    index,
                  })}>
                  {item?.displayLabel || item.label}
                </li>
              );
            })
          : null}
      </ul>
    </FloatingWrapper>
  );
}
