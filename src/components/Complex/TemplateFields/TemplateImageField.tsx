import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { EntityPreview } from "../../DataDisplay";
import { Search } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "images_single" | "images_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isGlobal?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["images"];
};

export function TemplateImageField({
  title,
  name,
  handleChange,
  id,
  fieldType,
  isCollapsible,
  isDisabled,
  isGlobal,
  currentValue,
}: Props) {
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        {isDisabled ? null : (
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
            placeholder="Press enter to search."
            searchEntity="images"
            value={fieldType === "images_multiple" ? (currentValue || [])?.map((t) => t.related_id) : undefined}
          />
        )}
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
              title={val.image?.title}
              type="images"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
