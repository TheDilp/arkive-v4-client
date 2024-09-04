import { useParams } from "react-router-dom";

import { TagType, Variant } from "../../types";
import { Badge } from "../Misc";
import { Search } from "./Search";

type Props = {
  label?: string;
  isAutofocused?: boolean;
  tags: Omit<TagType, "owner_id" | "permissions" | "deleted_at">[];
  handleChange: (newData: { name: string; value: Omit<TagType, "owner_id" | "permissions" | "deleted_at">[] }) => void;
  isMultiple?: boolean;
  isDisabled?: boolean;
  variant?: Variant;
};

export function TagInput({
  tags,
  label: componentLabel,
  handleChange,
  isMultiple = true,
  isDisabled,
  isAutofocused,
  variant,
}: Props) {
  const { project_id } = useParams();
  return (
    <div className="flex flex-col gap-y-2">
      <Search
        isAutofocused={isAutofocused ?? true}
        isDisabled={isDisabled}
        isMultiple={isMultiple}
        label={componentLabel || ""}
        name="tags"
        onChange={({ name, label, value, color }) => {
          if ((tags || [])?.some((tag) => tag.id === value)) {
            handleChange({
              name,
              value: (tags || []).filter((t) => t.id !== value),
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
        placeholder="Type at least 2 characters"
        searchEntity="tags"
        value={isMultiple ? tags.map((t) => t.id) : undefined}
        variant={variant || "primary"}
      />

      <div className="flex flex-wrap gap-2">
        {tags?.length
          ? tags.map((tag) => (
              <div key={tag.id} className="w-fit">
                <Badge
                  clearAction={
                    isDisabled
                      ? undefined
                      : () => {
                          handleChange({ name: "tags", value: (tags || []).filter((t) => t.id !== tag.id) });
                        }
                  }
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
