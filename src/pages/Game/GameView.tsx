import { useEffect, useState } from "react";

import { Avatar, Button, Input, Select, Tooltip } from "../../components";
import { useGetEntities, useHandleChange } from "../../hooks";
import { CharacterType } from "../../types";
import { AvailableIcons, getAvatarInitials, getImageURL, IconEnum } from "../../utils";
import { DiceRollInput } from "./DiceRollInput";

const sections: { tooltip: string; id: "roll_history" | "characters" | "journal" | "music"; icon: AvailableIcons }[] = [
  { id: "roll_history", tooltip: "Roll history", icon: IconEnum.random_table },

  { id: "characters", tooltip: "Characters", icon: IconEnum.character },

  { id: "journal", tooltip: "Journal", icon: IconEnum.info_circle },

  { id: "music", tooltip: "Music", icon: IconEnum.music },
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
          options={rolls.map((r) =>
            filter.type === "character" ? { label: r.character.title, value: r.character.id } : { label: r.user, value: r.user }
          )}
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

function Characters() {
  const [importedCharacters, setImportedCharacters] = useState<CharacterType[]>([]);
  const [filter, setFilter] = useState("");
  const { data: characters } = useGetEntities<CharacterType>(
    {
      data: { project_id: "43e1c879-415b-4394-95ad-f9a4c42a43c5" },
      fields: ["id", "project_id", "full_name", "portrait_id"],
    },
    "characters"
  );

  useEffect(() => {
    if (characters?.data) setImportedCharacters(characters?.data || []);
  }, [characters]);

  useEffect(() => {
    if (filter) {
      const timeout = setTimeout(() => {
        setImportedCharacters((prev) => prev.filter((char) => char.full_name.toLowerCase().includes(filter.toLowerCase())));
      }, 300);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      setImportedCharacters(characters?.data || []);
    }
  }, [filter]);

  return (
    <div>
      <div className="flex flex-col gap-y-1 p-2">
        <h2 className="">Characters</h2>
        {/* <Search placeholder="Import characters" /> */}
        <Input name="filter" onChange={({ value }) => setFilter(value as string)} placeholder="Search" value={filter} />
      </div>
      <ul className="h-full max-h-full overflow-y-auto">
        {importedCharacters?.length
          ? importedCharacters?.map((char) => (
              <li className="flex items-center gap-x-2 border-b border-zinc-600 bg-zinc-700 p-2 first:border-t" key={char.id}>
                <Avatar
                  image={getImageURL(char.project_id, "images", char.portrait_id)}
                  initials={getAvatarInitials(char.full_name)}
                  size="sm"
                />
                <span>{char.full_name}</span>
                <div>
                  <Button icon={IconEnum.image} onClick={undefined} tooltip="Reveal image" />
                </div>
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}

export function GameView() {
  const [drawer, setDrawer] = useState<GameDrawerType>(null);

  return (
    <div className="flex h-full w-full flex-col text-white">
      <nav className={`absolute top-4 transition-all ${drawer ? "right-96" : "right-0"}`}>
        <ul className="flex flex-col gap-y-4">
          {sections.map((section) => (
            <li
              className={`flex cursor-pointer items-center justify-center rounded-l-md p-1 shadow transition-colors ${drawer === section.id.toLowerCase() ? "bg-blue-500" : "bg-zinc-800"}`}
              key={section.id}>
              <Tooltip content={section.tooltip}>
                <div>
                  <Button
                    hasNoBackground
                    icon={section.icon}
                    iconSize={32}
                    isIconOnly
                    onClick={() => {
                      if (drawer && drawer === section.id.toLowerCase()) setDrawer(null);
                      else setDrawer(section.id.toLowerCase() as GameDrawerType);
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
        {drawer === "characters" ? <Characters /> : null}
      </div>
      <div className="mt-auto p-4">
        <DiceRollInput />
      </div>
    </div>
  );
}
