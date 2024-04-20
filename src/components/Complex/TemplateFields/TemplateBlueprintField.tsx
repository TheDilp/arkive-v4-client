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
  fieldType: "blueprints_single" | "blueprints_multiple";
  isCollapsible?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["blueprint_instances"] | AnswerType["blueprint_instances"];
  blueprint_id: string | null | undefined;
  isDisabled?: boolean;
  isGlobal?: boolean;
  isQuestionnaire?: boolean;
};

export function TemplateBlueprintField({
  title,
  name,
  handleChange,
  id,
  blueprint_id,
  fieldType,
  currentValue,
  isDisabled,
  isGlobal,
  isCollapsible,
  isQuestionnaire,
}: Props) {
  const { project_id } = useParams();
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        {isDisabled ? null : (
          <Search
            isDisabled={isDisabled}
            isGlobal={isGlobal}
            label={isCollapsible ? "" : title}
            name={name}
            onChange={({ value, label, icon, project_id: entity_project_id }) => {
              handleChange(
                isQuestionnaire
                  ? {
                      name,
                      value: [
                        {
                          id: value,
                          title: label,
                          icon,
                          project_id: entity_project_id || project_id,
                        },
                      ],
                    }
                  : [
                      { name: `${name}.id`, value: id },
                      {
                        name: `${name}.blueprint_instances[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                        value: {
                          related_id: value,
                          blueprint_instance: {
                            id: value,
                            title: label,
                            icon,
                            project_id: entity_project_id || project_id,
                          },
                        },
                      },
                    ],
              );
            }}
            parent_id={blueprint_id || undefined}
            placeholder="Press enter to search."
            searchEntity="blueprint_instances"
          />
        )}
        {(currentValue || [])?.map((val) => {
          const blueprint_instance = "related_id" in val ? val.blueprint_instance : val;
          return (
            <EntityPreview
              key={blueprint_instance.id}
              clearAction={
                isDisabled
                  ? undefined
                  : (instance_id) => {
                      handleChange([
                        {
                          name: isQuestionnaire ? name : `${name}.blueprint_instances`,
                          value: currentValue.filter((c) => ("related_id" in c ? c.related_id : c.id) !== instance_id),
                        },
                      ]);
                    }
              }
              entity_project_id={blueprint_instance?.project_id}
              icon={blueprint_instance?.icon}
              id={blueprint_instance.id}
              link={getEntityLink(
                blueprint_instance?.project_id || project_id || "",
                "blueprint_instances",
                id,
                blueprint_instance?.parent_id,
                false,
              )}
              title={blueprint_instance?.title}
              type="blueprint_instances"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
