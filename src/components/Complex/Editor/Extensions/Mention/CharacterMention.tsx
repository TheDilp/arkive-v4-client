/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";

import { useGetEntity } from "../../../../../hooks";
import { CharacterType } from "../../../../../types";
import { getImageURL, getMentionLink, IconEnum } from "../../../../../utils";
import { Avatar } from "../../../../Misc";

type Props = {
  title?: string;
  id: string | undefined;
  label: string;
  project_id: string | undefined;
  isPublic?: boolean;
};
export function CharacterMention({ id, project_id, title, label, isPublic }: Props) {
  const { data } = useGetEntity<CharacterType>(
    id,
    "characters",
    {
      fields: ["id", "full_name", "portrait_id"],
    },
    { enabled: !!id, staleTime: 20 * 60 * 1000, queryKeyConcat: ["mention"], retry: false, isPublic },
  );

  if (isPublic && !data?.data?.is_public) return <span className="font-lato text-sm">{label}</span>;

  return id ? (
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
  ) : (
    <span className="font-lato text-sm">{label}</span>
  );
}
