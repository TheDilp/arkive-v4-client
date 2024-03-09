import { useParams } from "react-router-dom";

import { DocumentType, HandleChangePropsType } from "../../../types";
import { getEntityLink, IconEnum, useNotifications } from "../../../utils";
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
  currentValue: { related_id: string; document: Pick<DocumentType, "id" | "title" | "icon"> }[];
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
}: Props) {
  const createNotification = useNotifications();
  const { project_id } = useParams();
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} label={title}>
      <div className="flex max-h-36 flex-col gap-y-2 overflow-y-auto">
        {isDisabled ? null : (
          <Search
            isDisabled={isDisabled}
            label={isCollapsible ? "" : title}
            name={name}
            onChange={({ value, label, icon }) => {
              if (currentValue?.some((cVal) => cVal.related_id === value)) {
                createNotification({
                  timer: 3,
                  title: "Cannot add same document more than once.",
                  variant: "warning",
                  icon: IconEnum.warning,
                });
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
        {(currentValue || [])?.map((val) => (
          <EntityPreview
            key={val.related_id}
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
            id={val?.related_id}
            link={getEntityLink(project_id as string, "map_pins", id, undefined, false)}
            title={val?.document?.title}
            type="documents"
          />
        ))}
      </div>
    </TemplateFieldContainer>
  );
}
