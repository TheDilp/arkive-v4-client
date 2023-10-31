import { Link } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useGetEntity } from "../../../../../hooks";
import { DocumentType } from "../../../../../types";
import { IconEnum } from "../../../../../utils";
import { Card, Icon, Skeleton, Tooltip } from "../../../..";
import { StaticRender } from "../..";

type Props = {
  alterId: string | undefined;
  id: string | undefined;
  label: string;
  isDisabledTooltip?: boolean;
  project_id: string | undefined;
  title?: string;
};

function DocumentMentionTooltip({ title, id }: Pick<Props, "id" | "title">) {
  const { data, isLoading } = useGetEntity<DocumentType>(
    id as string,
    "documents",
    { fields: ["id", "title", "content"] },
    { enabled: !!id, queryKeyConcat: ["mention"] },
  );
  return (
    <Card title={title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto whitespace-pre-line">
        {data?.data?.content && !isLoading ? <StaticRender content={data.data.content as RemirrorJSON} /> : null}
        {isLoading ? <Skeleton type="editor" /> : null}
      </div>
    </Card>
  );
}
export function DocumentMention({ alterId, title, id, label, isDisabledTooltip, project_id }: Props) {
  const { data } = useGetEntity<DocumentType>(
    id as string,
    "documents",
    {
      fields: ["id", "title"],
      relations: {
        alter_names: alterId
          ? {
              and: [
                {
                  field: "id",
                  value: alterId,
                  operator: "eq",
                },
              ],
            }
          : false,
      },
    },
    { enabled: !!id, staleTime: 5 * 60 * 1000 },
  );
  const alter_name = data?.data?.alter_names?.find((an) => an.id === alterId);
  return (
    <Tooltip
      content={<DocumentMentionTooltip id={id} title={data?.data?.title || title || label} />}
      delay={{ openDelay: 500 }}
      isDisabled={isDisabledTooltip ?? false}>
      <Link
        className="mt-0 box-border inline-block h-full items-center border-none font-lato text-sm font-bold text-white underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
        to={!project_id ? `/view/documents/${id}` : `/projects/${project_id}/documents/${id}`}>
        <div className="flex items-start">
          <span className="relative top-0.5">
            <Icon fontSize={16} icon={IconEnum.document} />
          </span>
          <span className="underline">{alter_name?.title || data?.data?.title || title || label}</span>
        </div>
      </Link>
    </Tooltip>
  );
}
