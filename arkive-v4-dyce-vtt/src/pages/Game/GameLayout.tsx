import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";

import { Dialog, Drawer, Navbar, Sidebar, Spinner } from "../../../../components";
import { useBreakpoint, useGetEntities, useGetEntity, useGetUser, useNavbarTitle } from "../../../../hooks";
import { GameType, PermissionType } from "../../../../types";
import {
  currentUserPermissionsAtom,
  gameAtom,
  permissionsAtom,
  projectAtom,
  userAtom,
  userStatusAtom,
} from "../../../../utils";

export function GameLayout() {
  useNavbarTitle("", true);
  const { pathname } = useLocation();
  const { game_id, project_id } = useParams();
  const userStatus = useAtomValue(userStatusAtom);
  const setPermissions = useSetAtom(permissionsAtom);

  const setUserPermissions = useSetAtom(currentUserPermissionsAtom);
  const setUserAtom = useSetAtom(userAtom);
  const setGameAtom = useSetAtom(gameAtom);
  const setProjectAtom = useSetAtom(projectAtom);

  const { isLg } = useBreakpoint();
  const { data: userData, isInitialLoading: isInitialLoadingUser } = useGetUser(
    {
      data: { id: userStatus?.user_id as string },
      relations: {
        webhooks: true,
        roles: true,
      },
      fields: ["id"],
    },
    { enabled: !!userStatus?.user_id }
  );
  const { data: gameData, isInitialLoading: isInitialLoadingGame } = useGetEntity<GameType>(game_id, "games", {
    fields: ["id", "background_image", "description", "title", "next_session_date", "project_id"],
    relations: {
      game_players: true,
      project: true,
    },
  });
  const { data: permissions } = useGetEntities<PermissionType>(
    {
      fields: ["id", "title", "code"],
    },
    "permissions",
    {
      enabled: !!userStatus?.user_id && !!project_id,
      staleTime: Infinity,
    }
  );

  useEffect(() => {
    if (userData) {
      setUserPermissions((userData?.data?.role?.permissions || []).map((p) => p.code));
      setUserAtom(userData.data);
    }
  }, [userData?.data]);

  useEffect(() => {
    if (gameData) {
      setProjectAtom(gameData.data.project);
      setGameAtom(gameData.data);
    }
  }, [gameData?.data]);

  useEffect(() => {
    if (permissions?.data) {
      setPermissions(permissions?.data);
    }
  }, [permissions]);

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
