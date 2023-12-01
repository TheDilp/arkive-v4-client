import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Avatar, Button, Search } from "../../components";
import { useGetEntity } from "../../hooks";
import { ProjectType, SearchAllEntitiesType } from "../../types";
import { getImageURL, IconEnum } from "../../utils";

export function PublicNavbar() {
  const [search, setSearch] = useState<string | null>("");
  const [results, setResults] = useState<SearchAllEntitiesType | null>(null);

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
          <>
            <Search
              hasNoBackground
              imageType="images"
              isAutocomplete
              isOptionsHidden
              isPublic
              name="search"
              onChange={() => navigate(`/public/${project_id}/`)}
              onSearch={(res) => setResults(res)}
              searchEntity="all"
            />
            <ul className="rounded-b bg-zinc-800 text-base shadow">
              {(results || []).flatMap((result) =>
                result.result.map((r) => (
                  <li key={r.id} className="flex items-center gap-x-2 px-2 py-1">
                    {"image" in r && r?.image ? (
                      <Avatar image={getImageURL(project_id as string, "images", r?.image as string)} size="xs" />
                    ) : null}
                    {"label" in r ? r?.label : null}
                  </li>
                )),
              )}
            </ul>
          </>
        ) : (
          <Button hasNoBackground icon={IconEnum.search} isIconOnly onClick={() => setSearch("")} />
        )}
      </div>
    </div>
  );
}
