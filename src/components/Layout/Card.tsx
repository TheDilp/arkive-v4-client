import { Link, useNavigate, useParams } from "react-router-dom";

import { BaseCardType, CharacterType, ProjectCardType, ProjectDashboardInfoCardType } from "../../types";
import { getCharacterFullName, getImageURL, IconEnum, navItems } from "../../utils";
import { Icon } from "../Misc";
import { Tooltip } from "../Overlay/Tooltip";

export function ProjectCard({ id, title, image }: ProjectCardType) {
  const navigate = useNavigate();
  return (
    <Link
      className="group relative col-span-1 flex h-[28rem] flex-col items-center justify-center rounded bg-zinc-950 bg-cover bg-center bg-no-repeat shadow transition-all animate-in fade-in duration-500"
      to={`/projects/${id}`}>
      <h2 className="absolute top-[20%] z-10 max-w-full select-none truncate px-4 text-center font-merriweather text-4xl font-semibold text-white drop-shadow transition-all ">
        {title}
      </h2>
      <div className="count absolute top-[50%] z-20 mb-12 grid w-full grid-cols-3 gap-y-2 opacity-0 transition-all group-hover:opacity-100">
        {navItems.map((item, index) => (
          <div
            key={item.tooltip}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/projects/${id}/${item.navigate}`);
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
      <div
        className="absolute z-0 flex  h-full w-full flex-col items-center justify-end transition-all group-hover:brightness-75"
        style={{
          backgroundImage: `url(${image})`,
        }}
      />
    </Link>
  );
}

export function ProjectDashboardInfoCard({ title, count, icon, latestItems }: ProjectDashboardInfoCardType) {
  return (
    <div className="col-span-4 h-56 w-full bg-zinc-800 p-4 shadow md:col-span-2 lg:col-span-1">
      <h2 className="flex justify-between text-3xl font-bold text-white">
        <span>{count}</span>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-x-2 text-2xl font-semibold text-zinc-300">
            <Link className="transition-colors hover:text-blue-400" to={`/projects/${title}/${title}`}>
              {title}
            </Link>
            <Icon fontSize={32} icon={icon} />
          </span>
        </div>
      </h2>
      <div className="mt-8 flex flex-col">
        <h4 className="text-lg font-light text-zinc-600">Latest</h4>
        <ul className="flex flex-col">
          {latestItems.map((item) => (
            <li key={item.id} className="truncate text-white">
              <Link
                key={item.id}
                className="truncate text-xl font-bold transition-colors hover:text-blue-400"
                to={`${item.id}/${item.id}`}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function CharacterCard({
  id,
  first_name,
  last_name,
  portrait_id,
  is_favorite,
}: Pick<CharacterType, "id" | "first_name" | "last_name" | "portrait_id" | "is_favorite">) {
  const { project_id } = useParams();
  return (
    <Link
      className="group relative col-span-1 flex h-[25rem] flex-col items-center justify-center overflow-hidden rounded bg-cover shadow transition-all animate-in fade-in duration-500"
      to={id}>
      {is_favorite ? (
        <div className="absolute right-0 top-0 z-10 m-4">
          <Icon fontSize={36} icon={IconEnum.star} thickness="fill" />
        </div>
      ) : null}
      <h2 className="absolute top-[20%] z-10 max-w-full select-none truncate px-4 text-center font-merriweather text-4xl font-semibold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transition-all ">
        {getCharacterFullName(first_name, "", last_name)}
      </h2>
      <div
        className="absolute z-0 flex h-full w-full flex-col items-center justify-end bg-zinc-950 bg-cover bg-top transition-all duration-300 group-hover:scale-125 group-hover:brightness-75 lg:bg-center"
        style={{
          backgroundImage: portrait_id ? `url(${getImageURL(project_id as string, "images", portrait_id)})` : "",
        }}
      />
    </Link>
  );
}

export function Card({ title, subtitle, children, image }: BaseCardType & { children: JSX.Element | JSX.Element[] | null }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-md bg-zinc-700 p-4 shadow">
      {image ? (
        <div className="mb-4 h-64 w-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${image})` }} />
      ) : null}
      <h2 className="w-full text-center text-3xl text-white">{title}</h2>
      <h2 className="w-full text-center text-lg text-zinc-400">{subtitle}</h2>
      {children}
    </div>
  );
}
