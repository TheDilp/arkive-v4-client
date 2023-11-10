import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { IconEnum, useNotifications } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search } from "../../Form";
import { Collapsible } from "../../Layout";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "blueprints_single" | "blueprints_multiple";

  currentValue: BlueprintInstanceBlueprintFieldType["blueprint_instances"];
};

export function TemplateBlueprintField({ title, name, handleChange, id, fieldType, currentValue }: Props) {
  const createNotification = useNotifications();

  return (
    <Collapsible label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        <Search
          name={name}
          onChange={({ value, label, icon }) => {
            if (currentValue?.some((cVal) => cVal.related_id === value) && fieldType.includes("multiple")) {
              createNotification({
                timer: 3,
                title: "Cannot add the same blueprint instance more than once.",
                variant: "warning",
                icon: IconEnum.warning,
              });
              return;
            }
            handleChange([
              { name: `${name}.id`, value: id },
              {
                name: `${name}.blueprint_instances[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                value: {
                  related_id: value,
                  blueprint_instance: {
                    id: value,
                    title: label,
                    icon,
                  },
                },
              },
            ]);
          }}
          placeholder="Press enter to search."
          searchEntity="blueprint_instances"
        />
        {(currentValue || [])?.map((val) => (
          <EntityPreview
            key={val.related_id}
            clearAction={(instance_id) => {
              handleChange([
                {
                  name: `${name}.blueprint_instances`,
                  value: currentValue.filter((c) => c.related_id !== instance_id),
                },
              ]);
            }}
            icon={val?.blueprint_instance?.icon}
            id={val?.related_id}
            title={val?.blueprint_instance?.title}
            type="blueprint_instances"
          />
        ))}
      </div>
    </Collapsible>
  );
}
