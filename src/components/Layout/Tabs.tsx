import { tv } from "tailwind-variants";

import { TabsTypes } from "../../types";
import { Icon } from "../Misc";

const TabsClasses = tv({
  slots: {
    base: "border-b border-zinc-200",
    tabsContainer: "h-8 font-lato flex max-w-full scrollbar-hidden flex-nowrap overflow-auto text-lg -mb-px",
    tab: "px-2 cursor-pointer transition-all font-lato flex items-center gap-x-2 text-white select-none",
    tabSelected: "inline-block border-blue-500 border-b-2",
  },
});

export function Tabs({ tabs, selectedTab, onChange }: TabsTypes) {
  const { base, tabsContainer, tab: tabClasses, tabSelected } = TabsClasses();
  return (
    <div className={base()}>
      <ul className={tabsContainer()}>
        {tabs.map((tab, index) => (
          <li
            key={tab.id}
            className={`${tabClasses()} ${index === selectedTab ? tabSelected() : ""}`}
            onClick={(e) => {
              if (onChange) onChange(tab, index);
              e.currentTarget.scrollIntoView({ behavior: "smooth" });
            }}
            onKeyDown={() => {}}
            role="tab"
            tabIndex={0}>
            <span className="truncate">{tab.label}</span>
            {tab?.icon ? <Icon icon={tab.icon} /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
