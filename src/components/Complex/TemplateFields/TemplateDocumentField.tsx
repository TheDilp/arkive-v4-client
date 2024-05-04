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
  fieldType: "documents_single" | "documents_multiple";
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isGlobal?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["documents"];
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
  isGlobal,
}: Props) {
  const { project_id } = useParams();
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-56 flex-col gap-y-2 overflow-y-auto">
        {isDisabled ? null : (
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
            placeholder="Press enter to search."
            searchEntity="documents"
          />
        )}
        {(currentValue || [])?.map((val) => {
          return (
            <EntityPreview
              key={val.document.id}
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
              link={getEntityLink(
                val?.document?.project_id || project_id || "",
                "documents",
                val.document?.id,
                undefined,
                false,
              )}
              title={val.document?.title}
              type="documents"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
