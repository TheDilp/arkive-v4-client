import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { GatewayConfigOptionType } from "../../../types/EntityTypes/gatewayTypes";
import { getImageURL } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search, Select } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "images_single" | "images_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  isGlobal?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["images"];
  presetOptions: GatewayConfigOptionType[];
};

export function TemplateImageField({
  title,
  name,
  handleChange,
  id,
  fieldType,
  isCollapsible,
  isDisabled,
  isOpen,
  isGlobal,
  currentValue,
  presetOptions = [],
}: Props) {
  const { project_id } = useParams();
  const projectId = project_id || presetOptions?.[0]?.project_id;
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        {isDisabled || IS_GATEWAY ? null : (
          <Search
            isGlobal={isGlobal}
            isMultiple={fieldType === "images_multiple"}
            label={isCollapsible ? "" : title}
            name={name}
            onChange={({ value, label }) => {
              if ((currentValue || [])?.some((image) => image.related_id === value)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.images`,
                    value: (currentValue || []).filter((t) => t.related_id !== value),
                  },
                ]);
                return;
              }
              handleChange([
                { name: `${name}.id`, value: id },
                {
                  name: `${name}.images[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                  value: {
                    related_id: value,
                    image: {
                      id: value,
                      title: label,
                    },
                  },
                },
              ]);
            }}
            placeholder="Type at least 2 characters"
            searchEntity="images"
            value={fieldType === "images_multiple" ? (currentValue || [])?.map((t) => t.related_id) : undefined}
          />
        )}

        {!IS_GATEWAY ? null : (
          <Select
            isClearable
            isMultiple={fieldType === "images_multiple"}
            label={title}
            name={name}
            onChange={({ value, label, icon }) => {
              if (fieldType === "images_multiple" && (!value || value?.length === 0)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.images`,
                    value: [],
                  },
                ]);
                return;
              }

              if (
                (currentValue || [])?.some((doc) => {
                  if (fieldType === "images_multiple") {
                    return value?.includes(doc.related_id);
                  }
                  return doc.related_id === value;
                })
              ) {
                if (fieldType === "images_multiple") {
                  const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));

                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.images`,
                      value: selectedValues.map((opt) => ({
                        related_id: opt.value,
                        image: {
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
                      name: `${name}.images[0]`,
                      value: {
                        related_id: value,
                        image: {
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
              if (fieldType === "images_multiple") {
                const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.images`,
                    value: selectedValues.map((opt) => ({
                      related_id: opt.value,
                      image: {
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
                projectId && opt.value
                  ? { id: opt.value, shape: "circle", link: getImageURL(projectId, "images", opt.value) }
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
                      : (char_id) => {
                          handleChange([
                            {
                              name: `${name}.images`,
                              value: currentValue.filter((c) => c.related_id !== char_id),
                            },
                          ]);
                        }
                  }
                  id={val.image?.id}
                  image_id={val.image?.id}
                  key={val.image.id}
                  title={val.image?.title}
                  type="images"
                />
              );
            })}
          </>
        )}
      </div>
    </TemplateFieldContainer>
  );
}
