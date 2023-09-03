import { useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";
import { tv } from "tailwind-variants";

import { useGetEntities, useGetEntity } from "../../../hooks";
import { CharacterFieldType, DocumentType, TableType } from "../../../types";
import { RandomTableSubOptionType } from "../../../types/EntityTypes/randomTableTypes";
import { getSentenceCase } from "../../../utils";
import { StaticRender } from "../../Complex";
import { Skeleton } from "../../Misc";
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
          <div className="flex w-full max-w-full items-center gap-x-2">
            <span>
              <Badge label={getSentenceCase(suboption.title || "")} variant="info" />
            </span>
            {suboption?.description ? (
              <>
                <span>-</span>
                <div className="truncate text-sm">{suboption?.description}</div>
              </>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
function ExpandedDocument({ id }: { id: string }) {
  const { data, isFetching } = useGetEntity<DocumentType>(
    id,
    "documents",
    {
      data: {
        id,
      },
      fields: ["id", "content"],
    },
    {
      enabled: !!id,
    },
  );
  if (isFetching) return <Skeleton type="editor" />;
  return data?.data?.content ? (
    <div className="w-min min-w-fit">
      <StaticRender content={data?.data?.content as RemirrorJSON} />
    </div>
  ) : null;
}

export function ExpandedTableRow({ data, type }: { data: any } & Pick<TableType, "type">) {
  return (
    <div className={ExpandedTableRowClasses()}>
      {type === "documents" ? <ExpandedDocument id={data?.id} /> : null}

      {type === "character_fields_templates" ? <ExpandedTemplateFields templateId={data?.id} /> : null}
      {/* Random table options have suboptions fetched with them in order to use the "Roll on table" feature */}
      {/* Therefore they can be passed as prop directly, instead of using an id to fetch them */}
      {type === "random_table_options" ? <ExpandedRandomOption suboptions={data?.suboptions || []} /> : null}
    </div>
  );
}
