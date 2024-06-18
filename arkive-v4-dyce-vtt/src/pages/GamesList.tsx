import { useAtomValue } from "jotai";

import { Button, ProjectGameCard } from "../../../components";
import { useGetEntities } from "../../../hooks";
import { GameType } from "../../../types";
import { IconEnum, userAtom } from "../../../utils";

export function GamesList() {
  const user = useAtomValue(userAtom);
  const { data } = useGetEntities<GameType>({ fields: [], data: { user_id: user?.auth_id } }, "games");

  return (
    <div className="p-4">
      <div className="ml-auto w-min">
        <Button icon={IconEnum.add} label="Create new game" onClick={undefined} />
      </div>
      <div className="grid h-full max-h-full flex-1 grid-cols-1 gap-4 overflow-auto xl:grid-cols-2 2xl:grid-cols-4">
        {(data?.data || [])?.map((game) => (
          <ProjectGameCard feature_flags={{}} id={game.id} key={game.id} module="dyce_vtt" title={game.title}></ProjectGameCard>
        ))}
      </div>
    </div>
  );
}
