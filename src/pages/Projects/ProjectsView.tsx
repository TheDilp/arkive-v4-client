import { useSetAtom } from "jotai";

import { Button, Drawer, Navbar, ProjectCard } from "../../components";
import { useChangeNavbarTitle, useGetAllProjects } from "../../hooks";
import { DrawerAtomType } from "../../types";
import { drawerAtom, IconEnum } from "../../utils";

export default function ProjectsView() {
  const setDrawer = useSetAtom(drawerAtom);
  const ownerId = localStorage.getItem("ownerId");
  const { data } = useGetAllProjects({ data: { owner_id: ownerId as string } });
  useChangeNavbarTitle("The Arkive");
  return (
    <div className="flex h-screen w-screen">
      <Drawer />
      <div className="h-full w-16 bg-zinc-900">
        <div className="flex h-16 w-full items-center justify-center">
          <img alt="Arkive Logo" className="h-12" src="/Logo.webp" />
        </div>
        <div className="h-16 w-full">
          <Button
            icon={IconEnum.add}
            iconSize={28}
            onClick={() =>
              setDrawer((prev: DrawerAtomType) => ({
                ...prev,
                type: "project",
                title: "Create new project",
                data: { owner_id: ownerId as string },
              }))
            }
          />
        </div>
      </div>
      <div className="flex h-full w-full flex-col">
        <div className="w-full">
          <Navbar />
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-2 2xl:grid-cols-4">
          {data?.data
            ? data.data.map((project) => <ProjectCard key={project.id} id={project.id} image="" title={project.title} />)
            : null}
        </div>
      </div>
    </div>
  );
}
