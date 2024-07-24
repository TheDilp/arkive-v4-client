import { useLayoutEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { capitalCase } from "remirror";

import { Button, Search } from "../../../components";
import { useGetEntity } from "../../../hooks";
import { AllAvailableEntities, AvailableEntityType, ProjectType } from "../../../types";
import { getDefaultEntityIcon, getEntityLink, getImageURL, getThumbnailUrl, IconEnum } from "../../../utils";

const navItems = ["manuscripts", "characters", "blueprints", "documents", "maps", "graphs", "calendars", "dictionaries"];

export function PublicNavbar() {
  const [search, setSearch] = useState<string | null>("");

  const [results, setResults] = useState<
    { name: string; result: { id: string; label: string; image?: string; parent_id?: string }[] }[] | null
  >(null);

  const { project_id, type } = useParams();
  const { data: project } = useGetEntity<ProjectType>(
    project_id,
    "projects",
    {
      fields: ["image_id", "title"],
    },
    {
      staleTime: Infinity,
      queryKeyConcat: ["public"],
    }
  );

  useLayoutEffect(() => {
    if (project?.data) {
      const tabIconEl = document.getElementById("wiki-icon") as HTMLLinkElement;

      if (tabIconEl && project?.data?.image_id)
        tabIconEl.href = getThumbnailUrl(getImageURL(project_id as string, "images", project?.data?.image_id), {
          width: 32,
          height: 32,
        });

      document.title = `${project?.data?.title || "The Arkive"} wiki`;
    }
  }, [project]);

  const navigate = useNavigate();

  return (
    <div className="mb-2 flex h-16 max-h-16 items-center justify-between gap-x-2 text-lg">
      <div className="flex gap-x-2">
        <div className="max max-w-14 overflow-hidden">
          <img
            alt="Logo"
            className="relative -left-1 min-w-14 object-contain"
            src={
              project?.data?.image_id
                ? getThumbnailUrl(getImageURL(project_id as string, "images", project?.data?.image_id), {
                    width: 256,
                    height: 256,
                  })
                : "/Logo.webp"
            }
          />
        </div>
        <div className="flex flex-col items-start">
          <h2 className="flex-1 font-merriweather text-xl font-bold">{project?.data?.title}</h2>
          <nav className="hidden text-base md:block">
            <ul className="flex flex-nowrap gap-x-2">
              {navItems.map((item) => (
                <li className={item === type ? "text-blue-400" : ""} key={item}>
                  <Link className="hover:text-blue-400" to={`/${project_id}/${item}`}>
                    {capitalCase(item || "")}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="relative mb-2 mt-auto h-8 min-h-[2rem] w-56">
        {typeof search === "string" ? (
          <Search
            hasNoBackground
            imageType="images"
            manualResults={(results || []).flatMap((result) =>
              result.result.map((r) => {
                return {
                  icon: getDefaultEntityIcon(
                    result.name === "character_map_pins" ? "map_pins" : (result.name as AvailableEntityType)
                  ),
                  value: r.id,
                  label: r.label,
                  image: r?.image,
                  parent_id: r?.parent_id,
                  type: result.name as AllAvailableEntities,
                };
              })
            )}
            name="search"
            onChange={({ type: searchType, value, parent_id }) => {
              navigate(getEntityLink(project_id as string, searchType as string, value, parent_id));
              setResults(null);
            }}
            onSearch={(res) => setResults(res)}
            searchEntity="all"
          />
        ) : (
          <Button hasNoBackground icon={IconEnum.search} isIconOnly onClick={() => setSearch("")} />
        )}
      </div>
    </div>
  );
}
