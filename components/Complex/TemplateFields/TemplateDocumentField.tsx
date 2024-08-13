import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { GatewayConfigOptionType } from "../../../types/EntityTypes/gatewayTypes";
import { getEntityLink, getAssetURL } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search, Select } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "documents_single" | "documents_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isGlobal?: boolean;
  isOpen?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["documents"];
  presetOptions: GatewayConfigOptionType[];
};

export function TemplateDocumentField({
  title,
  name,
  handleChange,
  id,
  fieldType,
  currentValue,
  isCollapsible,
  isDisabled,
  isOpen,
  isGlobal,
  presetOptions = [],
}: Props) {
  const { project_id } = useParams();
  const projectId = project_id || presetOptions?.[0]?.project_id;
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        {isDisabled || IS_GATEWAY ? null : (
          <Search
            isDisabled={isDisabled}
            isGlobal={isGlobal}
            label={isCollapsible ? "" : title}
            name={name}
            onChange={({ value, label, icon }) => {
              if ((currentValue || [])?.some((doc) => doc.related_id === value)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.documents`,
                    value: (currentValue || []).filter((t) => t.related_id !== value),
                  },
                ]);
                return;
              }
              handleChange([
                { name: `${name}.id`, value: id },
                {
                  name: `${name}.documents[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                  value: {
                    related_id: value,
                    document: {
                      id: value,
                      title: label,
                      icon,
                    },
                  },
                },
              ]);
            }}
            placeholder="Type at least 2 documents"
            searchEntity="documents"
            value={fieldType === "documents_multiple" ? currentValue?.map((c) => c.related_id) : undefined}
          />
        )}
        {!IS_GATEWAY ? null : (
          <Select
            isClearable
            isMultiple={fieldType === "documents_multiple"}
            label={title}
            name={name}
            onChange={({ value, label, icon }) => {
              if (fieldType === "documents_multiple" && (!value || value?.length === 0)) {
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.documents`,
                    value: [],
                  },
                ]);
                return;
              }

              if (
                (currentValue || [])?.some((doc) => {
                  if (fieldType === "documents_multiple") {
                    return value?.includes(doc.related_id);
                  }
                  return doc.related_id === value;
                })
              ) {
                if (fieldType === "documents_multiple") {
                  const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));

                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.documents`,
                      value: selectedValues.map((opt) => ({
                        related_id: opt.value,
                        document: {
                          id: opt.value,
                          title: opt.label,
                          icon: opt?.icon,
                        },
                      })),
                    },
                  ]);
                } else {
                  handleChange([
                    { name: `${name}.id`, value: id },
                    {
                      name: `${name}.documents[0]`,
                      value: {
                        related_id: value,
                        document: {
                          id: value,
                          title: label,
                          icon,
                        },
                      },
                    },
                  ]);
                }
                return;
              }
              if (fieldType === "documents_multiple") {
                const selectedValues = presetOptions.filter((opt) => value?.includes(opt?.value));
                handleChange([
                  { name: `${name}.id`, value: id },
                  {
                    name: `${name}.documents`,
                    value: selectedValues.map((opt) => ({
                      related_id: opt.value,
                      document: {
                        id: opt.value,
                        title: opt.label,
                        icon: opt?.icon,
                      },
                    })),
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
            value={(currentValue || []).map((c) => c.related_id)}
          />
        )}
        <div className={IS_GATEWAY ? "grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4" : "flex flex-col gap-y-2"}>
          {(currentValue || [])?.map((val) => {
            return (
              <EntityPreview
                clearAction={
                  isDisabled
                    ? undefined
                    : (doc_id) => {
                        handleChange([
                          {
                            name: `${name}.documents`,
                            value: currentValue.filter((c) => c.related_id !== doc_id),
                          },
                        ]);
                      }
                }
                icon={val?.document?.icon || ""}
                id={val?.document?.id}
                key={val.document.id}
                link={getEntityLink(val?.document?.project_id || project_id || "", "documents", val.document?.id, undefined)}
                title={val.document?.title}
                type="documents"
              />
            );
          })}
        </div>
      </div>
    </TemplateFieldContainer>
  );
}
