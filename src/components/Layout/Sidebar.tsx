import { Link, useLocation, useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { IconEnum, navItems } from "../../utils";
import { Icon } from "../Misc";
import { Tooltip } from "../Overlay";

const sidebarItems = [...navItems];
sidebarItems.unshift({ icon: IconEnum.home, tooltip: "Projects", navigate: "/projects" });

const SidebarClasses = tv({
  slots: {
    base: "flex w-full max-w-full flex-col border-r border-zinc-800 bg-zinc-900 lg:w-16 lg:min-w-[4rem] lg:max-w-[4rem] h-16 lg:h-full sticky bottom-0 lg:relative z-50",
    nav: "flex h-48 flex-1 flex-col overflow-x-hidden overflow-y-hidden lg:h-full lg:max-w-[4rem] lg:overflow-y-auto lg:overflow-x-hidden",
    list: "flex w-screen overflow-x-auto lg:w-full lg:flex-1 lg:flex-col lg:items-center lg:justify-start lg:overflow-x-hidden",
    sidebarLogo:
      "flex h-16 items-center justify-center w-16 min-w-[4rem] min-h-[4rem] sticky top-0 left-0 bg-zinc-900 select-none",
    listItemLink: "w-full cursor-pointer transition-all lg:mx-0 flex justify-center w-16 hover:fill-blue-300",
    listItem:
      "flex h-16 max-w-[4rem] min-w-[4rem] min-h-[4rem] items-center justify-center transition-colors hover:text-blue-400 justify-center",
    listSettingsItem:
      "bottom-0 right-0 sticky justify-center flex h-16 min-w-[4rem] min-h-[4rem] items-center lg:mx-0 lg:ml-0 lg:mt-auto bg-zinc-900",
    selectedListItem: "text-white sticky left-16 top-16 bottom-16 bg-blue-400 [&>li]:hover:text-white",
    settingsSubitem: "flex items-center gap-x-2 select-none",
    activeSettingsSubItem: "text-blue-400",
    navIcon: "cursor-pointer",
  },
});

export function Sidebar() {
  const { pathname } = useLocation();
  const { project_id, type } = useParams();
  const { base, nav, list, sidebarLogo, listItemLink, listItem, listSettingsItem, selectedListItem, navIcon } =
    SidebarClasses();
  return (
    <div className={base()}>
      <nav className={nav()}>
        <ul className={list()}>
          <li className={sidebarLogo()}>
            <img alt="Arkive Logo" className="h-12" src="/Logo.webp" />
          </li>
          {sidebarItems.map((item) => {
            return (
              <Link
                key={item.icon}
                className={`${listItemLink()} ${
                  item.navigate === "characters" && pathname.includes("characters") ? selectedListItem() : ""
                } ${item.navigate === type ? selectedListItem() : ""}
                
                ${item.navigate === "project-settings" ? listSettingsItem() : ""}
                
                `}
                to={item.navigate === "/projects" ? item.navigate : `/projects/${project_id}/${item.navigate}`}>
                <Tooltip allowedPlacements={["right"]} content={item.tooltip} isDisabled={item.navigate === type}>
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
