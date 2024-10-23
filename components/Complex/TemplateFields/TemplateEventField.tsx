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
  fieldType: "events_single" | "events_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  isGlobal?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["events"];
  presetOptions: GatewayConfigOptionType[];
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
  isOpen,
  presetOptions = [],
}: Props) {
  const { project_id } = useParams();
  const projectId = project_id || presetOptions?.[0]?.project_id;

  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <div
        className={`relative flex max-h-96 flex-col gap-y-2 overflow-y-auto ${fieldType === "events_multiple" ? "md:col-span-2 lg:col-span-4" : "md:col-span-2"}`}>
        {isDisabled || IS_GATEWAY || (currentValue?.length === 1 && fieldType === "events_single") ? null : (
          <div className="sticky top-0">
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
                    name: `${name}.events[${fieldType?.includes("single") ? 0 : currentValue?.length || 0}]`,
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
              placeholder="Type at least 2 characters"
              searchEntity="events"
              value={fieldType === "events_multiple" ? currentValue?.map((c) => c.related_id) : undefined}
              variant="secondary"
            />
          </div>
        )}

        {currentValue?.length === 1 && fieldType === "events_single" && !IS_GATEWAY ? (
          <EntityPreview
            clearAction={
              isDisabled
                ? undefined
                : (char_id) => {
                    handleChange([
                      {
                        name: `${name}.events`,
                        value: currentValue.filter((c) => c.related_id !== char_id),
                      },
                    ]);
                  }
            }
            id={currentValue?.[0].related_id}
            image_id={currentValue?.[0].related_id}
            label={title}
            manual_project_id={project_id}
            title={currentValue?.[0]?.event?.title || ""}
            type="events"
          />
        ) : null}

        {!IS_GATEWAY || !isDisabled ? null : (
          <Select
            isClearable
            isMultiple={fieldType === "events_multiple"}
            label={title}
            name={name}
            onChange={({ value, label, icon, parent_id }) => {
              if (fieldType === "events_multiple" && (!value || value?.length === 0)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.events`,
                    value: [],
                  },
                ]);
                return;
              }

              if (
                (currentValue || [])?.some((doc) => {
                  if (fieldType === "events_multiple") {
                    return value?.includes(doc.related_id);
                  }
                  return doc.related_id === value;
                })
              ) {
                if (fieldType === "events_multiple") {
                  const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));

                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.events`,
                      value: selectedValues.map((opt) => ({
                        related_id: opt.value,
                        event: {
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
                      name: `${name}.events[0]`,
                      value: {
                        related_id: value,
                        event: {
                          id: value,
                          title: label,
                          parent_id,
                          icon,
                          project_id: project_id,
                        },
                      },
                    },
                  ]);
                }
                return;
              }
              if (fieldType === "events_multiple") {
                const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.events`,
                    value: selectedValues.map((opt) => ({
                      related_id: opt.value,
                      event: {
                        id: opt.value,
                        title: opt.label,
                        icon: opt?.icon,
                        parent_id: opt?.parent_id,
                        project_id: projectId,
                      },
                    })),
                  },
                ]);
              } else {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.events`,
                    value: [
                      {
                        related_id: value,
                        event: {
                          id: value,
                          title: label,
                          icon,
                          parent_id: parent_id,
                          project_id: projectId,
                        },
                      },
                    ],
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
        {fieldType === "events_multiple" ? (
          <div className={IS_GATEWAY ? "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4" : "flex flex-col gap-y-2"}>
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
                  link={getEntityLink(project_id as string, "events", id, val?.event.parent_id)}
                  title={val?.event.title}
                  type="events"
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </TemplateFieldContainer>
  );
}
