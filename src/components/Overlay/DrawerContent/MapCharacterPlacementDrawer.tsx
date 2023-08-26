import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntities, useUpdateEntity } from "../../../hooks";
import { CharacterType, MapPinType } from "../../../types";
import { drawerAtom, getCharacterFullName, IconEnum, useNotifications } from "../../../utils";
import { UpdateMapSchema, UpdateMapType } from "../../../validation/maps/maps";
import { CharacterPreview } from "../../DataDisplay";
import { Button, Search } from "../../Form";
import { Alert, Skeleton } from "../../Misc";

type CharacterListType = Pick<CharacterType, "id" | "first_name" | "last_name" | "portrait_id">;
function isSaveDisabled(characters: CharacterListType[]) {
  if (!characters?.length) return true;
  return false;
}
export function MapCharacterPlacementDrawer({ data }: { data: { map_id: string; lat: number; lng: number } }) {
  const { project_id } = useParams();
  const createNotification = useNotifications();
  const resetDrawer = useResetAtom(drawerAtom);
  const { data: pinsWithCharacters, isFetching } = useGetEntities<MapPinType>(
    {
      data: {
        project_id,
      },
      fields: ["id"],
      filters: {
        and: [
          {
            field: "parent_id",
            value: data.map_id,
            operator: "eq",
          },
        ],
      },
      relations: {
        characters: true,
      },
    },
    "map_pins",
    { queryKeyConcat: ["add_characters_to_map"] },
  );
  const existingCharacters = (pinsWithCharacters?.data || [])?.flatMap((pin) => pin.characters);
  const existingIds = existingCharacters.map((char) => char.id);
  const { mutateAsync: updateMap, isLoading: isMutating } = useUpdateEntity<UpdateMapType>("maps", project_id as string);

  const [characters, setCharacters] = useState<CharacterListType[]>([]);

  const currentIds = characters.map((char) => char.id);
  const charactersToAdd = currentIds.filter((cId) => !existingIds?.includes(cId));

  useLayoutEffect(() => {
    if (existingCharacters?.length) setCharacters(existingCharacters);
  }, [existingCharacters]);

  if (isFetching) return <Skeleton type="drawer_form" />;
  return (
    <div className="flex flex-col gap-y-2">
      <Search
        name="characters"
        onChange={({ label, value, image }) => {
          if ((characters || [])?.some((char) => char.id === value)) {
            createNotification({
              title: "Cannot add the same character twice.",
              variant: "warning",
              icon: IconEnum.info_circle,
              timer: 3,
            });
            return;
          }
          const names = label?.split(" ");
          if (names && names?.[0])
            setCharacters(
              (characters || []).concat({
                id: value,
                first_name: names?.[0],
                last_name: names?.[1] || null,
                portrait_id: image,
              }),
            );
        }}
        placeholder="Press enter to search characters"
        searchEntity="characters"
      />

      {characters?.length ? (
        <div className="flex flex-col gap-y-2">
          <h3 className="border-b border-zinc-700 font-lato">Currently on map</h3>
          <div className="flex flex-col gap-y-2">
            {characters
              .filter((c) => existingIds?.includes(c.id))
              .map((char) => (
                <CharacterPreview
                  key={char.id}
                  character_name={getCharacterFullName(char.first_name, undefined, char?.last_name)}
                  clearAction={(id) => setCharacters((prev) => (prev || []).filter((c) => c.id !== id))}
                  id={char.id}
                  image_id={char.portrait_id}
                />
              ))}
          </div>

          {charactersToAdd.length ? (
            <>
              <h3 className="border-b border-zinc-700 font-lato">Adding to map</h3>
              <div className="flex flex-col gap-y-2">
                {characters
                  .filter((c) => charactersToAdd.includes(c.id))
                  .map((char) => (
                    <CharacterPreview
                      key={char.id}
                      character_name={getCharacterFullName(char.first_name, undefined, char?.last_name)}
                      clearAction={(id) => setCharacters((prev) => (prev || []).filter((c) => c.id !== id))}
                      id={char.id}
                      image_id={char.portrait_id}
                    />
                  ))}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <Alert label="There are no characters on this map." variant="info" />
      )}
      <Button
        icon={IconEnum.save}
        isDisabled={isSaveDisabled(characters) || isFetching || isMutating}
        isLoading={isMutating}
        label="Save"
        onClick={async () => {
          const parsed = UpdateMapSchema.parse({
            data: { id: data.map_id },
            relations: { characters: characters.map((char) => ({ id: char.id })) },
          });
          await updateMap(parsed, {
            onSuccess: (d) => {
              if (d?.ok) {
                resetDrawer();
              }
            },
          });
        }}
        variant="success"
      />
    </div>
  );
}
