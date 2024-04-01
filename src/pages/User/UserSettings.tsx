import { RedirectToSignIn, SignedOut } from "@clerk/clerk-react";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { Outlet } from "react-router-dom";

// import { deepMerge } from "remirror";
import { Drawer, Sidebar } from "../../components";
import { useBreakpoint } from "../../hooks";
import { drawerAtom, getProjectsViewNavItems } from "../../utils";

export function UserSettings() {
  const { isLg } = useBreakpoint();
  const setDrawer = useSetAtom(drawerAtom);
  const [view, setView] = useState<boolean | null>(null);
  // const { mutate: updateUser } = useUpdateUser(user?.id || "", authUser?.id || "");
  // function handleFeatureFlagChange(newValue: { name: string; value: boolean }) {
  //   const newFeatureFlags = deepMerge(user?.feature_flags || {}, { [newValue.name]: newValue.value });
  //   updateUser({
  //     data: {
  //       feature_flags: newFeatureFlags,
  //     },
  //   });
  // }

  return (
    <div className="flex h-screen w-screen flex-1 flex-col overflow-hidden lg:flex-row">
      <Drawer />
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      {isLg ? (
        <Sidebar isLoading={false} isUsingPermissions={false} items={getProjectsViewNavItems(setDrawer, setView, view)} />
      ) : null}
      <Outlet />
      <div className="flex flex-col">
        {/* <Collapsible label="Notifications from other project members">
          <div className="bg-zinc-900">
            {UserNotificationEntities.map((entity) => (
              <div
                key={entity}
                className="flex flex-nowrap items-center justify-between border-t border-zinc-700 px-2 first:border-t-0 hover:bg-zinc-800">
                <span>{capitalizeFirstLetter(getSentenceCase(entity))}:</span>
                <div className="flex w-52 items-center justify-between gap-x-2 text-center">
                  <Checkbox
                    label="Create"
                    name={`${entity}_create_notification`}
                    onChange={handleFeatureFlagChange}
                    value={user?.feature_flags?.[`${entity}_create_notification`]}
                  />
                  <Checkbox
                    label="Update"
                    name={`${entity}_update_notification`}
                    onChange={handleFeatureFlagChange}
                    value={user?.feature_flags?.[`${entity}_update_notification`]}
                  />
                  <Checkbox
                    label="Delete"
                    name={`${entity}_delete_notification`}
                    onChange={handleFeatureFlagChange}
                    value={user?.feature_flags?.[`${entity}_delete_notification`]}
                  />
                </div>
              </div>
            ))}
          </div>
        </Collapsible>
        <Collapsible label="Sidebar settings">
          <div className="bg-zinc-900">
            {UserSidebarEntitiesEnabled.map((entity) => (
              <div
                key={entity}
                className="flex flex-nowrap items-center justify-between border-t border-zinc-700 px-2 first:border-t-0 hover:bg-zinc-800">
                <span>Show {getPluralEntityType(entity as AllAvailableEntities)}:</span>
                <div className="flex w-fit flex-1 items-center justify-end gap-x-2 text-center">
                  <Checkbox
                    label="Enabled"
                    name={`${entity}_enabled`}
                    onChange={handleFeatureFlagChange}
                    value={user?.feature_flags?.[`${entity}_enabled`]}
                  />
                </div>
              </div>
            ))}
          </div>
        </Collapsible>
        <Collapsible label="Miscellaneous settings">
          <div className="bg-zinc-900">
            {MiscellaneousSettings.map((setting) => (
              <div
                key={setting}
                className="flex flex-nowrap items-center justify-between border-t border-zinc-700 px-2 first:border-t-0 hover:bg-zinc-800">
                <span>{getSentenceCase(setting)}:</span>
                <div className="flex w-fit flex-1 items-center justify-end gap-x-2 text-center">
                  <Checkbox
                    label="Enabled"
                    name={setting}
                    onChange={handleFeatureFlagChange}
                    value={user?.feature_flags?.[setting]}
                  />
                </div>
              </div>
            ))}
          </div>
        </Collapsible> */}
      </div>

      {isLg ? null : (
        <Sidebar isLoading={false} isUsingPermissions={false} items={getProjectsViewNavItems(setDrawer, setView, view)} />
      )}
    </div>
  );
}
