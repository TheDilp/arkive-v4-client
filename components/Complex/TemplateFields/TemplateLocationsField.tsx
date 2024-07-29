import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { getEntityLink } from "../../../utils";
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
  isGlobal?: boolean;
  isDisabled?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["map_pins"];
};

export function TemplateLocationsField({
  title,
  name,
  handleChange,
  id,
  fieldType,
  currentValue,
  isCollapsible,
  isDisabled,
  isGlobal,
}: Props) {
  const { project_id } = useParams();
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-36 flex-col gap-y-2 overflow-y-auto">
        {isDisabled ? null : (
          <Search
            isGlobal={isGlobal}
            label={isCollapsible ? "" : title}
            name={name}
            onChange={({ value, label, icon, parent_id }) => {
              if ((currentValue || [])?.some((doc) => doc.related_id === value)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.map_pins`,
                    value: (currentValue || []).filter((t) => t.related_id !== value),
                  },
                ]);
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
                      parent_id,
                      title: label,
                      icon,
                    },
                  },
                },
              ]);
            }}
            placeholder="Type at least 2 characters"
            searchEntity="map_pins"
            value={fieldType === "locations_multiple" ? currentValue?.map((c) => c.related_id) : undefined}
          />
        )}
        {(currentValue || [])?.map((val) => {
          return (
            <EntityPreview
              clearAction={
                isDisabled
                  ? undefined
                  : (doc_id) => {
                      handleChange([
                        {
                          name: `${name}.map_pins`,
                          value: currentValue.filter((c) => c.related_id !== doc_id),
                        },
                      ]);
                    }
              }
              icon={val?.map_pin?.icon || ""}
              id={val?.map_pin?.id}
              key={val.map_pin?.id}
              link={getEntityLink(project_id as string, "map_pins", id, undefined)}
              title={val?.map_pin?.title || ""}
              type="map_pins"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
