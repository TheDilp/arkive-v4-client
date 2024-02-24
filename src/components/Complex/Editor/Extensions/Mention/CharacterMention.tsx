/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Icon } from "@iconify/react";
import { Link, useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useGetEntity } from "../../../../../hooks";
import { CharacterType } from "../../../../../types";
import { getImageURL, getMentionLink, IconEnum } from "../../../../../utils";
import { Card } from "../../../../Layout";
import { Avatar, Spinner } from "../../../../Misc";
import { Tooltip } from "../../../../Overlay";
import { StaticRender } from "../../StaticRender";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  isPublic?: boolean;
};

function CharacterMentionTooltip({ title, id, isPublic }: Pick<Props, "id" | "title" | "isPublic">) {
  const { project_id } = useParams();
  const { data, isLoading } = useGetEntity<CharacterType>(
    id as string,
    "characters",
    { data: { id }, fields: ["biography", "is_public", "portrait_id"] },
    { enabled: !!id, staleTime: 5 * 60 * 1000, queryKeyConcat: ["mention", "tooltip"], isPublic },
  );
  return (
    <Card avatar={getImageURL(project_id as string, "images", data?.data.portrait_id)} title={title || ""}>
      <div className="h-96 min-h-[24rem] w-96 min-w-[24rem] overflow-y-auto overflow-x-hidden whitespace-pre-line">
        {data?.data?.biography && !isLoading ? (
          <StaticRender content={data.data.biography as RemirrorJSON} isPublicView={isPublic} />
        ) : null}
        {isLoading ? (
          <div className="flex max-h-[24rem] max-w-[24rem] items-center justify-center">
            <Spinner />
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function CharacterMention({ id, project_id, title, label, isPublic }: Props) {
  const { data } = useGetEntity<CharacterType>(
    id,
    "characters",
    {
      fields: ["id", "full_name", "is_public", "portrait_id"],
    },
    { enabled: !!id, staleTime: 20 * 60 * 1000, queryKeyConcat: ["mention"], retry: false, isPublic },
  );

  if (isPublic && !data?.data?.is_public) return <span className="font-lato">{label}</span>;

  return id ? (
    <Tooltip
      arrowColor="#3f3f46"
      content={<CharacterMentionTooltip id={id} isPublic={isPublic} title={data?.data?.full_name || title || label} />}
      delay={{ openDelay: 500, closeDelay: 200 }}
      isDisabled={(isPublic && !data?.data?.is_public) ?? false}
      isPortal={false}>
      <Link
        className="inline-flex items-center font-lato text-sm font-bold transition-colors"
        to={getMentionLink(id as string, "characters", project_id as string, data?.data?.is_public ?? false, isPublic)}>
        <div className="flex items-start">
          {data?.data?.portrait_id ? (
            <span className="characterMentionImage" onClick={(e) => e.preventDefault()}>
              <Avatar hasShowImage image={getImageURL(project_id as string, "images", data?.data?.portrait_id)} size="3xs" />
            </span>
          ) : (
            <Icon fontSize={14} icon={IconEnum.character} />
          )}
          <span className="underline hover:text-sky-400">{data?.data?.full_name || title || label}</span>
        </div>
      </Link>
    </Tooltip>
  ) : (
    <span className="font-lato">{label}</span>
  );
}
