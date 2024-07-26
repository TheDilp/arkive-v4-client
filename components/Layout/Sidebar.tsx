import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useBreakpoint } from "../../hooks";
import { PermissionCodeType, SidebarType } from "../../types";
import {
  currentUserPermissionsAtom,
  enabledEntitiesAtom,
  getSidebarLink,
  isProjectOwnerAtom,
  moduleAtom,
  projectFeatureFlagsAtom,
} from "../../utils";
import { Icon, Skeleton, Tooltip } from "../";

const SidebarClasses = tv({
  slots: {
    base: "flex w-full max-w-full flex-col border-r border-zinc-800 bg-zinc-900 lg:w-16 lg:min-w-[4rem] lg:max-w-[4rem] h-16 lg:h-full sticky bottom-0 lg:relative z-50",
    nav: "flex h-48 flex-1 flex-col overflow-x-hidden overflow-y-hidden lg:h-full lg:max-w-[4rem] lg:overflow-y-auto lg:overflow-x-hidden",
    list: "flex w-screen overflow-x-auto lg:w-full lg:flex-1 lg:flex-col lg:items-center lg:justify-start lg:overflow-x-hidden lg:overflow-y-auto overflow-y-hidden",
    sidebarLogo:
      "flex h-16 items-center justify-center w-16 min-w-[4rem] min-h-[4rem] sticky top-0 left-0 bg-zinc-900 select-none",
    listItem: "flex h-16 max-w-[4rem] min-w-[4rem] min-h-[4rem] items-center justify-center transition-colors  justify-center",
  },
});
const { base, nav, list, sidebarLogo, listItem } = SidebarClasses();

const SidebarItemClasses = tv({
  base: "w-full transition-all lg:mx-0 flex justify-center w-16 ",
  variants: {
    isSelected: {
      true: "text-white bg-blue-400 [&>li]:hover:text-white",
    },
    isSettings: {
      true: "justify-center flex h-16 min-w-[4rem] min-h-[4rem] items-center lg:mt-auto ml-auto lg:ml-0",
    },
    isDisabled: {
      true: "cursor-not-allowed bg-zinc-300 ",
      false: "hover:text-blue-400",
    },
  },
  compoundVariants: [{ isSelected: true, isSettings: true, class: "text-white bg-blue-400 [&>li]:hover:text-white" }],
});
const alwaysEnabledItems = ["/", "settings", "tags", "assets"];

export function Sidebar({ isLoading, items, isUsingPermissions }: SidebarType) {
  const { pathname } = useLocation();
  const { project_id, type } = useParams();
  const module = useAtomValue(moduleAtom);
  const { isLg } = useBreakpoint();
  const featureFlags = useAtomValue(projectFeatureFlagsAtom);
  const userPermissions = useAtomValue(currentUserPermissionsAtom);
  const enabledEntities = useAtomValue(enabledEntitiesAtom);
  const isProjectOwner = useAtomValue(isProjectOwnerAtom);

  const finalSidebarItems = useMemo(() => {
    return isUsingPermissions
      ? items
          .filter((item) =>
            featureFlags
              ? enabledEntities.includes(`${item.navigate}`) || alwaysEnabledItems.includes(item.navigate)
              : alwaysEnabledItems.includes(item.navigate)
          )
          .map((item) => ({
            ...item,
            isDisabled:
              !isProjectOwner &&
              item.navigate !== "settings" &&
              item.navigate !== "/" &&
              !userPermissions.includes(`read_${item.navigate}` as PermissionCodeType),
          }))
      : items;
  }, [isProjectOwner, featureFlags, userPermissions, items]);

  return (
    <div className={base()}>
      <nav className={nav()}>
        <ul className={list()}>
          <li className={sidebarLogo()}>
            <Link className="cursor-pointer" to={`/${module === "dyce_vtt" ? "games" : "projects"}`}>
              <img
                alt="Arkive Logo"
                className="h-12"
                height={module === "dyce_vtt" ? 64 : 48}
                src="/Logo.webp"
                width={module === "dyce_vtt" ? 48 : 64}
              />
            </Link>
          </li>
          {isLoading
            ? null
            : finalSidebarItems.map((item) => {
                return (
                  <Link
                    className={SidebarItemClasses({
                      isSelected:
                        (item.navigate === "characters" && pathname.includes("characters")) ||
                        (item.navigate === "blueprints" && pathname.includes("blueprints")) ||
                        item.navigate === type,
                      isSettings: item.navigate.includes("settings"),
                      isDisabled: item?.isDisabled,
                    })}
                    key={item.icon}
                    onClick={item?.onClick}
                    to={item.onClick ? "#" : getSidebarLink(item.navigate, project_id as string, item?.isDisabled)}>
                    <Tooltip
                      allowedPlacements={[isLg ? "right" : "top"]}
                      content={item.tooltip}
                      isDisabled={item.navigate === type}>
                      <li className={listItem()}>
                        <Icon fontSize={32} hFlip={item.navigate === "generators"} icon={item.icon} />
                      </li>
                    </Tooltip>
                  </Link>
                );
              })}
          {isLoading ? <Skeleton type="sidebar" /> : null}
        </ul>
      </nav>
    </div>
  );
}
