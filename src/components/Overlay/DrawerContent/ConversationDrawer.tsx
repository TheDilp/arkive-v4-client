import { useResetAtom } from "jotai/utils";
import set from "lodash.set";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useHandleChange } from "../../../hooks";
import { drawerAtom, getCharacterFullName, IconEnum } from "../../../utils";
import { InsertConversationType } from "../../../validation/conversations";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search } from "../../Form";

type BaseCharacterInfoType = { id: string; first_name: string; last_name?: string | null; image_id?: string | null };

type Props = {
  data: {
    conversation_id?: string;
    character?: BaseCharacterInfoType;
  };
};

function isSaveDisabled(conversation: InsertConversationType, characters: BaseCharacterInfoType[]): boolean {
  if (!conversation.data.title) return true;
  if (characters.length === 0) return true;
  return false;
}

export function ConversationDrawer({ data }: Props) {
  const { project_id } = useParams();
  const resetDrawer = useResetAtom(drawerAtom);
  const [conversation, setConversation] = useState<InsertConversationType>({
    data: { title: "", project_id: project_id as string },
    relations: { characters: [] },
  });
  const [characters, setCharacters] = useState<BaseCharacterInfoType[]>([]);

  const { handleChange } = useHandleChange({ data: conversation, setData: setConversation });
  const { mutateAsync: createConversation, isLoading: isCreating } = useCreateEntity<InsertConversationType>("conversations");

  async function handleSave() {
    const dataToSend = { ...conversation };
    set(dataToSend, "relations.characters", [{ id: data?.character?.id }].concat(characters.map((char) => ({ id: char.id }))));
    await createConversation(conversation);

    resetDrawer();
  }

  if (!data?.character?.first_name) {
    resetDrawer();
    return null;
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Input
        isDisabled={isCreating}
        label="Title (required)"
        name="data.title"
        onChange={handleChange}
        value={conversation.data.title || ""}
      />
      <Search
        isDisabled={isCreating}
        label="Members"
        name="characters"
        onChange={({ first_name, last_name, image, value }) => {
          if (characters.some((c) => c.id === value)) return;
          if (!first_name) return;
          setCharacters((prev) => prev.concat({ id: value, first_name, last_name, image_id: image }));
        }}
        placeholder="Press enter to search and add a character."
        searchEntity="characters"
      />
      {data?.conversation_id ? null : (
        <EntityPreview
          id={data.character.id}
          image_id={data.character.image_id}
          title={getCharacterFullName(data.character.first_name, undefined, data.character.last_name)}
          type="characters"
        />
      )}
      {characters.map((char) => (
        <EntityPreview
          id={char.id}
          image_id={char.image_id}
          title={getCharacterFullName(char.first_name, undefined, char.last_name)}
          type="characters"
        />
      ))}
      <Button
        icon={IconEnum.conversation}
        isDisabled={isCreating || isSaveDisabled(conversation, characters)}
        isLoading={isCreating}
        label="Start conversation"
        onClick={handleSave}
        variant="success"
      />
    </div>
  );
}
