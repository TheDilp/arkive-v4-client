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
            label={isCollapsible ? "" : title}
            name={name}
            onChange={({ value, label, project_id: entity_project_id }) => {
              handleChange([
                { name: `${name}.id`, value: id },
                {
                  name: `${name}.images[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                  value: {
                    related_id: value,
                    image: {
                      id: value,
                      title: label,
                      project_id: entity_project_id,
                    },
                  },
                },
              ]);
            }}
            placeholder="Press enter to search."
            searchEntity="images"
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
