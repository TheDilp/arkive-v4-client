import { useSetAtom } from "jotai";
import { Link, useParams } from "react-router-dom";

import { EntityPreview, Icon } from "../../components";
import { useGetProjectDashboard } from "../../hooks";
import { AvailableEntityType } from "../../types";
import { capitalizeFirstLetter, drawerAtom, getDefaultEntityIcon, getPluralEntityType, getSearchLink } from "../../utils";

export function Dashboard() {
  const { project_id } = useParams();

  const { data: dashboard } = useGetProjectDashboard(project_id as string);

  const setDrawer = useSetAtom(drawerAtom);

  return (
    <div className="flex max-h-full flex-col overflow-auto">
      <h2 className="pb-2 font-merriweather text-xl">Continue working on...</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {(dashboard?.data || []).map((d, i, arr) => (
          <div
            key={d.name}
            className={`${
              i === arr.length - 1 ? "col-span-1 md:col-span-2 lg:col-span-1" : "col-span-1"
            } flex min-h-[18rem] flex-col items-center justify-start rounded bg-zinc-900 p-2 shadow-md`}>
            <h3 className="flex w-full items-center justify-center gap-x-0.5 self-start border-b border-zinc-700 pb-2 font-lato text-2xl font-bold">
              <Icon icon={getDefaultEntityIcon(d.name as AvailableEntityType)} />
              <Link className="transition-all duration-150 hover:text-blue-300" to={`/projects/${project_id}/${d.name}`}>
                {capitalizeFirstLetter(getPluralEntityType(d.name as AvailableEntityType))}
              </Link>
            </h3>
            <ul className="flex w-full flex-1 flex-col items-center justify-start  py-4 text-lg">
              {d.result.map((r) => (
                <li key={r.id} className="w-full [&>div>span>div:has(button)]:ml-auto">
                  <EntityPreview
                    hasNoBackground
                    id={r.id}
                    image_id={"portrait_id" in r ? r.portrait_id : null}
                    link={getSearchLink(
                      project_id as string,
                      d.name as AvailableEntityType,
                      r.id,
                      "parent_id" in r ? r?.parent_id : undefined,
                    )}
                    previewAction={() =>
                      setDrawer((prev) => ({
                        ...prev,
                        title: "Preview",
                        data: {
                          id: r.id,
                          parent_id: "parent_id" in r ? r?.parent_id ?? undefined : undefined,
                          entity_type: d.name as AvailableEntityType,
                          isReadOnly: d.name === "events",
                        },
                        type: "entity_preview",
                        size: "half",
                      }))
                    }
                    title={r.title}
                    type={d.name as AvailableEntityType}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
