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
  fieldType: "events_single" | "events_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isGlobal?: boolean;
  isQuestionnaire?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["events"] | AnswerType["events"];
};

export function TemplateEventField({
  title,
  name,
  handleChange,
  id,
  fieldType,
  currentValue,
  isCollapsible,
  isDisabled,
  isQuestionnaire,
  isGlobal,
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
            onChange={({ value, label, icon, parent_id, project_id: entity_project_id }) => {
              handleChange(
                isQuestionnaire
                  ? {
                      name,
                      value: {
                        id: value,
                        title: label,
                        parent_id,
                        icon,
                        project_id: entity_project_id || project_id,
                      },
                    }
                  : [
                      { name: `${name}.id`, value: id },
                      {
                        name: `${name}.events[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                        value: {
                          related_id: value,
                          event: {
                            id: value,
                            title: label,
                            parent_id,
                            icon,
                            project_id: entity_project_id || project_id,
                          },
                        },
                      },
                    ],
              );
            }}
            placeholder="Press enter to search."
            searchEntity="events"
          />
        )}
        {(currentValue || [])?.map((val) => {
          const event = "related_id" in val ? val?.event : val;

          return (
            <EntityPreview
              key={event.id}
              clearAction={
                isDisabled
                  ? undefined
                  : (instance_id) => {
                      handleChange([
                        {
                          name: `${name}.events`,
                          value: currentValue.filter((c) => ("related_id" in c ? c.related_id : c.id) !== instance_id),
                        },
                      ]);
                    }
              }
              entity_project_id={event.project_id}
              id={event?.id}
              link={getEntityLink(project_id as string, "events", id, event.parent_id, false)}
              title={event.title}
              type="events"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
