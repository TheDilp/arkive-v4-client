import { useSetAtom } from "jotai";
import { useState } from "react";

import { Button, Dropdown, Tabs } from "../../../../../components";
import { AvailableJournalEntryEntityTypesEnum, drawerAtom, getSingularEntityType, IconEnum } from "../../../../../utils";

const tabs = AvailableJournalEntryEntityTypesEnum.map((item) => ({ id: item.type, icon: item.icon, label: "" }));

export function JournalEntriesTab() {
  const [selectedTab, setSelectedTab] = useState(0);
  const setDrawer = useSetAtom(drawerAtom);

  return (
    <div className="flex flex-col items-end gap-y-2 px-2 py-4">
      <div className="w-full">
        <Tabs onChange={(_, i) => setSelectedTab(i)} selectedTab={selectedTab} tabs={tabs} />
      </div>
      <div className="w-min">
        <Dropdown
          allowedPlacements={["left-start", "left-end"]}
          items={[
            {
              id: "new",
              title: "New",
              icon: IconEnum.add,
              onClick: () => {
                setDrawer((prev) => {
                  if (tabs[selectedTab].id !== "images")
                    return {
                      ...prev,
                      title: `Create new ${getSingularEntityType(tabs[selectedTab].id)}`,
                      size: "3xl",
                      type: tabs[selectedTab].id,
                      data: {},

                      exceptions: {
                        globalCreate: true,
                      },
                    };
                  return prev;
                });
              },
            },
            {
              id: "existing",
              title: "Existing",
              icon: IconEnum.search,
              onClick: () => {},
            },
          ]}>
          <div className="h-8 w-8">
            <Button icon={IconEnum.add} isIconOnly onClick={undefined} variant="info" />
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
