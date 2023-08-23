import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useGetEntities } from "../../../hooks";
import { AvailableEntityType, AvailableSubEntityType, CharacterFieldType } from "../../../types";
import { RandomTableSubOptionType } from "../../../types/EntityTypes/randomTableTypes";
import { getSentenceCase } from "../../../utils";
import { Badge } from "../../Misc/Badge";

const ExpandedTableRowClasses = tv({
  base: "p-4 border-b border-zinc-600 bg-zinc-800",
});

function ExpandedTemplateFields({ templateId }: { templateId: string }) {
  const { project_id } = useParams();
  const { data } = useGetEntities<CharacterFieldType>(
    {
      data: {
        project_id,
        parent_id: templateId,
      },
      filters: {
        and: [
          {
            field: "parent_id",
            value: templateId,
            operator: "eq",
          },
        ],
      },
    },
    "character_fields",
  );

  return (
    <div className="flex flex-col divide-y divide-zinc-700">
      {data?.data?.map((field) => (
        <div key={field.id} className="flex flex-col py-2 font-lato">
          <div className="flex gap-x-2">
            <span>{field.title}</span>
            <span className="ml-auto">
              <Badge label={getSentenceCase(field.field_type || "")} variant="info" />
            </span>
          </div>
          {(field.field_type === "select" || field.field_type === "select_multiple") && field.options?.length ? (
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
function ExpandedRandomOption({ suboptions }: { suboptions: RandomTableSubOptionType[] }) {
  return (
    <div className="flex flex-col gap-y-2">
      {suboptions?.map((suboption) => (
        <div key={suboption.id} className="flex flex-col font-lato">
          <div className="flex gap-x-2">
            <span>{suboption.title}</span>
            <span>-</span>
            <span>
              <Badge label={getSentenceCase(suboption.title || "")} variant="info" />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExpandedTableRow({ data, type }: { data: any; type: AvailableEntityType | AvailableSubEntityType }) {
  return (
    <div className={ExpandedTableRowClasses()}>
      {type === "character_fields_templates" ? <ExpandedTemplateFields templateId={data?.id} /> : null}
      {/* Random table options have suboptions fetched with them in order to use the "Roll on table" feature */}
      {type === "random_table_options" ? <ExpandedRandomOption suboptions={data?.suboptions || []} /> : null}
    </div>
  );
}
