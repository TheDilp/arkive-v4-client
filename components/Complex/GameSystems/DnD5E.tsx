import { DnD5ESystemType, HandleChangePropsType } from "../../../types";
import { Input } from "../../Form";

export function DnD5E({
  game_data,
  handleChange,
}: {
  game_data: DnD5ESystemType;
  handleChange: (props: HandleChangePropsType) => void;
}) {
  return (
    <div className="flex flex-col gap-y-2">
      <div className="grid grid-cols-1 gap-2 text-center md:grid-cols-3 lg:grid-cols-6 [&>div>div>input]:pl-4 [&>div>div>input]:text-center">
        <Input
          label="Strength"
          name="game_data.abilities.str.value"
          onChange={handleChange}
          size="lg"
          type="number"
          value={game_data?.abilities?.str?.value}
        />
        <Input
          label="Dexterity"
          name="game_data.abilities.dex.value"
          onChange={handleChange}
          size="lg"
          type="number"
          value={game_data?.abilities?.dex?.value}
        />
        <Input
          label="Constitution"
          name="game_data.abilities.con.value"
          onChange={handleChange}
          size="lg"
          type="number"
          value={game_data?.abilities?.con?.value}
        />
        <Input
          label="Intelligence"
          name="game_data.abilities.int.value"
          onChange={handleChange}
          size="lg"
          type="number"
          value={game_data?.abilities?.int?.value}
        />
        <Input
          label="Wisdom"
          name="game_data.abilities.wis.value"
          onChange={handleChange}
          size="lg"
          type="number"
          value={game_data?.abilities?.wis?.value}
        />
        <Input
          label="Charisma"
          name="game_data.abilities.cha.value"
          onChange={handleChange}
          size="lg"
          type="number"
          value={game_data?.abilities?.cha?.value}
        />
      </div>
    </div>
  );
}
