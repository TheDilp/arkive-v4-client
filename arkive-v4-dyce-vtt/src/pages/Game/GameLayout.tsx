import { RedirectToSignIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";

import { Dialog, Drawer, Navbar, Sidebar } from "../../../../components";
import { useBreakpoint, useGetUser, useNavbarTitle } from "../../../../hooks";
import { userAtom, userStatusAtom } from "../../../../utils";

export function GameLayout() {
  useNavbarTitle("", true);
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
  const setUserAtom = useSetAtom(userAtom);

  useEffect(() => {
    if (userData) {
      // if (user)
      //   user?.update({
      //     unsafeMetadata: {
      //       user_id: userData.data.id,
      //       project_id: null,
      //     },
      //   });
      setUserAtom(userData.data);
    }
  }, [userData?.data]);

  if (!userData?.data) return null;

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Dialog />
      <Drawer />
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      {isLg && !game_id ? <Sidebar isLoading={isInitialLoadingUser} isUsingPermissions={false} items={[]} /> : null}
      <div className="flex h-full w-full flex-col">
        <div className="w-full">
          <Navbar isDisabled={isInitialLoadingUser} />
        </div>
        <Outlet />
      </div>
    </div>
  );
}
