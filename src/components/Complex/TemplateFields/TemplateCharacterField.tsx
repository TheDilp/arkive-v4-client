import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { AnswerType } from "../../../types/EntityTypes/questionnaireTypes";
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
  isQuestionnaire?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["characters"] | AnswerType["characters"];
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
  isQuestionnaire,
}: Props) {
  const { project_id } = useParams();
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        <Search
          isDisabled={isDisabled}
          isGlobal={isGlobal}
          isMultiple
          name={name}
          onChange={({ value, label, image, project_id: character_project_id }) => {
            handleChange(
              isQuestionnaire
                ? {
                    name,
                    value: [
                      {
                        id: value,
                        full_name: label,
                        portrait_id: image,
                        project_id: character_project_id || project_id,
                      },
                    ],
                  }
                : [
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.characters[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                      value: {
                        related_id: value,
                        character: {
                          id: value,
                          full_name: label,
                          portrait_id: image,
                          project_id: character_project_id || project_id,
                        },
                      },
                    },
                  ],
            );
          }}
          placeholder="Press enter to search."
          searchEntity="characters"
          value={currentValue?.map((c) => ("related_id" in c ? c.related_id : c.id))}
        />

        {(currentValue || [])?.map((val) => {
          const character = "related_id" in val ? val.character : val;
          return (
            <EntityPreview
              key={character.id}
              clearAction={(char_id) => {
                handleChange([
                  {
                    name: `${name}.characters`,
                    value: currentValue.filter((c) => ("related_id" in c ? c.related_id !== char_id : c.id !== char_id)),
                  },
                ]);
              }}
              entity_project_id={character?.project_id}
              id={character?.id}
              image_id={character?.portrait_id}
              link={getEntityLink(character?.project_id || project_id || "", "characters", id, undefined, false)}
              title={character?.full_name || ""}
              type="characters"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
