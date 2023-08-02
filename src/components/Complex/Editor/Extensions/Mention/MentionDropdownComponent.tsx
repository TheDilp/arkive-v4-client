import { FloatingWrapper, useMentionAtom } from "@remirror/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetAllEntities, useSearch } from "../../../../../hooks";
import { baseURLS } from "../../../../../utils";

export function MentionDropdownComponent() {
  const { project_id } = useParams();
  const [options, setOptions] = useState<{ key: string; id: string; label: string; displayLabel?: string }[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } = useMentionAtom({
    items: options,
  });

  // const { data } = useSearch(
  //   {
  //     data: {},
  //     pagination: {
  //       limit: 5,
  //     },
  //   },
  //   "documents",
  // );

  // const search = useDebouncedCallback(async () => {
  //   setIsFetching(true);
  //   const items: { key: string; id: string; title: string; displayLabel?: string; parentId?: string; translation?: string }[] =
  //     await FetchFunction({
  //       url: `${baseURLS.baseServer}search`,
  //       method: "POST",
  //       body: JSON.stringify({
  //         project_id,
  //         query: state?.query?.full,
  //         type: state?.name,
  //         take: 5,
  //       }),
  //     });
  //   setIsFetching(false);
  //   setOptions(
  //     items
  //       .sort()
  //       .map((item) => {
  //         if (item?.translation)
  //           return {
  //             key: item.id,
  //             id: item?.parentId || item.id,
  //             searchItem: item.translation,
  //             label: item.title,
  //             displayLabel: `${item.title} (${item.translation})`,
  //             projectId: project_id,
  //           };
  //         return {
  //           key: item.id,
  //           id: item?.parentId || item.id,
  //           alterId: item?.parentId ? item.id : null,
  //           label: item.title,
  //           projectId: project_id,
  //         };
  //       })
  //       .slice(0, 10),
  //   );
  // }, 700);
  useEffect(() => {
    if (state && state?.query?.full?.length >= 3) {
      // search();
      console.log(state);
    } else {
      setOptions([]);
    }
  }, [state?.query?.full]);
  return (
    <FloatingWrapper
      containerClass="commandMenu"
      enabled={Boolean(state)}
      placement="auto-end"
      positioner="always"
      renderOutsideEditor>
      <ul
        className="remirror-mention-atom-popup-wrapper z-50 max-h-60 w-[12rem] min-w-[12rem] overflow-y-auto p-0"
        {...getMenuProps()}>
        {/* {isFetching ? <ProgressSpinner /> : null} */}
        {!isFetching
          ? (options || []).map((item, index) => {
              return (
                <li
                  key={item.key}
                  className={`remirror-mention-atom-popup-item flex w-[12rem] items-center justify-between ${
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
