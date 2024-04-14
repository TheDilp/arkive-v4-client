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
  fieldType: "locations_single" | "locations_multiple";
  isCollapsible?: boolean;
  isGlobal?: boolean;
  isQuestionnaire?: boolean;
  isDisabled?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["map_pins"] | AnswerType["map_pins"];
};

export function TemplateLocationsField({
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
      <div className="flex max-h-36 flex-col gap-y-2 overflow-y-auto">
        {isDisabled ? null : (
          <Search
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
                        parent_id,
                        title: label,
                        icon,
                        project_id: entity_project_id || project_id,
                      },
                    }
                  : [
                      { name: `${name}.id`, value: id },
                      {
                        name: `${name}.map_pins[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                        value: {
                          related_id: value,
                          map_pin: {
                            id: value,
                            parent_id,
                            title: label,
                            icon,
                            project_id: entity_project_id || project_id,
                          },
                        },
                      },
                    ],
              );
            }}
            placeholder="Press enter to search."
            searchEntity="map_pins"
          />
        )}
        {(currentValue || [])?.map((val) => {
          const location = "related_id" in val ? val.map_pin : val;

          return (
            <EntityPreview
              key={location?.id}
              clearAction={
                isDisabled
                  ? undefined
                  : (doc_id) => {
                      handleChange([
                        {
                          name: `${name}.map_pins`,
                          value: currentValue.filter((c) => ("related_id" in c ? c.related_id : c.id) !== doc_id),
                        },
                      ]);
                    }
              }
              entity_project_id={location?.project_id}
              icon={location?.icon || ""}
              id={location?.id}
              link={getEntityLink(project_id as string, "map_pins", id, undefined, false)}
              title={location?.title || ""}
              type="map_pins"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
