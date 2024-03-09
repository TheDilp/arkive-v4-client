import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { getEntityLink, IconEnum, useNotifications } from "../../../utils";
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
}: Props) {
  const createNotification = useNotifications();
  const { project_id } = useParams();
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        {isDisabled ? null : (
          <Search
            isDisabled={isDisabled}
            label={isCollapsible ? "" : title}
            name={name}
            onChange={({ value, label, icon, parent_id }) => {
              if (currentValue?.some((cVal) => cVal.related_id === value) && fieldType.includes("multiple")) {
                createNotification({
                  timer: 3,
                  title: "Cannot add the same event more than once.",
                  variant: "warning",
                  icon: IconEnum.warning,
                });
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
                    },
                  },
                },
              ]);
            }}
            placeholder="Press enter to search."
            searchEntity="events"
          />
        )}
        {(currentValue || [])?.map((val) => (
          <EntityPreview
            key={val.related_id}
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
            id={val?.related_id}
            link={getEntityLink(project_id as string, "events", id, val?.event?.parent_id, false)}
            title={val?.event?.title}
            type="events"
          />
        ))}
      </div>
    </TemplateFieldContainer>
  );
}
