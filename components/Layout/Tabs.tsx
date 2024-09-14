import { Fragment, MutableRefObject, useRef } from "react";
import { tv } from "tailwind-variants";

import { TabsTypes } from "../../types";
import { IconEnum } from "../../utils";
import { Button } from "../Form";
import { Icon } from "../Misc";

const TabsClasses = tv({
  slots: {
    base: "border-b border-zinc-500",
    tabsContainer: "h-8 font-lato flex max-w-full scrollbar-hidden relative flex-nowrap overflow-auto text-lg -mb-px",
    tabDivider: "border-b border-zinc-700",
  },
  variants: {
    isVertical: {
      true: {
        base: "border-none",
        tabsContainer: "flex-col h-fit gap-y-2 w-full",
      },
    },
  },
});

const TabClasses = tv({
  base: "px-2 transition-all font-lato flex items-center flex-nowrap gap-x-2 text-white select-none border-b border-zinc-500",
  variants: {
    isSelected: {
      true: "border-blue-500",
    },
    isDisabled: {
      true: "border-zinc-800 text-zinc-600 cursor-not-allowed",
      false: "cursor-pointer",
    },
    isVertical: {
      true: "p-1 px-2 justify-between text-base",
    },
  },
  compoundVariants: [{ isSelected: true, isVertical: true, class: "bg-zinc-700 border-none rounded" }],
});

export function Tabs({ tabs, selectedTab, onChange, isVertical, hasArrowNav }: TabsTypes) {
  const tabsContainerRef = useRef() as MutableRefObject<HTMLUListElement>;
  const { base, tabDivider, tabsContainer } = TabsClasses({ isVertical });

  return (
    <div className={base()}>
      <ul ref={tabsContainerRef} className={tabsContainer()}>
        {hasArrowNav ? (
          <li className="sticky left-0 [&>button:active]:opacity-100 [&>button]:w-5 [&>button]:rounded-none [&>button]:shadow-none">
            <Button
              icon={IconEnum.chevron_left}
              iconThickness="bold"
              onClick={() => {
                tabsContainerRef.current.scrollBy({
                  left: -tabsContainerRef.current.clientWidth * (tabs.length / 10),
                  behavior: "smooth",
                });
              }}
            />
          </li>
        ) : null}
        {tabs.map((tab, index) => (
          <Fragment key={tab.id}>
            <li
              className={TabClasses({ isSelected: index === selectedTab, isVertical, isDisabled: tab.isDisabled })}
              onClick={(e) => {
                if (tab.isDisabled) return;
                if (onChange && selectedTab !== index) onChange(tab, index);
                e.currentTarget.scrollIntoView({ behavior: "smooth" });
              }}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  if (onChange && selectedTab !== index) onChange(tab, index);
                  e.currentTarget.scrollIntoView({ behavior: "smooth" });
                }
              }}
              role="tab"
              tabIndex={0}>
              <span className="truncate">{tab.label}</span>
              {tab?.icon ? <Icon icon={tab.icon} /> : null}
            </li>
            {tab.hasDivider ? <hr className={tabDivider()} /> : null}
          </Fragment>
        ))}
        {hasArrowNav ? (
          <li className="sticky right-0 ml-auto [&>button:active]:opacity-100 [&>button]:w-5 [&>button]:rounded-none [&>button]:shadow-none">
            <Button
              icon={IconEnum.chevron_right}
              iconThickness="bold"
              onClick={() => {
                tabsContainerRef.current.scrollBy({
                  left: tabsContainerRef.current.clientWidth * (tabs.length / 10),
                  behavior: "smooth",
                });
              }}
            />
          </li>
        ) : null}
      </ul>
    </div>
  );
}
