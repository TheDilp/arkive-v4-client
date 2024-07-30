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
  presetOptions?: GatewayConfigOptionType[] | null;
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
  presetOptions,
}: Props) {
  const { project_id } = useParams();
  const projectId = project_id || presetOptions?.[0]?.project_id;
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        {isDisabled || presetOptions || IS_GATEWAY ? null : (
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
        {isDisabled || !presetOptions ? null : (
          <Select
            label={title}
            name={name}
            onChange={({ value, label, image }) => {
              if ((currentValue || [])?.some((bpi) => bpi.related_id === value)) {
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
                      portrait_id: image?.id,
                    },
                  },
                },
              ]);
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
      </div>
    </TemplateFieldContainer>
  );
}
