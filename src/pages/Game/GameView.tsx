import { Icon, Tooltip } from "../../components";
import { IconEnum } from "../../utils";
import { DiceRollInput } from "./DiceRollInput";

const sections = [
  { tooltip: "Chat", icon: IconEnum.conversation },

  { tooltip: "Characters", icon: IconEnum.character },

  { tooltip: "Journal", icon: IconEnum.info_circle },

  { tooltip: "Music", icon: IconEnum.music },
];

export function GameView() {
  return (
    <div className="flex h-full w-full flex-col text-white">
      <nav className="absolute right-0">
        <ul className="flex flex-col gap-y-4">
          {sections.map((section) => (
            <li key={section.tooltip} className="rounded-l-md bg-zinc-700 p-1 shadow">
              <Tooltip content={section.tooltip}>
                <div>
                  <Icon fontSize={32} icon={section.icon} />
                </div>
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <DiceRollInput />
      </div>
    </div>
  );
}
