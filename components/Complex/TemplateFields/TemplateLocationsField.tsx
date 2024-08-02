import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { GatewayConfigOptionType } from "../../../types/EntityTypes/gatewayTypes";
import { getEntityLink, getImageURL } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search, Select } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "locations_single" | "locations_multiple";
  isCollapsible?: boolean;
  isGlobal?: boolean;
  isDisabled?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["map_pins"];
  presetOptions: GatewayConfigOptionType[];
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
  presetOptions = [],
}: Props) {
  const { project_id } = useParams();
  const projectId = project_id || presetOptions?.[0]?.project_id;

  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-36 flex-col gap-y-2 overflow-y-auto">
        {isDisabled || IS_GATEWAY ? null : (
          <Search
            isGlobal={isGlobal}
            label={isCollapsible ? "" : title}
            name={name}
            onChange={({ value, label, icon, parent_id }) => {
              if ((currentValue || [])?.some((doc) => doc.related_id === value)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.map_pins`,
                    value: (currentValue || []).filter((t) => t.related_id !== value),
                  },
                ]);
                return;
              }
              handleChange([
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
                    },
                  },
                },
              ]);
            }}
            placeholder="Type at least 2 characters"
            searchEntity="map_pins"
            value={fieldType === "locations_multiple" ? currentValue?.map((c) => c.related_id) : undefined}
          />
        )}

        {!IS_GATEWAY ? null : (
          <Select
            isClearable
            isMultiple={fieldType === "locations_multiple"}
            label={title}
            name={name}
            onChange={({ value, label, icon }) => {
              if (fieldType === "locations_multiple" && (!value || value?.length === 0)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.map_pins`,
                    value: [],
                  },
                ]);
                return;
              }

              if (
                (currentValue || [])?.some((doc) => {
                  if (fieldType === "locations_multiple") {
                    return value?.includes(doc.related_id);
                  }
                  return doc.related_id === value;
                })
              ) {
                if (fieldType === "locations_multiple") {
                  const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));

                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.map_pins`,
                      value: selectedValues.map((opt) => ({
                        related_id: opt.value,
                        map_pin: {
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
                      name: `${name}.map_pins[0]`,
                      value: {
                        related_id: value,
                        map_pin: {
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
              if (fieldType === "locations_multiple") {
                const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.map_pins`,
                    value: selectedValues.map((opt) => ({
                      related_id: opt.value,
                      map_pin: {
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
              image:
                projectId && opt.image
                  ? { id: opt.image, shape: "circle", link: getImageURL(projectId, "images", opt.image) }
                  : undefined,
            }))}
            value={(currentValue || []).map((c) => c.related_id)}
          />
        )}

        {IS_GATEWAY ? null : (
          <>
            {(currentValue || [])?.map((val) => {
              return (
                <EntityPreview
                  clearAction={
                    isDisabled
                      ? undefined
                      : (doc_id) => {
                          handleChange([
                            {
                              name: `${name}.map_pins`,
                              value: currentValue.filter((c) => c.related_id !== doc_id),
                            },
                          ]);
                        }
                  }
                  icon={val?.map_pin?.icon || ""}
                  id={val?.map_pin?.id}
                  key={val.map_pin?.id}
                  link={getEntityLink(project_id as string, "map_pins", id, undefined)}
                  title={val?.map_pin?.title || ""}
                  type="map_pins"
                />
              );
            })}
          </>
        )}
      </div>
    </TemplateFieldContainer>
  );
}
