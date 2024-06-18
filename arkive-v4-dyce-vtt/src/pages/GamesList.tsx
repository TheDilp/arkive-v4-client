import { useAtomValue } from "jotai";

import { ProjectGameCard } from "../../../components";
import { useGetEntities } from "../../../hooks";
import { GameType } from "../../../types";
import { userAtom } from "../../../utils";

export function GamesList() {
  const user = useAtomValue(userAtom);
  const { data } = useGetEntities<GameType>({ fields: [], data: { user_id: "00fb25f1-2f47-40e3-bcaf-35d303c10207" } }, "games");

  console.log(user);

  return (
    <div className="p-4">
      <div className="grid h-full max-h-full flex-1 grid-cols-1 gap-4 overflow-auto xl:grid-cols-2 2xl:grid-cols-4">
        {(data?.data || [])?.map((game) => (
          <ProjectGameCard feature_flags={{}} id={game.id} key={game.id} module="dyce_vtt" title={game.title}></ProjectGameCard>
        ))}
      </div>
    </div>
  );
}
