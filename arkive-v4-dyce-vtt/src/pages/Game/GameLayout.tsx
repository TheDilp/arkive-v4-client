import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";

import { Dialog, Drawer, Navbar, Sidebar, Spinner } from "../../../../components";
import { useBreakpoint, useGetEntity, useGetUser, useNavbarTitle } from "../../../../hooks";
import { GameType } from "../../../../types";
import { gameAtom, userAtom, userStatusAtom } from "../../../../utils";

export function GameLayout() {
  useNavbarTitle("", true);
  const { pathname } = useLocation();
  const { game_id } = useParams();
  const user = useAtomValue(userStatusAtom);

  const { isLg } = useBreakpoint();
  const { data: userData, isInitialLoading: isInitialLoadingUser } = useGetUser(
    {
      data: { id: user?.user_id as string },
      relations: {
        webhooks: true,
      },
      fields: ["id"],
    },
    { enabled: !!user?.user_id }
  );
  const { data: gameData, isInitialLoading: isInitialLoadingGame } = useGetEntity<GameType>(game_id, "games", {
    fields: ["id", "background_image", "description", "title", "next_session_date", "project_id"],
    relations: {
      game_players: true,
    },
  });

  const setUserAtom = useSetAtom(userAtom);
  const setGameAtom = useSetAtom(gameAtom);

  useEffect(() => {
    if (userData) {
      setUserAtom(userData.data);
    }
  }, [userData?.data]);

  useEffect(() => {
    if (gameData) {
      setGameAtom(gameData.data);
    }
  }, [gameData?.data]);

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Dialog />
      <Drawer />
      {isLg && (!game_id || pathname.endsWith("settings")) ? (
        <Sidebar isLoading={isInitialLoadingUser || isInitialLoadingGame} isUsingPermissions={false} items={[]} />
      ) : null}
      <div className="flex h-full w-full flex-col">
        <div className="w-full">
          <Navbar isDisabled={isInitialLoadingUser || isInitialLoadingGame} />
        </div>
        {isInitialLoadingGame ? <Spinner /> : <Outlet />}
      </div>
    </div>
  );
}
