import { useState } from "react";
import { useParams } from "react-router-dom";

import { useUpdateEntity } from "../../../hooks";
import { IconEnum } from "../../../utils";
import { UpdateCharacterType } from "../../../validation";
import { ItemPreview } from "../../DataDisplay";
import { Button, Search } from "../../Form";

type Props = {
  data: {
    id: string;
    type: "documents" | "images";
  };
};

export function CharacterAddDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const { mutateAsync: updateCharacter } = useUpdateEntity<UpdateCharacterType>("characters", project_id as string);
  return (
    <div className="flex flex-col gap-y-2">
      <Search
        name="items"
        onChange={async ({ label, value }) => {
          if (label && value) setItems((prev) => (prev || []).concat({ label, value }));
        }}
        placeholder={`Press enter to search and add ${data?.type}.`}
        searchEntity={data?.type}
      />
      {items.map((i) => (
        <ItemPreview
          clearAction={(id) => setItems((prev) => (prev || []).filter((item) => item.value !== id))}
          icon={data?.type === "documents" ? IconEnum.document : IconEnum.image}
          id={i.value}
          title={i.label}
        />
      ))}
      <Button
        icon={IconEnum.add}
        label="Save"
        onClick={async () => {
          await updateCharacter({ data, relations: { [data.type]: items.map((i) => ({ id: i.value })) } });
        }}
        variant="success"
      />
    </div>
  );
}
