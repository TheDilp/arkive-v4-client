import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { GatewayConfigOptionType } from "../../../types/EntityTypes/gatewayTypes";
import { getAssetURL } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search, Select } from "../../Form";
import { RelationFieldContainer, TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "images_single" | "images_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  isReadOnly?: boolean;
  isGlobal?: boolean;
  isDrawer?: boolean;
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
  isReadOnly,
  isDrawer,
  isGlobal,
  currentValue,
  presetOptions = [],
}: Props) {
  const { project_id } = useParams();
  const projectId = project_id || presetOptions?.[0]?.project_id;
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <RelationFieldContainer isMultiple={fieldType === "images_multiple"}>
        {isDisabled || IS_GATEWAY || (currentValue?.length === 1 && fieldType === "images_single") ? null : (
          <div className="sticky top-0">
            <Search
              imageType="images"
              isGlobal={isGlobal}
              isMultiple={fieldType === "images_multiple"}
              isReadOnly={isReadOnly}
              label={isCollapsible ? "" : title}
              name={name}
              onBrowserChange={(props) => {
                const itemsToChange: { name: string; value: string | Record<string, any> }[] = props.map(
                  ({ value, label }, index) => ({
                    name: `${name}.images[${fieldType?.includes("single") ? 0 : index || 0}]`,
                    value: {
                      related_id: value,
                      image: {
                        id: value,
                        title: label,
                        image: value,
                      },
                    },
                  })
                );
                itemsToChange.push({ name: `${name}.id`, value: id });

                handleChange(itemsToChange);
              }}
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
                    name: `${name}.images[${fieldType?.includes("single") ? 0 : currentValue?.length || 0}]`,
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
              value={
                fieldType === "images_multiple" ? (currentValue || [])?.map((t) => t.related_id) : currentValue?.[0]?.related_id
              }
              variant={IS_GATEWAY || !isDrawer ? "primary" : "secondary"}
            />
          </div>
        )}
        {currentValue?.length === 1 && fieldType === "images_single" && !IS_GATEWAY ? (
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
            id={currentValue?.[0].related_id}
            image_id={currentValue?.[0].related_id}
            label={title}
            manual_project_id={project_id}
            title={currentValue?.[0]?.image?.title || ""}
            type="images"
          />
        ) : null}

        {IS_GATEWAY && !isDisabled ? (
          <Select
            isClearable
            isMultiple={fieldType === "images_multiple"}
            isReadOnly={isReadOnly}
            label={title}
            name={name}
            onChange={({ value, label }) => {
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
                (currentValue || [])?.some((img) => {
                  if (fieldType === "images_multiple") {
                    return value?.includes(img.related_id);
                  }
                  return img.related_id === value;
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
                      },
                    })),
                  },
                ]);
              } else {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.images`,
                    value: [
                      {
                        related_id: value,
                        image: {
                          id: value,
                          title: label,
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
                projectId && opt.value
                  ? { id: opt.value, shape: "circle", link: getAssetURL(projectId, "images", opt.value) }
                  : undefined,
            }))}
            value={
              fieldType === "images_multiple" ? (currentValue || []).map((c) => c.related_id) : currentValue?.[0]?.related_id
            }
            variant={IS_GATEWAY || !isDrawer ? "primary" : "secondary"}
          />
        ) : null}
        {fieldType === "images_multiple" ? (
          <div
            className={
              IS_GATEWAY ? "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4" : "flex flex-col gap-y-2 overflow-hidden"
            }>
            {(currentValue || [])?.map((val) => {
              return (
                <EntityPreview
                  key={val.image.id}
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
                  manual_project_id={projectId}
                  title={val.image?.title}
                  type="images"
                />
              );
            })}
          </div>
        ) : null}
      </RelationFieldContainer>
    </TemplateFieldContainer>
  );
}
