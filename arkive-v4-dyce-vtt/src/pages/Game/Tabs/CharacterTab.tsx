import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Avatar, Button, Search, Tooltip } from "../../../../../components";
import { useGetEntities } from "../../../../../hooks";
import { GameCharacterType } from "../../../../../types";
import { dialogAtom, getAvatarInitials, IconEnum } from "../../../../../utils";
import { PermissionPicker } from "../../../components/PermissionPicker";
import { useAddCharacterToGame } from "../../../hooks";
import { useRemoveCharacterFromGame } from "../../../hooks/deleteGameHooks";

export function CharacterTab() {
  const { game_id } = useParams();
  const [importedCharacters, setImportedCharacters] = useState<GameCharacterType[]>([]);
  const [filter] = useState("");
  const setDialog = useSetAtom(dialogAtom);
  const { mutate: addCharacter } = useAddCharacterToGame();
  const { mutate: removeCharacter } = useRemoveCharacterFromGame();
  const { data: characters } = useGetEntities<GameCharacterType>(
    {
      fields: ["id", "full_name", "portrait_id"],
      relationFilters: {
        and: [{ id: "game", field: "game", header_name: "Game", value: game_id as string, operator: "eq" }],
      },
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
        <Search
          name="character"
          onChange={({ value }) => {
            addCharacter({ game_id: game_id as string, related_id: value });
          }}
          placeholder="Search (press enter to add character)"
          searchEntity="characters"
        />
      </div>
      <ul className="h-full max-h-full overflow-y-auto">
        {importedCharacters?.length
          ? importedCharacters?.map((char) => (
              <li
                key={char.id}
                className="flex items-center justify-between border-b border-zinc-600 bg-zinc-700 p-2 first:border-t">
                <div className="flex items-center gap-x-2">
                  <Avatar image_id={char.portrait_id} initials={getAvatarInitials(char.full_name)} size="sm" />
                  <span>{char.full_name}</span>
                </div>
                <div className="flex items-center gap-x-1">
                  <Tooltip
                    content={<PermissionPicker game_character_id={char.id} player_permissions={char.player_permissions} />}
                    isClickable
                    isIgnoringHover>
                    <div>
                      <Button icon={IconEnum.eye} onClick={undefined} tooltip="Change permissions" />
                    </div>
                  </Tooltip>
                  <Button icon={IconEnum.image} onClick={undefined} tooltip="Reveal image" />
                  <Button
                    hasNoBackground
                    icon={IconEnum.trash}
                    isIconOnly
                    onClick={() => {
                      setDialog((prev) => ({
                        ...prev,
                        position: "center",
                        title: `Are you sure you want to remove ${char.full_name} from the game?`,
                        description: "Their game data will be lost",
                        cancel: {
                          variant: "secondary",
                          action: () => {},
                        },
                        confirm: {
                          action: () => removeCharacter(char.id),
                          variant: "error",
                        },
                        isOverlay: true,
                      }));
                    }}
                    tooltip="Remove character"
                    variant="error"
                  />
                </div>
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}
