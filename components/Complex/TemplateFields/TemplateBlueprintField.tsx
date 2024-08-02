import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { GatewayConfigOptionType } from "../../../types/EntityTypes/gatewayTypes";
import { getEntityLink } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search, Select } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "blueprints_single" | "blueprints_multiple";
  presetOptions: GatewayConfigOptionType[];
  isCollapsible?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["blueprint_instances"];
  blueprint_id: string | null | undefined;
  isDisabled?: boolean;
  isOpen?: boolean;
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
  isOpen,
  isCollapsible,
  presetOptions = [],
}: Props) {
  const { project_id } = useParams();
  const projectId = project_id || presetOptions?.[0]?.project_id;
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <div className="col-span-4 flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        {isDisabled || IS_GATEWAY ? null : (
          <Search
            isDisabled={isDisabled}
            isGlobal={isGlobal}
            isMultiple={fieldType === "blueprints_multiple"}
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
            placeholder="Type at least 2 characters"
            searchEntity="blueprint_instances"
            value={fieldType === "blueprints_multiple" ? currentValue?.map((c) => c.related_id) : undefined}
          />
        )}
        {!IS_GATEWAY ? null : (
          <Select
            hasSearch
            isClearable
            isMultiple={fieldType === "blueprints_multiple"}
            label={title}
            name={name}
            onChange={({ value, label, icon }) => {
              if (fieldType === "blueprints_multiple" && (!value || value?.length === 0)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.blueprint_instances`,
                    value: [],
                  },
                ]);
                return;
              }
              if (
                (currentValue || [])?.some((bpi) => {
                  if (fieldType === "blueprints_multiple") {
                    return value?.includes(bpi.related_id);
                  }
                  return bpi.related_id === value;
                })
              ) {
                if (fieldType === "blueprints_multiple") {
                  const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));

                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.blueprint_instances`,
                      value: selectedValues.map((opt) => ({
                        related_id: opt.value,
                        blueprint_instance: {
                          id: opt.value,
                          title: opt.label,
                          icon: opt?.icon,
                        },
                      })),
                    },
                  ]);
                } else {
                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.blueprint_instances[0]`,
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
                }
                return;
              }
              if (fieldType === "blueprints_multiple") {
                const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.blueprint_instances`,
                    value: selectedValues.map((opt) => ({
                      related_id: opt.value,
                      blueprint_instance: {
                        id: opt.value,
                        title: opt.label,
                        icon: opt?.icon,
                      },
                    })),
                  },
                ]);
              }
            }}
            options={presetOptions.map((opt) => ({
              ...opt,
              image: undefined,
            }))}
            value={(currentValue || []).map((c) => c.related_id)}
          />
        )}
        <div className={IS_GATEWAY ? "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4" : ""}>
          {(currentValue || [])?.map((val) => {
            return (
              <EntityPreview
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
                key={val?.blueprint_instance?.id}
                link={getEntityLink(projectId || "", "blueprint_instances", id, val?.blueprint_instance?.parent_id)}
                manual_project_id={projectId}
                title={val?.blueprint_instance?.title}
                type="blueprint_instances"
              />
            );
          })}
        </div>
      </div>
    </TemplateFieldContainer>
  );
}
