import { useState } from "react";

import { CharactersView } from "../../../pages/Entities";
import { TableSelectionType, TabType } from "../../../types";
import { IconEnum } from "../../../utils";
import { Input, Title } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";

type Props = {
  data: {
    id: string;
    type: "characters" | "blueprint_instances";
  };
};

const tabs: TabType[] = [
  { id: "characters", label: "Characters", icon: IconEnum.character },
  { id: "blueprints", label: "Blueprints", icon: IconEnum.blueprint },
  { id: "documents", label: "Documents", icon: IconEnum.document },
  { id: "maps", label: "Maps", icon: IconEnum.map },
  { id: "map_pins", label: "Map pins", icon: IconEnum.map_pin },
  { id: "events", label: "Events", icon: IconEnum.event },
  { id: "images", label: "Images", icon: IconEnum.image },
  { id: "random_tables", label: "Random tables", icon: IconEnum.random_table },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function GatewayAccessDrawer({ data }: Props) {
  const [email, setEmail] = useState("");
  const [selection, setSelection] = useState<Record<string, TableSelectionType>>({ characters: {} });
  const [selectedTab, setSelectedTab] = useState(0);

  const isEmailValid = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  return (
    <DrawerLayout>
      <Input
        helperText={email && !isEmailValid ? "Email is not valid" : ""}
        label="Grant access to (email, required)"
        name="email"
        onChange={({ value }) => setEmail(value as string)}
        type="email"
        value={email}
        variant={email && isEmailValid ? "primary" : "error"}
      />
      <Title isDrawerTitle label="Grant access to" size="xl" />
      <Tabs hasArrowNav onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "characters" ? (
        <CharactersView
          areActionsAndFiltersDisabled
          columnVisibility={{
            tags: false,
            age: false,
            is_public: false,
            action: false,
            is_favorite: false,
          }}
          manualSelection={selection[tabs[selectedTab].id]}
          setManualSelection={(newSelection) => {
            setSelection((prev) => ({ ...prev, [tabs[selectedTab].id]: newSelection }));
          }}
        />
      ) : null}
    </DrawerLayout>
  );
}
