import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { IconEnum, useNotifications } from "../../../utils";
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
  currentValue: BlueprintInstanceBlueprintFieldType["events"];
};

export function TemplateEventField({ title, name, handleChange, id, fieldType, currentValue, isCollapsible }: Props) {
  const createNotification = useNotifications();

  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        <Search
          label={isCollapsible ? "" : title}
          name={name}
          onChange={({ value, label, icon }) => {
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
                    icon,
                  },
                },
              },
            ]);
          }}
          placeholder="Press enter to search."
          searchEntity="events"
        />
        {(currentValue || [])?.map((val) => (
          <EntityPreview
            key={val.related_id}
            clearAction={(instance_id) => {
              handleChange([
                {
                  name: `${name}.events`,
                  value: currentValue.filter((c) => c.related_id !== instance_id),
                },
              ]);
            }}
            id={val?.related_id}
            title={val?.event?.title}
            type="events"
          />
        ))}
      </div>
    </TemplateFieldContainer>
  );
}
