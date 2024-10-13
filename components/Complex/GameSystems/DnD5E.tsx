import { Fragment } from "react/jsx-runtime";

import { DnD5eAbilities, DnD5eSkills, DnD5ESystemType, HandleChangePropsType } from "../../../types";
import { DnD5ESkillsEnum, getDnD5EAbilityModifier, getDnD5EAbilityTitleFromCode } from "../../../utils";
import { Input, Title } from "../../Form";
import { Collapsible } from "../../Layout";

function DnD5ESkill({
  title,
  handleChange,
  value,
  abilityScore,
  code,
}: {
  title: string;
  handleChange: (props: HandleChangePropsType) => void;
  value: number | null | undefined;
  abilityScore: number | null | undefined;
  code: DnD5eSkills;
}) {
  return (
    <Input
      isDisabled
      label={title}
      min={0}
      name={`game_data.skills.${code}.value`}
      onChange={handleChange}
      size="lg"
      type="number"
      value={value || typeof abilityScore === "number" ? getDnD5EAbilityModifier(abilityScore as number) : 0}
    />
  );
}

export function DnD5E({
  game_data,
  handleChange,
}: {
  game_data: DnD5ESystemType;
  handleChange: (props: HandleChangePropsType) => void;
}) {
  return (
    <div className="flex flex-col gap-y-2">
      <Collapsible label="Ability scores">
        <div className="grid grid-cols-1 gap-2 p-2 text-center md:grid-cols-3 lg:grid-cols-6 [&>div>div>input]:pl-4 [&>div>div>input]:text-center">
          <Input
            label="Strength"
            min={0}
            name="game_data.abilities.str.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.str?.value}
          />
          <Input
            label="Dexterity"
            min={0}
            name="game_data.abilities.dex.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.dex?.value}
          />
          <Input
            label="Constitution"
            min={0}
            name="game_data.abilities.con.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.con?.value}
          />
          <Input
            label="Intelligence"
            min={0}
            name="game_data.abilities.int.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.int?.value}
          />
          <Input
            label="Wisdom"
            min={0}
            name="game_data.abilities.wis.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.wis?.value}
          />
          <Input
            label="Charisma"
            min={0}
            name="game_data.abilities.cha.value"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.abilities?.cha?.value}
          />
        </div>
      </Collapsible>
      <Collapsible label="Skills">
        <div className="grid grid-cols-1 gap-x-2 p-2 text-center md:grid-cols-2 lg:grid-cols-5 [&>div>div>input]:pl-4 [&>div>div>input]:text-center">
          {Object.entries(DnD5ESkillsEnum).map(([ability, skills]) => (
            <Fragment key={ability}>
              <div className="col-span-1 md:col-span-2 lg:col-span-5">
                <Title isDrawerTitle label={getDnD5EAbilityTitleFromCode(ability as DnD5eAbilities)} />
              </div>
              {skills.map((skill) => (
                <DnD5ESkill
                  key={skill.code}
                  abilityScore={game_data?.abilities?.[skill.ability]?.value}
                  code={skill.code}
                  handleChange={handleChange}
                  title={skill.label}
                  value={game_data?.skills?.[skill.code]?.value}
                />
              ))}
            </Fragment>
          ))}
        </div>
      </Collapsible>
      <Collapsible label="Coin">
        <div className="grid grid-cols-1 gap-2 p-2 text-center md:grid-cols-2 lg:grid-cols-3 [&>div>div>input]:pl-4 [&>div>div>input]:text-center">
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Input
              label="Gold"
              min={0}
              name="game_data.currency.gp"
              onChange={handleChange}
              size="lg"
              type="number"
              value={game_data?.currency?.gp}
            />
          </div>
          <Input
            label="Copper"
            min={0}
            name="game_data.currency.cp"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.currency?.cp}
          />
          <Input
            label="Silver"
            min={0}
            name="game_data.currency.sp"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.currency?.sp}
          />
          {/* <Input
            label="Electrum"
            min={0}
            name="game_data.currency.ep"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.currency?.ep}
          /> */}

          <Input
            label="Platinum"
            min={0}
            name="game_data.currency.pp"
            onChange={handleChange}
            size="lg"
            type="number"
            value={game_data?.currency?.pp}
          />
        </div>
      </Collapsible>
    </div>
  );
}
