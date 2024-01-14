import { useParams } from "react-router-dom";

import { HandleChangePropsType, MapPinType } from "../../../types";
import { getEntityLink, IconEnum, useNotifications } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "locations_single" | "locations_multiple";
  isCollapsible?: boolean;
  currentValue: { related_id: string; map_pin: Pick<MapPinType, "id" | "title" | "icon"> }[];
};

export function TemplateLocationsField({ title, name, handleChange, id, fieldType, currentValue, isCollapsible }: Props) {
  const createNotification = useNotifications();
  const { project_id } = useParams();
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-36 flex-col gap-y-2 overflow-y-auto">
        <Search
          label={isCollapsible ? "" : title}
          name={name}
          onChange={({ value, label, icon }) => {
            if (currentValue?.some((cVal) => cVal.related_id === value)) {
              createNotification({
                timer: 3,
                title: "Cannot add same map pin more than once.",
                variant: "warning",
                icon: IconEnum.warning,
              });
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
                    title: label,
                    icon,
                  },
                },
              },
            ]);
          }}
          placeholder="Press enter to search."
          searchEntity="map_pins"
        />
        {(currentValue || [])?.map((val) => (
          <EntityPreview
            key={val.related_id}
            clearAction={(doc_id) => {
              handleChange([
                {
                  name: `${name}.map_pins`,
                  value: currentValue.filter((c) => c.related_id !== doc_id),
                },
              ]);
            }}
            icon={val?.map_pin?.icon || ""}
            id={val?.related_id}
            link={getEntityLink(project_id as string, "map_pins", id, undefined, false)}
            title={val?.map_pin?.title || ""}
            type="map_pins"
          />
        ))}
      </div>
    </TemplateFieldContainer>
  );
}
