import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { capitalize } from "remirror";

import { DnD5eAbilities, DnD5eSkills, DnD5ESystemDataType, HandleChangePropsType, TabType } from "../../../types";
import {
  DnD5ESkillsEnum,
  getDnD5EAbilityModifier,
  getDnD5EAbilityTitleFromCode,
  getDnD5ECharacterLevelData,
  getSpellSlots,
  IconEnum,
  sortEntitiesByName,
} from "../../../utils";
import { Button, Checkbox, Input, Textarea, Title } from "../../Form";
import { Collapsible, Tabs } from "../../Layout";
import { Alert } from "../../Misc";

function DnD5ESkill({
  title,
  handleChange,
  abilityScore,
  code,
}: {
  title: string;
  handleChange: (props: HandleChangePropsType) => void;
  abilityScore: number | null | undefined;
  code: DnD5eSkills;
}) {
  return (
    <Input
      isReadOnly
      label={title}
      min={0}
      name={`game_data.skills.${code}.value`}
      onChange={handleChange}
      size="lg"
      type="number"
      value={getDnD5EAbilityModifier(abilityScore as number)}
    />
  );
}
function ProgressBar({
  progress = 0,
  startAmount,
  currentAmount,
  endAmount,
}: {
  startAmount?: string;
  currentAmount?: string;
  endAmount?: string;
  progress: number;
}) {
  return (
    <div className="flex flex-col gap-y-0">
      <div className="relative flex h-4 w-full items-center">
        {startAmount ? <span className="absolute left-0 text-sm text-zinc-400">{startAmount}</span> : null}
        {endAmount ? <span className="absolute right-0 text-sm text-zinc-400">{endAmount}</span> : null}
      </div>
      <div className="relative flex h-4 w-full justify-center overflow-hidden rounded-full">
        {currentAmount ? <span className="absolute -top-0.5 z-50 text-sm">{currentAmount}</span> : null}
        <div className="relative z-10 mr-auto flex h-4 bg-blue-600" style={{ width: `${progress * 100}%` }} />
        <div className="absolute left-0 top-0 z-0 h-full w-full bg-zinc-700" />
      </div>
    </div>
  );
}
const spellSlotTabs: TabType[] = [
  { id: "cantrips", label: "Cantrips" },
  { id: "first", label: "1st level" },
  { id: "second", label: "2nd level" },
  { id: "third", label: "3rd level" },
  { id: "fourth", label: "4th level" },
  { id: "fifth", label: "5th level" },
  { id: "sixth", label: "6th level" },
  { id: "seventh", label: "7th level" },
  { id: "eight", label: "8th level" },
  { id: "ninth", label: "9th level" },
];
const itemTabs: TabType[] = [
  {
    id: "weapon",
    label: "Weapons",
  },
  {
    id: "equipment",
    label: "Equipment",
  },
  {
    id: "consumable",
    label: "Consumables",
  },
  {
    id: "container",
    label: "Containers",
  },
  {
    id: "loot",
    label: "Loot",
  },
  {
    id: "tool",
    label: "Tools",
  },
];

