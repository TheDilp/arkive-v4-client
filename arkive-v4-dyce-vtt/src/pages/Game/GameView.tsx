import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Avatar, Button, Select, Spinner } from "../../../../components";
import { useGetEntity, useHandleChange } from "../../../../hooks";
import { GameType } from "../../../../types";
import { AvailableIcons, IconEnum } from "../../../../utils";
import { DiceRollInput } from "./DiceRollInput";
import { CharacterTab } from "./Tabs/CharacterTab";

type GameDrawerType = "roll_history" | "characters" | "journal" | "music" | null;

const sections: { tooltip: string; id: GameDrawerType; icon: AvailableIcons }[] = [
  { id: "roll_history", tooltip: "Roll history", icon: IconEnum.random_table },
  { id: "characters", tooltip: "Characters", icon: IconEnum.character },
  { id: "journal", tooltip: "Journal", icon: IconEnum.info_circle },
  { id: "music", tooltip: "Music", icon: IconEnum.music },
];

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
      user: "B",
      title: "Ranged attack",
      character: {
        id: "124",
        title: "Viktor",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 18,
    },
    {
      id: "3",
      user: "C",
      title: "Magic spell",
      character: {
        id: "125",
        title: "Selene",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 27,
    },
    {
      id: "4",
      user: "D",
      title: "Stealth move",
      character: {
        id: "126",
        title: "Nyx",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 15,
    },
    {
      id: "5",
      user: "E",
      title: "Heal",
      character: {
        id: "127",
        title: "Luna",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 20,
    },
    {
      id: "6",
      user: "F",
      title: "Defense boost",
      character: {
        id: "128",
        title: "Brutus",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 25,
    },
    {
      id: "7",
      user: "G",
      title: "Special attack",
      character: {
        id: "129",
        title: "Athena",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 30,
    },
    {
      id: "8",
      user: "H",
      title: "Summon",
      character: {
        id: "130",
        title: "Zephyr",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 22,
    },
    {
      id: "9",
      user: "I",
      title: "Quick strike",
      character: {
        id: "131",
        title: "Drake",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 19,
    },
    {
      id: "10",
      user: "J",
      title: "Ultimate move",
      character: {
        id: "132",
        title: "Xander",
        image:
          "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/94359479-a682-40ec-8b8b-7d65dacf4c2e.webp",
      },
      result: 35,
    },
  ];

  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden">
      <div className="flex flex-nowrap gap-x-2 p-2">
        <div className="w-1/2">
          <Select
            label="Filter type"
            name="type"
            onChange={handleChange}
            options={[
              { label: "Character", value: "character" },
              { label: "Player", value: "player" },
            ]}
            size="sm"
            value={filter.type}
          />
        </div>
        <div className="w-1/2">
          <Select
            isClearable
            isDisabled={!filter.type}
            isMultiple
            label="Filter"
            name="value"
            onChange={handleChange}
            options={rolls.map((r) =>
              filter.type === "character"
                ? { label: r.character.title, value: r.character.id }
                : { label: r.user, value: r.user }
            )}
            size="sm"
            value={filter.value}
          />
        </div>
      </div>
      <ul className="max-h-full overflow-auto p-2">
        {(filter.type && filter.value
          ? rolls.filter((roll) => filter.value?.includes(filter.type === "character" ? roll.character.id : roll.user))
          : rolls
        ).map((roll) => (
          <li key={roll.id} className="flex flex-col justify-center border-b border-zinc-700 p-2 first:border-t">
            <div className="flex items-center gap-x-2">
              <Avatar image_id={roll.character.image} size="xs" />
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

const shortcutKeys = ["1", "2", "3", "4"];
export function GameView() {
  const { game_id } = useParams();
  const [drawer, setDrawer] = useState<GameDrawerType>(null);
  function handleShortcut(e: KeyboardEvent) {
    if (e.ctrlKey && shortcutKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();

      const numberKey = Number(e.key);
      if (typeof numberKey === "number") {
        if (drawer && drawer === sections?.[numberKey - 1]?.id) setDrawer(null);
        else setDrawer(sections?.[numberKey - 1]?.id);
      }
    }
  }

  const { data, isLoading } = useGetEntity<GameType>(game_id, "games", { fields: [] });

  useEffect(() => {
    document.addEventListener("keydown", handleShortcut);
    return () => {
      document.removeEventListener("keydown", handleShortcut);
    };
  }, [drawer]);

  if (isLoading) return <Spinner />;
  return (
    <div className="flex h-full w-full flex-col text-white">
      <div
        className={`${drawer ? "" : "translate-x-96"} absolute right-0 ml-auto h-full w-96 max-w-96 bg-zinc-800 transition-all`}>
        {drawer === "roll_history" ? <RollHistory /> : null}
        {drawer === "characters" ? <CharacterTab players={data?.data?.game_players || []} /> : null}
      </div>
      <div
        className={`mt-auto flex items-center gap-x-2 ${drawer ? "w-[calc(100%-24rem)]" : "w-full"} px-4 pt-4 transition-width`}>
        <nav className="self-end transition-all">
          <ul className="flex flex-row gap-x-2">
            {sections.map((section) => (
              <li
                key={section.id}
                className={"flex cursor-pointer items-center justify-center rounded-t-md shadow transition-all"}>
                <div
                  className={`relative h-14 transition-all [&>button>svg]:mb-4 [&>button]:rounded-b-none ${drawer === section.id ? "bottom-0" : "top-4"}`}>
                  <Button
                    allowedPlacements={["top"]}
                    icon={section.icon}
                    iconSize={32}
                    isIconOnly
                    onClick={() => {
                      if (drawer && drawer === section.id) setDrawer(null);
                      else if (section.id) setDrawer(section.id);
                    }}
                    tooltip={section.tooltip}
                    variant={drawer === section.id ? "info" : "secondary"}
                  />
                </div>
              </li>
            ))}
          </ul>
        </nav>
        <div className="relative top-1 flex-1">
          <DiceRollInput />
        </div>
      </div>
    </div>
  );
}
