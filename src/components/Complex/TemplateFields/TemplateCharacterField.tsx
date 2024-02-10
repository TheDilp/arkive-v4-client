import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { getEntityLink, IconEnum, useNotifications } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "characters_single" | "characters_multiple";
  isCollapsible?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["characters"];
};

export function TemplateCharacterField({ title, name, handleChange, id, fieldType, currentValue, isCollapsible }: Props) {
  const createNotification = useNotifications();
  const { project_id } = useParams();
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex h-56 max-h-56 flex-col gap-y-2 overflow-y-auto">
        <Search
          isAutocomplete
          isMultiple
          name={name}
          onChange={({ value, label, image }) => {
            if (currentValue?.some((cVal) => cVal.related_id === value)) {
              createNotification({
                timer: 3,
                title: "Cannot add the same character more than once.",
                variant: "warning",
                icon: IconEnum.warning,
              });
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
          placeholder="Press enter to search."
          searchEntity="characters"
          value={currentValue?.map((c) => c.related_id)}
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
            link={getEntityLink(project_id as string, "characters", id, undefined, false)}
            title={val?.character?.full_name || ""}
            type="characters"
          />
        ))}
      </div>
    </TemplateFieldContainer>
  );
}
