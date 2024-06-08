import { useState } from "react";

import { Avatar, Button, Select, Tooltip } from "../../components";
import { useHandleChange } from "../../hooks";
import { AvailableIcons, IconEnum } from "../../utils";
import { DiceRollInput } from "./DiceRollInput";

const sections: { tooltip: "roll_history" | "characters" | "journal" | "music"; icon: AvailableIcons }[] = [
  { tooltip: "roll_history", icon: IconEnum.random_table },

  { tooltip: "characters", icon: IconEnum.character },

  { tooltip: "journal", icon: IconEnum.info_circle },

  { tooltip: "music", icon: IconEnum.music },
];
type GameDrawerType = "roll_history" | "characters" | "journal" | "music" | null;

function RollHistory() {
  const [filter, setFilter] = useState<{ type: "character" | "player" | null; value: string[] | null }>({
    type: null,
    value: null,
  });
  const { handleChange } = useHandleChange({ data: filter, setData: setFilter });
  const rolls = [
    {
      id: "1",
      user: "A",
      title: "Melee attack",
      character: {
        id: "123",
        title: "Aurelian",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 23,
    },
    {
      id: "2",
      user: "A",
      title: "Persuasion check",

      character: {
        id: "123",
        title: "Aurelian",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 2,
    },
    {
      id: "3",
      user: "D",
      title: "Strength check",
      character: {
        id: "456",
        title: "Aurelian",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 17,
    },
    {
      id: "4",
      user: "V",
      title: "Dexterity saving throw",
      character: {
        id: "456",
        title: "Aurelian",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 12,
    },
  ];

  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden">
      <div className="flex flex-nowrap gap-x-2 p-2">
        <Select
          label="Filter type"
          name="type"
          onChange={handleChange}
          options={[
            { label: "Character", value: "character" },
            { label: "Player", value: "player" },
          ]}
          value={filter.type}
        />
        <Select
          isClearable
          isMultiple
          label="Filter"
          name="value"
          onChange={handleChange}
          options={[
            { label: "Aurelian", value: "123" },
            { label: "Baurelian", value: "456" },
          ]}
          value={filter.value}
        />
      </div>
      <ul className="max-h-full overflow-auto p-2">
        {(filter.type && filter.value
          ? rolls.filter((roll) => filter.value?.includes(filter.type === "character" ? roll.character.id : roll.user))
          : rolls
        ).map((roll) => (
          <li className="flex flex-col justify-center border-b border-zinc-700 p-2 first:border-t" key={roll.id}>
            <div className="flex items-center gap-x-2">
              <Avatar image={roll.character.image} size="xs" />
              <h2 className="text-zinc-300">
                {roll.character.title}: {roll.title}
              </h2>
            </div>
            <span className="mx-auto text-2xl font-extrabold">{roll.result}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GameView() {
  const [drawer, setDrawer] = useState<GameDrawerType>(null);

  return (
    <div className="flex h-full w-full flex-col text-white">
      <nav className={`absolute transition-all ${drawer ? "right-96" : "right-0"}`}>
        <ul className="flex flex-col gap-y-4">
          {sections.map((section) => (
            <li
              className={`flex cursor-pointer items-center justify-center rounded-l-md p-1 shadow transition-colors ${drawer === section.tooltip.toLowerCase() ? "bg-blue-500" : "bg-zinc-800"}`}
              key={section.tooltip}>
              <Tooltip content={section.tooltip}>
                <div>
                  <Button
                    hasNoBackground
                    icon={section.icon}
                    iconSize={32}
                    isIconOnly
                    onClick={() => {
                      if (drawer && drawer === section.tooltip.toLowerCase()) setDrawer(null);
                      else setDrawer(section.tooltip.toLowerCase() as GameDrawerType);
                    }}
                  />
                </div>
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>
      <div className={`${drawer ? "" : "translate-x-96"} ml-auto h-full w-96 max-w-96 bg-zinc-800 transition-all`}>
        {drawer === "roll_history" ? <RollHistory /> : null}
      </div>
      <div className="mt-auto p-4">
        <DiceRollInput />
      </div>
    </div>
  );
}
