import { useParams } from "react-router-dom";

import { HandleChangePropsType, TagType } from "../../types";
import { IconEnum, useNotifications } from "../../utils";
import { Badge } from "../Misc";
import { Search } from "./Search";

type Props = {
  label?: string;
  tags: TagType[];
  handleChange: (newData: HandleChangePropsType) => void;
};

export function TagInput({ tags, label: componentLabel, handleChange }: Props) {
  const { project_id } = useParams();
  const createNotification = useNotifications();
  return (
    <div className="flex flex-col gap-y-2">
      <Search
        label={componentLabel || ""}
        name="tags"
        onChange={({ name, label, value, color }) => {
          if ((tags || [])?.some((tag) => tag.id === value)) {
            createNotification({
              title: "Cannot add the same tag twice.",
              variant: "warning",
              icon: IconEnum.info_circle,
              timer: 3,
            });
            return;
          }

          handleChange({
            name,
            value: (tags || []).concat({
              title: label as string,
              id: value,
              project_id: project_id as string,
              color: color as string,
            }),
          });
        }}
        placeholder="Press enter to search tags"
        searchEntity="tags"
      />

      <div className="flex flex-wrap gap-2">
        {tags?.length
          ? tags.map((tag) => (
              <div key={tag.id} className="w-fit">
                <Badge
                  clearAction={() => {
                    handleChange({ name: "tags", value: (tags || []).filter((t) => t.id !== tag.id) });
                  }}
                  customColor={tag.color}
                  label={tag.title}
                  size="lg"
                />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
