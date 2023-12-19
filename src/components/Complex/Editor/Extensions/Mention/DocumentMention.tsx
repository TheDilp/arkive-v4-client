import { Link } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useGetEntity } from "../../../../../hooks";
import { DocumentType } from "../../../../../types";
import { getMentionLink, IconEnum } from "../../../../../utils";
import { Card, Icon, Spinner, Tooltip } from "../../../..";
import { StaticRender } from "../..";

type Props = {
  alterId: string | undefined;
  id: string | undefined;
  label: string;
  isDisabledTooltip?: boolean;
  project_id: string | undefined;
  isPublic?: boolean;
  title?: string;
};

function DocumentMentionTooltip({ title, id, isPublic }: Pick<Props, "id" | "title" | "isPublic">) {
  const { data, isLoading } = useGetEntity<DocumentType>(
    id as string,
    "documents",
    { data: { id }, fields: ["content"] },
    { enabled: !!id && !isPublic, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention", "tooltip"] },
  );
  return (
    <Card title={title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto overflow-x-hidden whitespace-pre-line">
        {data?.data?.content && !isLoading ? <StaticRender content={data.data.content as RemirrorJSON} /> : null}
        {isLoading ? (
          <div className="flex max-h-[24rem] max-w-[24rem] items-center justify-center">
            <Spinner />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
export function DocumentMention({ alterId, title, id, label, isDisabledTooltip, project_id, isPublic }: Props) {
  const { data } = useGetEntity<DocumentType>(
    id as string,
    "documents",
    {
      fields: ["id", "title", "is_public"],
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
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention"], retry: false, isPublic },
  );
  const alter_name = data?.data?.alter_names?.find((an) => an.id === alterId);
  if (data?.data && (data?.data?.is_public || !isPublic))
    return (
      <Tooltip
        arrowColor="#3f3f46"
        content={<DocumentMentionTooltip id={id} isPublic={isPublic} title={data?.data?.title || title || label} />}
        delay={{ openDelay: 500 }}
        isDisabled={(isDisabledTooltip || isPublic) ?? false}>
        <Link
          className="mt-0 box-border inline-block h-full items-center border-none font-lato text-sm font-bold underline hover:text-sky-400 focus:outline-none focus-visible:outline-none active:outline-none"
          to={getMentionLink(id as string, "documents", project_id as string, data?.data?.is_public ?? false, isPublic)}>
          <div className="top-[0.025rem] flex items-start">
            <span className="relative top-0.5">
              <Icon fontSize={15} icon={IconEnum.document} />
            </span>
            <span className="underline">{alter_name?.title || data?.data?.title || title || label}</span>
          </div>
        </Link>
      </Tooltip>
    );

  return <span className="font-lato text-sm">{label}</span>;
}
