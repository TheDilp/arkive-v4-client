import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { getEntityLink } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "characters_single" | "characters_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isGlobal?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["characters"];
};

export function TemplateCharacterField({
  title,
  name,
  handleChange,
  id,
  fieldType,
  currentValue,
  isCollapsible,
  isDisabled,
  isGlobal,
}: Props) {
  const { project_id } = useParams();
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        <Search
          isDisabled={isDisabled}
          isGlobal={isGlobal}
          isMultiple={fieldType === "characters_multiple"}
          name={name}
          onChange={({ value, label, image }) => {
            if ((currentValue || [])?.some((character) => character.related_id === value)) {
              handleChange([
                { name: `${name}.id`, value: id },
                {
                  name: `${name}.characters`,
                  value: (currentValue || []).filter((t) => t.related_id !== value),
                },
              ]);
              return;
            }

            handleChange([
              { name: `${name}.id`, value: id },
              {
                name: `${name}.characters[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                value: {
                  related_id: value,
                  character: {
                    id: value,
                    full_name: label,
                    portrait_id: image,
                  },
                },
              },
            ]);
          }}
          placeholder="Press enter to search."
          searchEntity="characters"
          value={currentValue?.map((c) => c.related_id)}
        />

        {(currentValue || [])?.map((val) => {
          return (
            <EntityPreview
              key={val?.character?.id}
              clearAction={(char_id) => {
                handleChange([
                  {
                    name: `${name}.characters`,
                    value: currentValue.filter((c) => c.related_id !== char_id),
                  },
                ]);
              }}
              id={val?.character?.id}
              image_id={val?.character?.portrait_id}
              link={getEntityLink(val?.character?.project_id || project_id || "", "characters", id, undefined, false)}
              title={val?.character?.full_name || ""}
              type="characters"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
