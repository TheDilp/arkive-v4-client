import { tv } from "tailwind-variants";

import { useParams } from "react-router-dom";
import { useGetSubEntities } from "../../../hooks";
import { AvailableEntityType, FieldType } from "../../../types";
import { getSentenceCase } from "../../../utils";
import { Badge } from "../../Misc/Badge";

const ExpandedTableRowClasses = tv({
  base: "p-4 border-b border-zinc-600 bg-zinc-800",
});

function ExpandedTemplateFields({ templateId }: { templateId: string }) {
  const { projectId } = useParams();
  const { data } = useGetSubEntities<FieldType>(
    {
      data: {
        parentId: templateId,
        projectId: projectId as string,
      },
    },
    "characterFields",
    { enabled: !!templateId },
  );
  return (
    <div className="flex flex-col gap-y-2">
      {data?.data?.map((field) => (
        <div key={field.id} className="flex flex-col font-lato">
          <div className="flex gap-x-2">
            <span>{field.title}</span>
            <span>-</span>
            <span>
              <Badge label={getSentenceCase(field.fieldType || "")} variant="info" />
            </span>
          </div>
          {(field.fieldType === "select" || field.fieldType === "select_multiple") && field.options?.length ? (
            <div className="flex flex-col pl-4 text-sm">
              <h5 className="mt-2 w-max border-b">Available options</h5>
              <ul>
                {field.options.map((opt: string) => (
                  <li key={opt}>{opt}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function ExpandedTableRow({ data, type }: { data: any; type: AvailableEntityType }) {
  return (
    <div className={ExpandedTableRowClasses()}>
      {type === "characterFieldsTemplates" ? <ExpandedTemplateFields templateId={data?.id} /> : null}
    </div>
  );
}
