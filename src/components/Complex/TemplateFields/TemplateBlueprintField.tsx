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
  fieldType: "blueprints_single" | "blueprints_multiple";
  isCollapsible?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["blueprint_instances"];
  blueprint_id: string | null | undefined;
  isDisabled?: boolean;
  isGlobal?: boolean;
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
            onChange={({ value, label, icon }) => {
              if ((currentValue || [])?.some((bpi) => bpi.related_id === value)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.blueprint_instances`,
                    value: (currentValue || []).filter((t) => t.related_id !== value),
                  },
                ]);
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
            parent_id={blueprint_id || undefined}
            placeholder="Press enter to search."
            searchEntity="blueprint_instances"
            value={fieldType === "blueprints_multiple" ? currentValue?.map((c) => c.related_id) : undefined}
          />
        )}
        {(currentValue || [])?.map((val) => {
          return (
            <EntityPreview
              key={val?.blueprint_instance?.id}
              clearAction={
                isDisabled
                  ? undefined
                  : (instance_id) => {
                      handleChange([
                        {
                          name: `${name}.blueprint_instances`,
                          value: currentValue.filter((c) => c.related_id !== instance_id),
                        },
                      ]);
                    }
              }
              icon={val?.blueprint_instance?.icon}
              id={val?.blueprint_instance?.id}
              link={getEntityLink(
                val?.blueprint_instance?.project_id || project_id || "",
                "blueprint_instances",
                id,
                val?.blueprint_instance?.parent_id,
                false,
              )}
              title={val?.blueprint_instance?.title}
              type="blueprint_instances"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
