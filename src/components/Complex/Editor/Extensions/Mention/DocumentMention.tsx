import { Link } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useGetEntity } from "../../../../../hooks";
import { DocumentType } from "../../../../../types";
import { Card, Tooltip } from "../../../..";
import StaticRender from "../../StaticRender";

type Props = {
  alterId: string | null;
  id: string | undefined;
  label: string;
  isDisabledTooltip?: boolean;
  isReadOnly?: boolean;
  project_id: string | undefined;
  title?: string;
};

function DocumentMentionTooltip({ title, id }: Pick<Props, "id" | "title">) {
  const { data, isLoading } = useGetEntity<DocumentType>(
    id as string,
    "documents",
    { data: {} },
    { enabled: !!id, staleTime: 5 * 60 * 1000 },
  );
  return (
    <Card title={title || "TEST"}>
      <div className="whitespace-pre-line">
        {title || "TEST"}
        {isLoading ? "LOADING..." : null}
        {data?.data?.content && !isLoading ? <StaticRender content={data.data.content as RemirrorJSON} /> : null}
      </div>
    </Card>
  );
}
export function DocumentMention({ alterId, title, id, label, isDisabledTooltip, isReadOnly, project_id }: Props) {
  const { data, isLoading } = useGetEntity<DocumentType>(
    id as string,
    "documents",
    { data: {} },
    { enabled: !!id && !isReadOnly, staleTime: 5 * 60 * 1000 },
  );

  const finalName = alterId
    ? data?.data?.alter_names?.find((a) => a?.id === alterId)?.title
    : data?.data?.title || title || label;

  if (isLoading) return "";
  return (
    <Tooltip content={<DocumentMentionTooltip id={id} title={title || label} />} isDisabled={isDisabledTooltip ?? false}>
      <Link
        className="font-Lato text-sm font-bold text-white underline hover:text-sky-400"
        to={!project_id ? `/view/documents/${id}` : `/project/${project_id}/documents/${id}`}>
        {finalName || title || label}
      </Link>
    </Tooltip>
  );
}