function Spells({
  spellSlots,
  currentSlots,
  spells,
}: {
  spellSlots: number[];
  currentSlots: DnD5ESystemDataType["spells"];
  spells: DnD5ESystemDataType["items"];
}) {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <div className="flex flex-col gap-y-2 p-2">
      <Tabs hasArrowNav onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={spellSlotTabs} />

      <div className="flex items-center justify-between">
        <span>Spell slots:</span>

        <div className="flex items-center gap-x-2">
          {[
            ...Array(
              currentSlots[`spell${selectedTab + 1}` as keyof DnD5ESystemDataType["spells"]]?.override ||
                spellSlots.at(selectedTab)
            ).keys(),
          ].map((k, i) => (
            <Checkbox
              key={k}
              isReadOnly
              name=""
              onChange={() => {}}
              value={i < currentSlots[`spell${selectedTab + 1}` as keyof DnD5ESystemDataType["spells"]]?.value}
              variant="success"
            />
          ))}
        </div>
      </div>
      <div className="flex max-h-96 flex-col gap-y-1 overflow-y-auto">
        {spells
          .filter((spell) => spell.level === selectedTab)
          .map((spell) => (
            <div key={spell.name} className="flex justify-between rounded-md bg-zinc-800 px-2 py-1">
              <span className="flex items-center">{spell.name}</span>
              {spell.is_prepared ? (
                <div>
                  <Button
                    hasNoBackground
                    icon={spell.level === 0 ? IconEnum.check_double : IconEnum.check_circle}
                    isDisabled
                    onClick={undefined}
                    size="sm"
                    variant="success"
                  />
                </div>
              ) : null}
            </div>
          ))}
      </div>
    </div>
  );
}

