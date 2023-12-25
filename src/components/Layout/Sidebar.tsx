import { useAtomValue } from "jotai";
import { Link, useLocation, useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useBreakpoint } from "../../hooks";
import { IconEnum, navItems, userAtom } from "../../utils";
import { Icon } from "../Misc";
import { Tooltip } from "../Overlay";

const sidebarItems = [...navItems];
sidebarItems.unshift({ icon: IconEnum.dasboard, tooltip: "Dasboard", navigate: "/" });

const SidebarClasses = tv({
  slots: {
    base: "flex w-full max-w-full flex-col border-r border-zinc-800 bg-zinc-900 lg:w-16 lg:min-w-[4rem] lg:max-w-[4rem] h-16 lg:h-full sticky bottom-0 lg:relative z-50",
    nav: "flex h-48 flex-1 flex-col overflow-x-hidden overflow-y-hidden lg:h-full lg:max-w-[4rem] lg:overflow-y-auto lg:overflow-x-hidden",
    list: "flex w-screen overflow-x-auto lg:w-full lg:flex-1 lg:flex-col lg:items-center lg:justify-start lg:overflow-x-hidden lg:overflow-y-auto overflow-y-hidden",
    sidebarLogo:
      "flex h-16 items-center justify-center w-16 min-w-[4rem] min-h-[4rem] sticky top-0 left-0 bg-zinc-900 select-none",
    listItemLink: "w-full cursor-pointer transition-all lg:mx-0 flex justify-center w-16 hover:fill-blue-300",
    listItem:
      "flex h-16 max-w-[4rem] min-w-[4rem] min-h-[4rem] items-center justify-center transition-colors hover:text-blue-400 justify-center",
    selectedListItem: "text-white bg-blue-400 [&>li]:hover:text-white",
    listSettingsItem: "justify-center flex h-16 min-w-[4rem] min-h-[4rem] items-center lg:mt-auto",
    selectedSettingsListItem: "text-white bg-blue-400 [&>li]:hover:text-white",
    navIcon: "cursor-pointer",
  },
});
const alwaysEnabledItems = ["/", "settings", "tags", "assets"];
export function Sidebar() {
  const { pathname } = useLocation();
  const { project_id, type } = useParams();
  const { isLg } = useBreakpoint();
  const user = useAtomValue(userAtom);
  const enabledEntities = Object.entries(user?.feature_flags || [])
    .filter(([key, value]) => {
      return key.includes("_enabled") && value;
    })
    .map(([key]) => key);

  const {
    base,
    nav,
    list,
    sidebarLogo,
    listItemLink,
    listItem,
    listSettingsItem,
    selectedListItem,
    selectedSettingsListItem,
    navIcon,
  } = SidebarClasses();
  return (
    <div className={base()}>
      <nav className={nav()}>
        <ul className={list()}>
          <li className={sidebarLogo()}>
            <Link className="cursor-pointer" to="/projects">
              <img alt="Arkive Logo" className="h-12" height={48} src="/Logo.webp" width={64} />
            </Link>
          </li>
          {sidebarItems
            .filter(
              (item) => enabledEntities.includes(`${item.navigate}_enabled`) || alwaysEnabledItems.includes(item.navigate),
            )
            .map((item) => {
              return (
                <Link
                  key={item.icon}
                  className={`${listItemLink()} ${
                    item.navigate === "characters" && pathname.includes("characters") ? selectedListItem() : ""
                  }
                ${item.navigate === "blueprints" && pathname.includes("blueprints") ? selectedListItem() : ""}
                ${item.navigate === type && type !== "settings" ? selectedListItem() : ""}
                 ${item.navigate === "settings" && type === "settings" ? selectedSettingsListItem() : ""}
                
                ${item.navigate === "settings" ? listSettingsItem() : ""}
                
                `}
                  to={item.navigate === "/" ? `/projects/${project_id}` : `/projects/${project_id}/${item.navigate}`}>
                  <Tooltip
                    allowedPlacements={[isLg ? "right" : "top"]}
                    content={item.tooltip}
                    isDisabled={item.navigate === type}>
                    <li className={listItem()}>
                      <Icon className={navIcon()} fontSize={32} hFlip={item.navigate === "generators"} icon={item.icon} />
                    </li>
                  </Tooltip>
                </Link>
              );
            })}
        </ul>
      </nav>
    </div>
  );
}
