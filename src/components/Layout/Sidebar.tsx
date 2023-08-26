import { Link, useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { IconEnum, navItems, settingsSubnavItems } from "../../utils";
import { Icon } from "../Misc";
import { Tooltip } from "../Overlay";

const sidebarItems = [...navItems];
sidebarItems.unshift({ icon: IconEnum.home, tooltip: "Projects", navigate: "/projects" });

const SidebarClasses = tv({
  slots: {
    base: "flex w-full max-w-full flex-col border-r border-zinc-800 bg-zinc-900 lg:w-16 lg:min-w-[4rem] lg:max-w-[4rem] h-16 lg:h-full sticky bottom-0 lg:relative z-10",
    nav: "flex h-48 flex-1 flex-col overflow-x-hidden overflow-y-hidden lg:h-full lg:max-w-[4rem] lg:overflow-y-auto lg:overflow-x-hidden",
    list: "flex w-screen overflow-x-auto lg:w-full overflow-y-hidden lg:flex-1 lg:flex-col lg:items-center lg:justify-start lg:overflow-x-hidden",
    sidebarLogo: "flex h-16 items-center w-16 min-w-[4rem]",
    listItemLink: "w-full cursor-pointer transition-all lg:mx-0 flex justify-center w-16",
    listItem:
      "flex h-16 max-w-[4rem] min-w-[4rem] items-center justify-center transition-colors hover:text-blue-400 justify-center",
    listSettingsItem: "justify-center flex h-16 min-w-[4rem] items-center lg:mx-0 lg:ml-0 lg:mt-auto",
    settingsSubitem: "flex items-center gap-x-2",
    activeSettingsSubItem: "text-blue-400",
    navIcon: "cursor-pointer hover:text-blue-300 text-white",
  },
});

export function Sidebar() {
  const { project_id, type } = useParams();
  const {
    base,
    nav,
    list,
    sidebarLogo,
    listItemLink,
    listItem,
    listSettingsItem,
    settingsSubitem,
    activeSettingsSubItem,
    navIcon,
  } = SidebarClasses();
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
                className={`${listItemLink()} ${item.navigate === type ? "bg-blue-400" : ""}`}
                to={item.navigate === "/projects" ? item.navigate : `/projects/${project_id}/${item.navigate}`}>
                <Tooltip allowedPlacements={["right"]} content={item.tooltip}>
                  <li className={listItem()}>
                    <Icon className={navIcon()} fontSize={32} hFlip={item.navigate === "generators"} icon={item.icon} />
                  </li>
                </Tooltip>
              </Link>
            );
          })}

          <Tooltip
            allowedPlacements={["top", "top-start", "top-end", "right", "right-start", "right-end"]}
            arrowColor="#27272A"
            closeOnClick
            content={
              <div className="w-fit rounded border border-zinc-700 bg-zinc-800 py-2 shadow">
                <ul className="w-max gap-y-4 font-lato text-lg text-white">
                  {settingsSubnavItems.map((subItem) => (
                    <li key={subItem.tooltip} className="p-2">
                      <Link
                        className={`${settingsSubitem()} ${subItem.navigate === type ? activeSettingsSubItem() : ""}`}
                        to={`/projects/${project_id}/settings/${subItem.navigate}`}>
                        <Icon icon={subItem.icon} />
                        {subItem.tooltip}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            }
            customOffset={{ mainAxis: 10 }}
            isClickable>
            <li className={listSettingsItem()}>
              <Icon className={navIcon()} fontSize={32} icon={IconEnum.settings} />
            </li>
          </Tooltip>
        </ul>
      </nav>
    </div>
  );
}
