import { useAtomValue } from "jotai";
import { capitalize } from "remirror";

import { Button } from "../../../components";
import { GamePermissionType } from "../../../types";
import { gameAtom, GamePermissionsEnum } from "../../../utils";
import { useUpdateGameCharacterPermission } from "../hooks";

export function PermissionPicker({
  game_character_id,
  player_permissions,
}: {
  game_character_id: string;
  player_permissions: Record<string, GamePermissionType>;
}) {
  const { mutate } = useUpdateGameCharacterPermission();
  const game = useAtomValue(gameAtom);
  return (
    <ul className="max-h-96 overflow-y-auto rounded border border-zinc-700">
      {(game?.game_players || []).map((player) => (
        <li key={player.id} className="grid grid-cols-5 items-center gap-x-2 rounded-md bg-black p-4 shadow">
          <span>{player.nickname}:</span>
          {GamePermissionsEnum.map((perm) => (
            <Button
              key={perm}
              label={capitalize(perm)}
              onClick={() => {
                mutate({ data: { related_id: game_character_id, player_id: player?.id, permission: perm } });
              }}
              variant={
                player_permissions?.[player.id] === perm || (perm === "none" && !player_permissions?.[player.id])
                  ? "info"
                  : "secondary"
              }
            />
          ))}
        </li>
      ))}
    </ul>
  );
}
