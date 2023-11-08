import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { getCharacterFullName, IconEnum, useNotifications } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search } from "../../Form";
import { Collapsible } from "../../Layout";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "characters_single" | "characters_multiple";

  currentValue: BlueprintInstanceBlueprintFieldType["characters"];
};

export function TemplateCharacterField({ title, name, handleChange, id, fieldType, currentValue }: Props) {
  const createNotification = useNotifications();

  return (
    <Collapsible label={title}>
      <div className="flex max-h-36 flex-col gap-y-2 overflow-y-auto">
        <Search
          name={name}
          onChange={({ value, first_name, last_name, image }) => {
            if (currentValue?.some((cVal) => cVal.related_id === value)) {
              createNotification({
                timer: 3,
                title: "Cannot add same character more than once.",
                variant: "warning",
                icon: IconEnum.warning,
              });
            }
            if (fieldType.includes("single")) {
              handleChange([
                { name: `${name}.id`, value: id },
                {
                  name: `${name}.characters[0]`,
                  value: {
                    related_id: value,
                    character: {
                      id: value,
                      first_name,
                      last_name,
                      portrait_id: image,
                    },
                  },
                },
              ]);
            } else {
              handleChange([
                { name: `${name}.id`, value: id },
                {
                  name: `${name}.characters[${currentValue.length}]`,
                  value: {
                    related_id: value,
                    character: {
                      id: value,
                      first_name,
                      last_name,
                      portrait_id: image,
                    },
                  },
                },
              ]);
            }
          }}
          placeholder="Press enter to search."
          searchEntity="characters"
        />
        {(currentValue || [])?.map((val) => (
          <EntityPreview
            key={val.related_id}
            clearAction={(char_id) => {
              handleChange([
                {
                  name: `${name}.characters`,
                  value: currentValue.filter((c) => c.related_id !== char_id),
                },
              ]);
            }}
            id={val?.related_id}
            image_id={val?.character?.portrait_id}
            title={getCharacterFullName(val?.character?.first_name, undefined, val.character?.last_name)}
            type="characters"
          />
        ))}
      </div>
    </Collapsible>
  );
}
