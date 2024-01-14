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
  fieldType: "blueprints_single" | "blueprints_multiple";
  isCollapsible?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["blueprint_instances"];
};

export function TemplateBlueprintField({ title, name, handleChange, id, fieldType, currentValue, isCollapsible }: Props) {
  const createNotification = useNotifications();
  const { project_id } = useParams();
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
            link={getEntityLink(project_id as string, "blueprint_instances", id, val?.blueprint_instance?.parent_id, false)}
            title={val?.blueprint_instance?.title}
            type="blueprint_instances"
          />
        ))}
      </div>
    </TemplateFieldContainer>
  );
}
