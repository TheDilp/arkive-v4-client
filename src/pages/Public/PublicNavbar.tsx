import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button, Search } from "../../components";
import { useGetEntity } from "../../hooks";
import { AllAvailableEntities, ProjectType } from "../../types";
import { getEntityLink, getImageURL, IconEnum } from "../../utils";

export function PublicNavbar() {
  const [search, setSearch] = useState<string | null>("");
  const [results, setResults] = useState<
    { name: string; result: { id: string; label: string; image?: string; parent_id?: string }[] }[] | null
  >(null);

  const { project_id } = useParams();
  const { data: project } = useGetEntity<ProjectType>(
    project_id,
    "projects",
    {
      fields: ["image_id", "title"],
    },
    {
      staleTime: Infinity,
      queryKeyConcat: ["public"],
      isPublic: true,
    },
  );
  const navigate = useNavigate();

  return (
    <div className="mb-2 flex items-center justify-between gap-x-2 text-lg">
      <div className="flex flex-nowrap gap-x-2">
        <div className="max-h-fit max-w-[56px]">
          <img
            alt="Logo"
            className="object-contain"
            src={getImageURL(project_id as string, "images", project?.data?.image_id) || "/Logo.webp"}
          />
        </div>
        <div className="flex flex-col items-start">
          <h2 className="flex-1 font-merriweather text-2xl font-bold">{project?.data?.title}</h2>
          <nav className="hidden text-base md:block">
            <ul className="flex flex-nowrap gap-x-2">
              <li>Characters</li>
              <li>Blueprints</li>
              <li>Documents</li>
              <li>Maps</li>
              <li>Graphs</li>
              <li>Dictionaries</li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="relative mb-2 mt-auto h-8 min-h-[2rem]">
        {typeof search === "string" ? (
          <Search
            hasNoBackground
            imageType="images"
            isAutocomplete
            isPublic
            manualResults={(results || []).flatMap((result) =>
              result.result.map((r) => ({
                value: r.id,
                label: r.label,
                image: r?.image,
                parent_id: r?.parent_id,
                type: result.name as AllAvailableEntities,
              })),
            )}
            name="search"
            onChange={({ type, value, parent_id }) => {
              navigate(getEntityLink(project_id as string, type as string, value, parent_id, true));
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
