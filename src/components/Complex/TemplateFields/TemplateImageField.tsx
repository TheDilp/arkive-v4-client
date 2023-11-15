import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { IconEnum, useNotifications } from "../../../utils";
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
  currentValue: BlueprintInstanceBlueprintFieldType["images"];
};

export function TemplateImageField({ title, name, handleChange, id, fieldType, isCollapsible, currentValue }: Props) {
  const createNotification = useNotifications();

  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        <Search
          label={isCollapsible ? "" : title}
          name={name}
          onChange={({ value, label }) => {
            if (currentValue?.some((cVal) => cVal.related_id === value)) {
              createNotification({
                timer: 3,
                title: "Cannot add the same image more than once.",
                variant: "warning",
                icon: IconEnum.warning,
              });
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
        />
        {(currentValue || [])?.map((val) => (
          <EntityPreview
            key={val.related_id}
            clearAction={(char_id) => {
              handleChange([
                {
                  name: `${name}.images`,
                  value: currentValue.filter((c) => c.related_id !== char_id),
                },
              ]);
            }}
            id={val?.related_id}
            image_id={val?.image?.id}
            title={val?.image?.title}
            type="images"
          />
        ))}
      </div>
    </TemplateFieldContainer>
  );
}
