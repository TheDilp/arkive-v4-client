import { useAtom } from "jotai";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity } from "../../hooks";
import { TagType, Variant } from "../../types";
import { availableTagsAtom, DefaultTagColor, sortEntitiesByTitle } from "../../utils";
import { InsertTagType } from "../../validation";
import { Search } from "./Search";
import { Select } from "./Select";

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
  const [allAvailableTags, setAllAvailableTags] = useAtom(availableTagsAtom);
  const formattedAvailableTags = useMemo(
    () =>
      [{ label: "Add new tag + (must be unique per project)", value: "new_tag" }].concat(
        allAvailableTags.map((tag) => ({ value: tag.id, label: tag.title, color: tag.color }))
      ),
    [allAvailableTags]
  );
  const { mutateAsync: createTag } = useCreateEntity<InsertTagType>("tags");

  return (
    <div className="flex flex-col gap-y-2">
      {formattedAvailableTags.length ? (
        <Select
          hasSearch
          isDisabled={isDisabled}
          isMultiple={isMultiple}
          isTruncated={false}
          label={componentLabel || ""}
          name="tags"
          onChange={async ({ label, value }) => {
            // Only valid for multiple tag inputs (for now)
            // and only returns one tag (since only one can
            // be created at a time)
            if (isMultiple && value === "new_tag" && !!label) {
              const newTags: { data: TagType[] } = await createTag({ data: [{ title: label, color: DefaultTagColor }] });
              setAllAvailableTags(allAvailableTags.concat(newTags.data).sort(sortEntitiesByTitle));
              handleChange({ name: "tags", value: tags.concat(newTags.data[0]) });
            } else {
              if (Array.isArray(value)) {
                const tags = allAvailableTags.filter((t) => value.includes(t.id));
                handleChange({ name: "tags", value: tags });
              } else if (!isMultiple && !Array.isArray(value)) {
                if ((allAvailableTags || [])?.some((tag) => tag.id === value)) {
                  handleChange({
                    name: "tags",
                    value: [],
                  });
                } else {
                  const tag = allAvailableTags.find((t) => t.id === value);
                  if (tag) handleChange({ name: "tags", value: [tag] });
                }
              }
            }
          }}
          options={formattedAvailableTags}
          value={tags.map((t) => t.id)}
        />
      ) : (
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
      )}
    </div>
  );
}
