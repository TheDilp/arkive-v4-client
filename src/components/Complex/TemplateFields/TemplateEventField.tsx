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
  fieldType: "events_single" | "events_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isGlobal?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["events"];
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
              if ((currentValue || [])?.some((event) => event.related_id === value)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.events`,
                    value: (currentValue || []).filter((t) => t.related_id !== value),
                  },
                ]);
                return;
              }
              handleChange([
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
              ]);
            }}
            placeholder="Press enter to search."
            searchEntity="events"
            value={fieldType === "events_multiple" ? currentValue?.map((c) => c.related_id) : undefined}
          />
        )}
        {(currentValue || [])?.map((val) => {
          return (
            <EntityPreview
              key={val?.event.id}
              clearAction={
                isDisabled
                  ? undefined
                  : (instance_id) => {
                      handleChange([
                        {
                          name: `${name}.events`,
                          value: currentValue.filter((c) => c.related_id !== instance_id),
                        },
                      ]);
                    }
              }
              id={val?.event?.id}
              link={getEntityLink(project_id as string, "events", id, val?.event.parent_id, false)}
              title={val?.event.title}
              type="events"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
