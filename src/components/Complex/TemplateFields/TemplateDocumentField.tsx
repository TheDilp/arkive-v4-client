import { DocumentType, HandleChangePropsType } from "../../../types";
import { IconEnum, useNotifications } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Search } from "../../Form";
import { Collapsible } from "../../Layout";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  fieldType: "documents_single" | "documents_multiple";

  currentValue: { related_id: string; document: Pick<DocumentType, "id" | "title" | "icon"> }[];
};

export function TemplateDocumentField({ title, name, handleChange, id, fieldType, currentValue }: Props) {
  const createNotification = useNotifications();

  return (
    <Collapsible label={title}>
      <div className="flex max-h-36 flex-col gap-y-2 overflow-y-auto">
        <Search
          name={name}
          onChange={({ value, label, icon }) => {
            if (currentValue?.some((cVal) => cVal.related_id === value)) {
              createNotification({
                timer: 3,
                title: "Cannot add same document more than once.",
                variant: "warning",
                icon: IconEnum.warning,
              });
            }
            if (fieldType.includes("single")) {
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
            } else {
              handleChange([
                { name: `${name}.id`, value: id },
                {
                  name: `${name}.documents[${currentValue.length}]`,
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
          }}
          placeholder="Press enter to search."
          searchEntity="documents"
        />
        {(currentValue || [])?.map((val) => (
          <EntityPreview
            key={val.related_id}
            clearAction={(doc_id) => {
              handleChange([
                {
                  name: `${name}.documents`,
                  value: currentValue.filter((c) => c.related_id !== doc_id),
                },
              ]);
            }}
            icon={val?.document?.icon || ""}
            id={val?.related_id}
            title={val?.document?.title}
            type="documents"
          />
        ))}
      </div>
    </Collapsible>
  );
}
