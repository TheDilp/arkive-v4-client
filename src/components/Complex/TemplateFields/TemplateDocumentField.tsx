import { useParams } from "react-router-dom";

import { BlueprintInstanceBlueprintFieldType, HandleChangePropsType } from "../../../types";
import { AnswerType } from "../../../types/EntityTypes/questionnaireTypes";
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
  isQuestionnaire?: boolean;
  currentValue: BlueprintInstanceBlueprintFieldType["documents"] | AnswerType["documents"];
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
  isQuestionnaire,
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
            onChange={({ value, label, icon, project_id: entity_project_id }) => {
              handleChange(
                isQuestionnaire
                  ? {
                      name,
                      value: [
                        {
                          id: value,
                          title: label,
                          icon,
                          project_id: entity_project_id,
                        },
                      ],
                    }
                  : [
                      { name: `${name}.id`, value: id },
                      {
                        name: `${name}.documents[${fieldType.includes("single") ? 0 : currentValue?.length || 0}]`,
                        value: {
                          related_id: value,
                          document: {
                            id: value,
                            title: label,
                            icon,
                            project_id: entity_project_id,
                          },
                        },
                      },
                    ],
              );
            }}
            placeholder="Press enter to search."
            searchEntity="documents"
          />
        )}
        {(currentValue || [])?.map((val) => {
          const document = "related_id" in val ? val.document : val;

          return (
            <EntityPreview
              key={document.id}
              clearAction={
                isDisabled
                  ? undefined
                  : (doc_id) => {
                      handleChange([
                        {
                          name: isQuestionnaire ? name : `${name}.documents`,
                          value: currentValue.filter((c) => ("related_id" in c ? c.related_id : c.id) !== doc_id),
                        },
                      ]);
                    }
              }
              entity_project_id={document?.project_id}
              icon={document?.icon || ""}
              id={document?.id}
              link={getEntityLink(document?.project_id || project_id || "", "documents", document?.id, undefined, false)}
              title={document?.title}
              type="documents"
            />
          );
        })}
      </div>
    </TemplateFieldContainer>
  );
}
