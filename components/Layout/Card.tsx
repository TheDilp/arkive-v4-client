import { Link, useNavigate, useParams } from "react-router-dom";

import { BaseCardType, CharacterType, ProjectGameCardType } from "../../types";
import { getAssetURL, IconEnum, projectCardNavItems } from "../../utils";
import { Avatar, Icon } from "../Misc";
import { Tooltip } from "../Overlay/Tooltip";

const alwaysEnabledItems = ["/", "settings", "tags", "assets"];

export function ProjectGameCard({ id, title, image, feature_flags, module }: ProjectGameCardType) {
  const baseUrl = module === "arkive" ? "projects" : "games";
  const navigate = useNavigate();

  return (
    <Link
      className="animate-in fade-in group relative col-span-1 flex h-[28rem] flex-col items-center justify-center rounded bg-zinc-950 bg-cover bg-center bg-no-repeat shadow transition-all duration-500"
      to={`/${baseUrl}/${id}`}>
      <h2 className="absolute top-[20%] z-10 max-w-full select-none truncate px-4 text-center font-merriweather text-4xl font-semibold text-white drop-shadow transition-all">
        {title}
      </h2>
      {module === "arkive" ? (
        <div className="count absolute top-[50%] z-20 mb-12 grid w-full grid-cols-3 gap-y-2 opacity-0 transition-all group-hover:opacity-100">
          {projectCardNavItems
            .filter((item) => feature_flags?.[`${item.navigate}_enabled`] || alwaysEnabledItems.includes(item.navigate))
            .map((item, index) => (
              <div
                key={item.tooltip}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/${baseUrl}/${id}/${item.navigate}`);
                }}
                onKeyDown={() => {}}
                role="link"
                tabIndex={0}>
                <span className="col-span-1 flex items-center justify-center text-5xl">
                  <Tooltip allowedPlacements={index <= 3 ? ["top"] : ["bottom"]} content={item.tooltip}>
                    <div className="w-fit transition-colors hover:text-blue-400">
                      <Icon icon={item.icon} />
                    </div>
                  </Tooltip>
                </span>
              </div>
            ))}
        </div>
      ) : null}
      <div
        className="absolute z-0 flex h-full w-full flex-col items-center justify-end bg-cover bg-center bg-no-repeat transition-all group-hover:brightness-75"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />
    </Link>
  );
}

export function CharacterCard({
  id,
  full_name,
  portrait_id,
  is_favorite,
}: Pick<CharacterType, "id" | "full_name" | "portrait_id" | "is_favorite">) {
  const { project_id } = useParams();
  return (
    <Link
      className="animate-in fade-in group relative col-span-1 flex h-[25rem] flex-col items-center justify-center overflow-hidden rounded bg-cover shadow transition-all duration-500"
      to={`${id}/biography`}>
      {is_favorite ? (
        <div className="absolute right-0 top-0 z-10 m-4">
          <Icon fontSize={36} icon={IconEnum.star} thickness="fill" />
        </div>
      ) : null}
      <h2 className="absolute top-[20%] z-10 max-w-full select-none truncate px-4 text-center font-merriweather text-4xl font-semibold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transition-all">
        {full_name}
      </h2>
      <div
        className="absolute z-0 flex h-full w-full flex-col items-center justify-end bg-zinc-950 bg-cover bg-top transition-all duration-300 group-hover:scale-125 group-hover:brightness-75 lg:bg-center"
        style={{
          backgroundImage: portrait_id ? `url(${getAssetURL(project_id as string, "images", portrait_id)})` : "",
        }}
      />
    </Link>
  );
}

export function Card({
  title,
  subtitle,
  children,
  image,
  avatar,
}: BaseCardType & { avatar?: string; children: JSX.Element | JSX.Element[] | null }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-md border border-zinc-800 bg-zinc-700 p-4 shadow">
      {image ? (
        <div className="mb-4 h-64 w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${image})` }} />
      ) : null}
      <h2 className="pointer-events-none flex w-full items-center justify-center gap-x-2 text-center text-3xl text-white">
        {avatar ? <Avatar image={avatar} size="md" /> : null}
        <span>{title}</span>
      </h2>
      {subtitle ? <h2 className="w-full text-center text-lg text-zinc-400">{subtitle}</h2> : null}
      {children}
    </div>
  );
}