function Items({ items }: { items: DnD5ESystemDataType["items"] }) {
  const [selectedTab, setSelectedTab] = useState(0);
  return (
    <div className="p-2">
      <Tabs onChange={(_, i) => setSelectedTab(i)} selectedTab={selectedTab} tabs={itemTabs} />
      <div className="flex max-h-96 flex-col gap-y-1 overflow-y-auto py-2">
        {items
          .filter((item) => item.type === itemTabs[selectedTab].id)
          .toSorted(sortEntitiesByName)
          .map((item, idx) => (
            <div
              key={item.name + idx}
              className="flex items-center justify-between rounded-md bg-zinc-800 px-2 py-1 text-center">
              <span>{item.name}</span>
              <span className="flex items-center gap-x-2">
                {item.equipped ? (
                  <Button hasNoBackground icon={IconEnum.check_circle} isIconOnly onClick={undefined} variant="success" />
                ) : null}
                <span>({item.quantity})</span>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

export function DnD5E({
  game_data,
  handleChange,
}: {
  game_data: DnD5ESystemDataType | undefined;
  handleChange: (props: HandleChangePropsType) => void;
}) {
  if (!game_data) return <Alert label="No game data available." variant="info-bordered" />;
  const levelData = getDnD5ECharacterLevelData(game_data.details.xp.value || 0);
  const spellSlots = getSpellSlots(
    game_data.items.find((item) => item.type === "class")?.name?.toLowerCase() || null,
    levelData.level
  );
  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between">
        <div className="text-right text-xl">Proficiency: +{levelData.proficiency_bonus}</div>
        <div className="text-right text-xl">Level: {levelData.level}</div>
      </div>
      <div className="w-full">
        <ProgressBar
          currentAmount={game_data.details.xp.value.toString()}
          endAmount={levelData?.next?.toString()}
          progress={(game_data.details.xp.value * (levelData?.next || game_data.details.xp.value)) / 100}
          startAmount={levelData?.previous?.toString()}
        />
      </div>
      <Collapsible label="Ability scores">
        <div className="grid grid-cols-1 gap-2 p-2 text-center md:grid-cols-3 lg:grid-cols-6 [&>div>div>input]:pl-4 [&>div>div>input]:text-center">
          <Input
            isReadOnly
            label="Strength"
            min={0}
            name="game_data.abilities.str.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.str?.value}
            variant={game_data?.abilities?.str?.proficient ? "success" : "primary"}
          />
          <Input
            isReadOnly
            label="Dexterity"
            min={0}
            name="game_data.abilities.dex.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.dex?.value}
            variant={game_data?.abilities?.dex?.proficient ? "success" : "primary"}
          />
          <Input
            isReadOnly
            label="Constitution"
            min={0}
            name="game_data.abilities.con.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.con?.value}
            variant={game_data?.abilities?.con?.proficient ? "success" : "primary"}
          />
          <Input
            isReadOnly
            label="Intelligence"
            min={0}
            name="game_data.abilities.int.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.int?.value}
            variant={game_data?.abilities?.int?.proficient ? "success" : "primary"}
          />
          <Input
            isReadOnly
            label="Wisdom"
            min={0}
            name="game_data.abilities.wis.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.wis?.value}
            variant={game_data?.abilities?.wis?.proficient ? "success" : "primary"}
          />
          <Input
            isReadOnly
            label="Charisma"
            min={0}
            name="game_data.abilities.cha.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.cha?.value}
            variant={game_data?.abilities?.cha?.proficient ? "success" : "primary"}
          />
        </div>
      </Collapsible>
      <Collapsible label="Class, Race & Background">
        <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2 lg:grid-cols-3 [&>div>div>input]:text-center">
          {game_data.items
            .filter(
              (item) => item.type === "class" || item.type === "race" || item.type === "subclass" || item.type === "background"
            )
            .map((item) => (
              <Input
                key={item.name}
                isReadOnly
                label={capitalize(item.type)}
                name={item.type}
                onChange={() => {}}
                value={item.name}
              />
            ))}
        </div>
      </Collapsible>
      <Collapsible label="Skills">
        <div className="grid grid-cols-1 gap-x-2 p-2 md:grid-cols-2 lg:grid-cols-5">
          {Object.entries(DnD5ESkillsEnum).map(([ability, skills]) => (
            <Fragment key={ability}>
              <div className="col-span-1 md:col-span-2 lg:col-span-5">
                <Title isDrawerTitle label={getDnD5EAbilityTitleFromCode(ability as DnD5eAbilities)} />
              </div>
              {skills.map((skill) => (
                <div key={skill.code} className="py-2 [&>div>div>input]:pl-4 [&>div>div>input]:text-center">
                  <DnD5ESkill
                    abilityScore={game_data?.abilities?.[skill.ability]?.value}
                    code={skill.code}
                    handleChange={handleChange}
                    title={skill.label}
                  />
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </Collapsible>
      <Collapsible label="Items">
        <Items
          items={game_data.items.filter(
            (item) =>
              item.type === "weapon" ||
              item.type === "equipment" ||
              item.type === "loot" ||
              item.type === "container" ||
              item.type === "consumable" ||
              item.type === "tool"
          )}
        />
      </Collapsible>
      <Collapsible label="Spells">
        <Spells
          currentSlots={game_data?.spells}
          spellSlots={spellSlots}
          spells={game_data.items
            .filter((item) => item.type === "spell")
            .toSorted((a, b) => {
              if (a.is_prepared && !b.is_prepared) return -1;
              if (!a.is_prepared && b.is_prepared) return 1;
              if (a.level && b.level) {
                if (a.level === b.level) {
                  if (a.name > b.name) return 1;
                  if (a.name < b.name) return -1;
                  return 0;
                }
                return a.level - b.level;
              }
              return 0;
            })}
        />
      </Collapsible>
      <Collapsible label="Coin">
        <div className="grid grid-cols-1 gap-2 p-2 text-center md:grid-cols-2 lg:grid-cols-3 [&>div>div>input]:pl-4 [&>div>div>input]:text-center">
          <Input
            isReadOnly
            label="Copper"
            min={0}
            name="game_data.currency.cp"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.currency?.cp}
          />
          <Input
            isReadOnly
            label="Silver"
            min={0}
            name="game_data.currency.sp"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.currency?.sp}
          />
          <Input
            label="Electrum"
            min={0}
            name="game_data.currency.ep"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.currency?.ep}
          />

          <div className="col-span-1 flex items-center gap-x-2 md:col-span-2 lg:col-span-3">
            <Input
              isReadOnly
              label="Gold"
              min={0}
              name="game_data.currency.gp"
              onChange={handleChange}
              size="lg"
              type="number"
              value={game_data?.currency?.gp}
            />
            <Input
              isReadOnly
              label="Platinum"
              min={0}
              name="game_data.currency.pp"
              onChange={handleChange}
              size="lg"
              type="number"
              value={game_data?.currency?.pp}
            />
          </div>
        </div>
      </Collapsible>
      <Collapsible label="Details">
        <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2">
          <div className="col-span-1 md:col-span-2">
            <Title isDrawerTitle label="Languages" size="lg" />
          </div>
          {game_data.details.languages.map((lang) => (
            <div className="col-span-1">
              <Input isReadOnly name="" onChange={() => {}} value={capitalize(lang)} variant="secondary" />
            </div>
          ))}
          {game_data.details.custom_languages.length ? (
            <>
              <div className="col-span-1 md:col-span-2">
                <Title isDrawerTitle label="Custom languages" size="lg" />
              </div>
              {game_data.details.custom_languages.split(";").map((lang) => (
                <div className="col-span-1">
                  <Input isReadOnly name="" onChange={() => {}} value={capitalize(lang)} variant="secondary" />
                </div>
              ))}
            </>
          ) : null}
          <div className="col-span-1 md:col-span-2">
            <Title isDrawerTitle label="Other" size="lg" />
          </div>
          <Textarea
            isReadOnly
            label="Trait"
            name="game_data.details.trait"
            onChange={() => {}}
            value={game_data.details.trait}
            variant="secondary"
          />
          <Textarea
            isReadOnly
            label="Ideal"
            name="game_data.details.ideal"
            onChange={() => {}}
            value={game_data.details.ideal}
            variant="secondary"
          />
          <Textarea isReadOnly label="Bond" name="game_data.details.bond" onChange={() => {}} value={game_data.details.bond} />
          <Textarea isReadOnly label="Flaw" name="game_data.details.flaw" onChange={() => {}} value={game_data.details.flaw} />
          <Textarea
            isReadOnly
            label="Alignment"
            name="game_data.details.alignment"
            onChange={() => {}}
            value={game_data.details.alignment}
            variant="secondary"
          />
          <Textarea
            isReadOnly
            label="Appearance"
            name="game_data.details.appearance"
            onChange={() => {}}
            value={game_data.details.appearance}
          />
          <Textarea
            isReadOnly
            label="Faith"
            name="game_data.details.faith"
            onChange={() => {}}
            value={game_data.details.faith}
            variant="secondary"
          />
        </div>
      </Collapsible>
      <Collapsible label="Appearance">
        <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2">
          <Textarea
            isReadOnly
            label="Eyes"
            name="game_data.details.eyes"
            onChange={() => {}}
            value={game_data.details.eyes}
            variant="secondary"
          />
          <Textarea
            isReadOnly
            label="Hair"
            name="game_data.details.hair"
            onChange={() => {}}
            value={game_data.details.hair}
            variant="secondary"
          />
          <Textarea
            isReadOnly
            label="Skin"
            name="game_data.details.skin"
            onChange={() => {}}
            value={game_data.details.skin}
            variant="secondary"
          />
          <Textarea
            isReadOnly
            label="Gender"
            name="game_data.details.gender"
            onChange={() => {}}
            value={game_data.details.gender}
            variant="secondary"
          />
          <Textarea
            isReadOnly
            label="Height"
            name="game_data.details.height"
            onChange={() => {}}
            value={game_data.details.height}
            variant="secondary"
          />
          <Textarea
            isReadOnly
            label="Weight"
            name="game_data.details.weight"
            onChange={() => {}}
            value={game_data.details.weight}
            variant="secondary"
          />
          <Textarea
            isReadOnly
            label="Alignment"
            name="game_data.details.alignment"
            onChange={() => {}}
            value={game_data.details.alignment}
            variant="secondary"
          />
          <Textarea
            isReadOnly
            label="Appearance"
            name="game_data.details.appearance"
            onChange={() => {}}
            value={game_data.details.appearance}
            variant="secondary"
          />
        </div>
      </Collapsible>
    </div>
  );
}
