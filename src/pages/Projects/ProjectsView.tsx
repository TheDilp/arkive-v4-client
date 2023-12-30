import { RedirectToSignIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useSetAtom } from "jotai";
import { useEffect } from "react";

import { Button, Drawer, Navbar, ProjectCard, Skeleton } from "../../components";
import { useChangeNavbarTitle, useGetAllProjects, useGetUser } from "../../hooks";
import { DrawerAtomType } from "../../types";
import { drawerAtom, getImageURL, IconEnum, userAtom } from "../../utils";

export function ProjectsView() {
  const setDrawer = useSetAtom(drawerAtom);

  useChangeNavbarTitle("The Arkive");

  const { user } = useUser();
  const { data, isLoading } = useGetAllProjects({
    data: { auth_id: user?.id },
    fields: ["id", "title", "image_id"],
  });

  const { data: userData } = useGetUser(
    {
      data: { auth_id: user?.id },
      relations: {
        webhooks: true,
      },
      fields: ["id"],
    },
    { enabled: !!user?.id },
  );
  const setUserAtom = useSetAtom(userAtom);

  useEffect(() => {
    if (userData) {
      setUserAtom(userData.data);
    }
  }, [userData?.data]);

  return (
    <div className="flex h-screen w-screen">
      <Drawer />
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <div className="h-full w-16 min-w-[4rem] max-w-[4rem] border-r border-zinc-800 bg-zinc-900">
        <div className="sticky left-0 top-0 flex h-16 min-h-[4rem] w-16 min-w-[4rem] select-none items-center justify-center border-r border-zinc-800 bg-zinc-900">
          <img alt="Arkive Logo" className="h-12 min-w-[4rem]" height={48} src="/Logo.webp" width={64} />
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
                data: { owner_id: userData?.data?.id as string },
              }))
            }
            tooltip="Create new project"
          />
        </div>
      </div>
      <div className="flex h-full w-full flex-col">
        <div className="w-full">
          <Navbar />
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-2 2xl:grid-cols-4">
          {isLoading ? <Skeleton limit={4} type="project_view" /> : null}
          {data?.data
            ? data.data.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  image={getImageURL(project.id, "images", project.image_id)}
                  title={project.title}
                />
              ))
            : null}
        </div>
      </div>
    </div>
  );
}
