import { useAtomValue, useSetAtom } from "jotai";

import { Button, Drawer, Navbar, ProjectGameCard, Sidebar } from "../../../components";
import { useBreakpoint, useGetEntities, useGetUser } from "../../../hooks";
import { GameType } from "../../../types";
import { drawerAtom, IconEnum, userStatusAtom } from "../../../utils";

export function GamesView() {
  const { isLg } = useBreakpoint();
  const user = useAtomValue(userStatusAtom);
  const { data, isFetching: isFetchingGames } = useGetEntities<GameType>({ fields: [] }, "games", {
    enabled: !!user?.user_id,
  });
  const { isInitialLoading: isInitialLoadingUser } = useGetUser(
    {
      data: { id: user?.user_id as string },
      relations: {
        webhooks: true,
      },
      fields: ["id"],
    },
    { enabled: !!user?.user_id && !isFetchingGames }
  );
  const setDrawer = useSetAtom(drawerAtom);
  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Drawer />

      {isLg ? <Sidebar isLoading={isInitialLoadingUser} isUsingPermissions={false} items={[]} /> : null}
      <div className="flex h-full w-full flex-col">
        <div className="w-full">
          <Navbar isDisabled={isInitialLoadingUser} />
        </div>
        <div className="p-4">
          <div className="ml-auto w-min">
            <Button
              icon={IconEnum.add}
              label="Create new game"
              onClick={() => setDrawer((prev) => ({ ...prev, title: "Create new game", data: {}, type: "games" }))}
            />
          </div>
          <div className="grid h-full max-h-full flex-1 grid-cols-1 gap-4 overflow-auto xl:grid-cols-2 2xl:grid-cols-4">
            {(data?.data || [])?.map((game) => (
              <ProjectGameCard
                key={game.id}
                feature_flags={{}}
                id={game.id}
                project_id={game.project_id}
                title={game.title}></ProjectGameCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
