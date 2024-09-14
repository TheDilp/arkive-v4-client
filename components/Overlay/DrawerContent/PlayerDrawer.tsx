import { useLayoutEffect, useState } from "react";

import { useAddPlayer, useGetSubEntity, useHandleChange, useToggledResetAtom, useUpdatePlayer } from "../../../hooks";
import { GamePlayerType } from "../../../types";
import { IconEnum } from "../../../utils";
import { InsertPlayerSchema, InsertPlayerType, UpdatePlayerSchema } from "../../../validation";
import { Button, Input } from "../../Form";
import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    id?: string;
    game_id: string;
  };
};

export function PlayerDrawer({ data }: Props) {
  const [player, setPlayer] = useState<Partial<InsertPlayerType["data"]>>({ game_id: data.game_id });

  const { data: existingPlayer } = useGetSubEntity<GamePlayerType>(
    data?.id,
    "players",
    { data: { id: data?.id }, fields: [] },
    { enabled: !!data?.id }
  );

  useLayoutEffect(() => {
    if (existingPlayer?.data) {
      setPlayer(existingPlayer?.data);
    }
  }, [existingPlayer?.data]);

  const { handleChange } = useHandleChange({ data: player, setData: setPlayer });
  const { mutate: addPlayer } = useAddPlayer();
  const { mutate: updatePlayer } = useUpdatePlayer(data?.id);
  const resetDrawer = useToggledResetAtom();
  return (
    <DrawerLayout>
      <Input
        label="Nickname (required, must be unique in game)"
        name="nickname"
        onChange={handleChange}
        value={player?.nickname || ""}
        variant={!player?.nickname ? "error" : "primary"}
      />
      {data?.id ? null : (
        <Input
          label="Password (required)"
          name="password"
          onChange={handleChange}
          type="password"
          value={player?.password || ""}
          variant={!player?.password ? "error" : "primary"}
        />
      )}

      <Button
        icon={data?.id ? IconEnum.edit : IconEnum.add}
        isDisabled={!player.nickname || (!data?.id && !player.password)}
        label={data?.id ? "Update player" : "Add player"}
        onClick={() => {
          if (data?.id) {
            const parsed = UpdatePlayerSchema.parse({ data: player });
            updatePlayer(parsed, { onSuccess: resetDrawer });
          } else {
            const parsed = InsertPlayerSchema.parse({ data: player });

            addPlayer(parsed, { onSuccess: resetDrawer });
          }
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
