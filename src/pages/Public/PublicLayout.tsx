import { useState } from "react";
import { Outlet, useParams } from "react-router-dom";

import { Button, Dialog, Search } from "../../components";
import { useGetEntity } from "../../hooks";
import { ProjectType } from "../../types";
import { getImageURL, IconEnum } from "../../utils";

export function PublicLayout() {
  const [search, setSearch] = useState<string | null>("");
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
  return (
    <div className="flex h-screen max-h-screen w-screen flex-col p-4">
      <Dialog />
      <div className="mx-auto flex max-h-full w-full flex-1 flex-col lg:max-w-5xl">
        <div className="mb-2 flex items-center justify-between gap-x-2 text-lg">
          <div className="flex flex-nowrap gap-x-2">
            <div className="max-h-fit max-w-[56px]">
              <img
                alt="Logo"
                className="object-contain"
                src={getImageURL(project_id as string, "images", project?.data?.image_id)}
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

          <div className="mb-2 mt-auto h-8 min-h-[2rem]">
            {typeof search === "string" ? (
              <Search hasNoBackground isPublic name="test" onChange={() => {}} searchEntity="all" />
            ) : (
              <Button hasNoBackground icon={IconEnum.search} isIconOnly onClick={() => setSearch("")} />
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto rounded bg-zinc-900 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
