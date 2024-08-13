import { FloatingWrapper } from "@remirror/react";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

import { useMentionAtom } from "../../../../../hooks";
import { FetchFunction, getAssetURL, getServerUrl, mentionDropdownAtom } from "../../../../../utils";
import { Avatar, Spinner } from "../../../../Misc";

export function MentionDropdownComponent() {
  const { access_id, type, project_id } = useParams();
  const setMentionDropdownAtom = useSetAtom(mentionDropdownAtom);
  const [options, setOptions] = useState<
    {
      key: string;
      id: string;
      alterId: string | null;
      label: string;
      displayLabel?: string;
      portrait_id?: string;
      projectId?: string;
      parentId?: string;
    }[]
  >([]);
  const [isFetching, setIsFetching] = useState(false);

  const { state, getMenuProps, getItemProps, indexIsHovered, indexIsSelected } = useMentionAtom({
    items: options,
  });

  const search = useDebouncedCallback(async () => {
    setIsFetching(true);
    const items: {
      data: {
        key: string;
        id: string;
        alterId: string | null;
        title: string;
        displayLabel?: string;
        parentId?: string;
        translation?: string;
        portrait_id?: string;
        icon?: string;
        parent_id?: string;
        project_id?: string;
      }[];
    } = state?.query?.full?.length
      ? await FetchFunction({
          url: IS_GATEWAY
            ? `${getServerUrl()}/search/${state?.name}/mentions`
            : `${getServerUrl()}/search/${project_id}/${state?.name}/mentions`,
          method: "POST",
          body: JSON.stringify({
            data: IS_GATEWAY
              ? {
                  search_term: state?.query?.full,
                  access_id,
                  entity_type: type,
                }
              : {
                  search_term: state?.query?.full,
                },
          }),
        })
      : [];
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
              alterId: null,
              icon: item?.icon,
              displayLabel: `${item.title} (${item.translation})`,
              projectId: project_id || item.project_id,
              parentId: item?.parent_id,
            };
          return {
            key: item.id,
            id: item?.parentId || item.id,
            alterId: item?.alterId || null,
            label: item.title,
            icon: item?.icon,
            projectId: project_id || item.project_id,
            parentId: item?.parent_id,
            portrait_id: item?.portrait_id,
          };
        })
        .slice(0, 10)
    );
  }, 700);

  useEffect(() => {
    if (state && state?.query?.full?.length >= 3) {
      setMentionDropdownAtom(true);

      search();
    } else {
      setOptions([]);
    }
    if (!state) {
      setMentionDropdownAtom(false);
    }
  }, [state?.query?.full]);

  return (
    // @ts-ignore
    <FloatingWrapper
      containerClass="commandMenu"
      enabled={Boolean(state)}
      placement="right-start"
      positioner="always"
      renderOutsideEditor>
      <ul className="remirror-mention-atom-popup-wrapper" {...getMenuProps()}>
        {!isFetching ? (
          (options || []).map((item, index) => {
            return (
              <li
                className={`remirror-mention-atom-popup-item box-border flex w-[12rem] items-center ${
                  indexIsSelected(index) ? "remirror-mention-atom-popup-highlight" : ""
                } ${indexIsHovered(index) ? "remirror-mention-atom-popup-highlight" : ""}`}
                {...getItemProps({
                  item,
                  index,
                })}
                key={`${item.key}_${item.alterId || "NO_ALTER_ID"}`}>
                {item?.portrait_id ? (
                  <Avatar
                    image={getAssetURL((project_id || item.projectId) as string, "images", item.portrait_id)}
                    label={item.label}
                    size="xs"
                  />
                ) : null}
                <span className="truncate">{item?.displayLabel || item.label}</span>
              </li>
            );
          })
        ) : (
          <Spinner />
        )}
      </ul>
    </FloatingWrapper>
  );
}
