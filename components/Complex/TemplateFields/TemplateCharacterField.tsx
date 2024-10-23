import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { GatewayConfigOptionType } from "../../../types/EntityTypes/gatewayTypes";
import { getAssetURL, getEntityLink } from "../../../utils";
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
  isOpen?: boolean;
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
  isOpen,
}: Props) {
  const { project_id } = useParams();
  const projectId = project_id || presetOptions?.[0]?.project_id;
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <div
        className={`col-span-1 ${fieldType === "characters_multiple" ? "md:col-span-2 lg:col-span-4" : "md:col-span-2"} relative flex max-h-96 flex-col gap-y-2 overflow-y-auto`}>
        {isDisabled || IS_GATEWAY || (currentValue?.length === 1 && fieldType === "characters_single") ? null : (
          <div className="sticky top-0">
            <Search
              isDisabled={isDisabled}
              isGlobal={isGlobal}
              isMultiple={fieldType === "characters_multiple"}
              label={title}
              name={name}
              onBrowserChange={(props) => {
                const itemsToChange: { name: string; value: string | Record<string, any> }[] = props.map(
                  ({ value, label, image }, index) => ({
                    name: `${name}.characters[${fieldType?.includes("single") ? 0 : index || 0}]`,
                    value: {
                      related_id: value,
                      character: {
                        id: value,
                        full_name: label,
                        portrait_id: image,
                      },
                    },
                  })
                );
                itemsToChange.push({ name: `${name}.id`, value: id });
                handleChange(itemsToChange);
              }}
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
                    name: `${name}.characters[${fieldType?.includes("single") ? 0 : currentValue?.length || 0}]`,
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
              variant="secondary"
            />
          </div>
        )}
        {currentValue?.length === 1 && fieldType === "characters_single" && !IS_GATEWAY ? (
          <EntityPreview
            clearAction={
              isDisabled
                ? undefined
                : (char_id) => {
                    handleChange([
                      {
                        name: `${name}.characters`,
                        value: currentValue.filter((c) => c.related_id !== char_id),
                      },
                    ]);
                  }
            }
            id={currentValue?.[0].related_id}
            image_id={currentValue?.[0].character?.portrait_id}
            label={title}
            manual_project_id={project_id}
            title={currentValue?.[0]?.character?.full_name || ""}
            type="characters"
          />
        ) : null}
        {IS_GATEWAY && !isDisabled ? (
          <Select
            isClearable
            isMultiple={fieldType === "characters_multiple"}
            label={title}
            name={name}
            onChange={({ value, label, image }) => {
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
                          full_name: opt?.label,
                          portrait_id: opt?.image,
                        },
                      })),
                    },
                  ]);
                  return;
                } else {
                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.characters[0]`,
                      value: {
                        related_id: value,
                        character: {
                          id: value,
                          full_name: label,
                          portrait_id: image?.id,
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
                        full_name: opt.label,
                        portrait_id: opt?.image,
                      },
                    })),
                  },
                ]);
              } else {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.characters`,
                    value: [
                      {
                        related_id: value,
                        character: {
                          id: value,
                          full_name: label,
                          portrait_id: image?.id,
                        },
                      },
                    ],
                  },
                ]);
              }
            }}
            options={presetOptions.map((opt) => ({
              ...opt,
              image:
                projectId && opt.image
                  ? { id: opt.image, shape: "circle", link: getAssetURL(projectId, "images", opt.image) }
                  : undefined,
            }))}
            value={
              fieldType === "characters_single" ? currentValue?.[0]?.related_id : (currentValue || []).map((c) => c.related_id)
            }
          />
        ) : null}
        {fieldType === "characters_multiple" ? (
          <div className={IS_GATEWAY ? "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4" : "flex flex-col gap-y-2"}>
            {(currentValue || [])?.map((val) => {
              return (
                <EntityPreview
                  key={val?.character?.id}
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
                  link={IS_GATEWAY ? undefined : getEntityLink(projectId || "", "characters", id, undefined)}
                  manual_project_id={projectId}
                  title={val?.character?.full_name || ""}
                  type="characters"
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </TemplateFieldContainer>
  );
}
