import { useLayoutEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { capitalCase } from "remirror";

import { Button, Search } from "../../../components";
import { useGetEntity } from "../../../hooks";
import { useImageURL } from "../../../hooks/ui/useImageURL";
import { AllAvailableEntities, AvailableEntityType, ProjectType } from "../../../types";
import { getAssetURL, getDefaultEntityIcon, getEntityLink, IconEnum } from "../../../utils";

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

  const imageUrl = useImageURL(getAssetURL(project_id as string, "images", project?.data?.image_id));

  useLayoutEffect(() => {
    if (project?.data) {
      const tabIconEl = document.getElementById("wiki-icon") as HTMLLinkElement;

      if (tabIconEl && project?.data?.image_id) tabIconEl.href = imageUrl;

      document.title = `${project?.data?.title || "The Arkive"} wiki`;
    }
  }, [project, imageUrl]);

  const navigate = useNavigate();

  return (
    <div className="mb-4 flex max-h-24 flex-col items-center justify-between gap-x-2 text-lg lg:flex-row">
      <div className="flex items-center gap-x-2 self-start">
        <Link to="/">
          <div className="aspect-square max-w-20 overflow-hidden lg:max-w-14">
            <img
              alt="Logo"
              className="relative -left-1 aspect-square min-w-14 object-contain"
              src={project?.data?.image_id ? imageUrl : "/Logo.webp"}
            />
          </div>
        </Link>
        <div className="flex flex-col items-start">
          <h2 className="line-clamp-1 flex-1 font-merriweather text-2xl font-bold lg:text-xl">{project?.data?.title}</h2>
          <nav className="hidden text-base md:block">
            <ul className="flex flex-nowrap gap-x-2">
              {navItems.map((item) => (
                <li key={item} className={item === type ? "text-blue-400" : ""}>
                  <Link className="hover:text-blue-400" to={`/${project_id}/${item}`}>
                    {capitalCase(item || "")}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="relative mb-2 ml-8 mr-8 mt-auto h-8 min-h-[2rem] w-full lg:mr-0 lg:flex-1">
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
