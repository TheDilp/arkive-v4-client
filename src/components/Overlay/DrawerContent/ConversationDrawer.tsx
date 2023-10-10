import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity } from "../../../hooks";
import { getCharacterFullName, IconEnum } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Button, Search } from "../../Form";

type Props = {
  data: { id: string };
};

export function ConversationDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [characters, setCharacters] = useState<{ id: string; first_name: string; last_name?: string; image_id?: string }[]>([]);

  const { mutateAsync: createConversation } = useCreateEntity<{ data: { id: string; project_id: string } }>("conversations");

  function handleSave() {
    createConversation({ data: { id: data.id, project_id: project_id as string } });
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Search
        name="character"
        onChange={({ first_name, last_name, image, value }) => {
          if (characters.some((c) => c.id === value)) return;
          if (!first_name) return;
          setCharacters((prev) => prev.concat({ id: value, first_name, last_name, image_id: image }));
        }}
        searchEntity="characters"
      />
      {characters.map((char) => (
        <EntityPreview
          id={char.id}
          image_id={char.image_id}
          title={getCharacterFullName(char.first_name, undefined, char.last_name)}
          type="characters"
        />
      ))}
      <Button icon={IconEnum.conversation} label="Start conversation" onClick={handleSave} variant="success" />
    </div>
  );
}
