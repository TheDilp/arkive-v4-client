import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { AnswerType } from "../../../types/EntityTypes/questionnaireTypes";
import { EntityPreview } from "../../DataDisplay";
import { Search } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "images_single" | "images_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isGlobal?: boolean;
  isQuestionnaire?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["images"] | AnswerType["images"];
};

export function TemplateImageField({
  title,
  name,
  handleChange,
  id,
  fieldType,
  isCollapsible,
  isDisabled,
  isGlobal,
  isQuestionnaire,
  currentValue,
}: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        {isDisabled ? null : (
          <Search
            isGlobal={isGlobal}
            label={isCollapsible ? "" : title}
            name={name}
            onChange={({ value, label, project_id: entity_project_id }) => {
              handleChange(
                isQuestionnaire
                  ? {
                      name,
                      value: [
                        {
                          id: value,
                          title: label,
                          project_id: entity_project_id,
                        },
                      ],
                    }
                  : [
                      { name: `${name}.id`, value: id },
                      {
                        name: `${name}.images[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                        value: {
                          related_id: value,
                          image: {
                            id: value,
                            title: label,
                            project_id: entity_project_id,
                          },
                        },
                      },
                    ],
              );
            }}
            placeholder="Press enter to search."
            searchEntity="images"
          />
        )}
        {(currentValue || [])?.map((val) => {
          const image = "related_id" in val ? val.image : val;

          return (
            <EntityPreview
              key={image.id}
              clearAction={
                isDisabled
                  ? undefined
                  : (char_id) => {
                      handleChange([
                        {
                          name: isQuestionnaire ? name : `${name}.images`,
                          value: currentValue.filter((c) => ("related_id" in c ? c.related_id : c.id) !== char_id),
                        },
                      ]);
                    }
              }
              entity_project_id={image?.project_id}
              id={image?.id}
              image_id={image?.id}
              title={image?.title}
              type="images"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
