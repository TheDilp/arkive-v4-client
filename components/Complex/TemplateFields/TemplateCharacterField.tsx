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
  fieldType: "characters_single" | "characters_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isGlobal?: boolean;
  presetOptions: GatewayConfigOptionType[];
  currentValue: BlueprintInstanceBlueprintFieldType["characters"];
};

export function TemplateCharacterField({
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
      <div className="col-span-1 flex max-h-56 flex-col gap-y-2 overflow-y-auto md:col-span-2 lg:col-span-4">
        {isDisabled || IS_GATEWAY ? null : (
          <Search
            isDisabled={isDisabled}
            isGlobal={isGlobal}
            isMultiple={fieldType === "characters_multiple"}
            label={title}
            name={name}
            onChange={({ value, label, image }) => {
              if ((currentValue || [])?.some((character) => character.related_id === value)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.characters`,
                    value: (currentValue || []).filter((t) => t.related_id !== value),
                  },
                ]);
                return;
              }

              handleChange([
                { name: `${name}.id`, value: id },
                {
                  name: `${name}.characters[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                  value: {
                    related_id: value,
                    character: {
                      id: value,
                      full_name: label,
                      portrait_id: image,
                    },
                  },
                },
              ]);
            }}
            placeholder="Type at least 2 characters"
            searchEntity="characters"
            value={fieldType === "characters_multiple" ? currentValue?.map((c) => c.related_id) : undefined}
          />
        )}
        {isDisabled || !IS_GATEWAY ? null : (
          <Select
            isClearable
            isMultiple={fieldType === "characters_multiple"}
            label={title}
            name={name}
            onChange={({ value, label, icon }) => {
              if (fieldType === "characters_multiple" && (!value || value?.length === 0)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.characters`,
                    value: [],
                  },
                ]);
                return;
              }

              if (
                (currentValue || [])?.some((char) => {
                  if (fieldType === "characters_multiple") {
                    return value?.includes(char.related_id);
                  }
                  return char.related_id === value;
                })
              ) {
                if (fieldType === "characters_multiple") {
                  const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));

                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.characters`,
                      value: selectedValues.map((opt) => ({
                        related_id: opt.value,
                        character: {
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
                      name: `${name}.characters[0]`,
                      value: {
                        related_id: value,
                        character: {
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
              if (fieldType === "characters_multiple") {
                const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.characters`,
                    value: selectedValues.map((opt) => ({
                      related_id: opt.value,
                      character: {
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
                  clearAction={(char_id) => {
                    handleChange([
                      {
                        name: `${name}.characters`,
                        value: currentValue.filter((c) => c.related_id !== char_id),
                      },
                    ]);
                  }}
                  id={val?.character?.id}
                  image_id={val?.character?.portrait_id}
                  key={val?.character?.id}
                  link={getEntityLink(projectId || "", "characters", id, undefined)}
                  manual_project_id={projectId}
                  title={val?.character?.full_name || ""}
                  type="characters"
                />
              );
            })}
          </>
        )}
      </div>
    </TemplateFieldContainer>
  );
}
