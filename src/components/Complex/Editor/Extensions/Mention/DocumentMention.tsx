import { Link } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useGetEntity } from "../../../../../hooks";
import { DocumentType } from "../../../../../types";
import { Card, Tooltip } from "../../../..";
import StaticRender from "../../StaticRender";

type Props = {
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
    { data: {} },
    { enabled: !!id, staleTime: 5 * 60 * 1000 },
  );
  return (
    <Card title={title || "TEST"}>
      <div className="h-96 w-96 overflow-y-auto whitespace-pre-line">
        {isLoading ? "LOADING..." : null}
        {data?.data?.content && !isLoading ? <StaticRender content={data.data.content as RemirrorJSON} /> : null}
      </div>
    </Card>
  );
}
export function DocumentMention({ title, id, label, isDisabledTooltip, project_id }: Props) {
  return (
    <Tooltip
      content={<DocumentMentionTooltip id={id} title={title || label} />}
      delay={{ openDelay: 500 }}
      isDisabled={isDisabledTooltip ?? false}>
      <Link
        className="font-Lato border-none text-sm font-bold text-white underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
        to={!project_id ? `/view/documents/${id}` : `/projects/${project_id}/documents/${id}`}>
        {title || label}
      </Link>
    </Tooltip>
  );
}
