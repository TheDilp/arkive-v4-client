import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useAddToEntity } from "../../../hooks";
import { drawerAtom, IconEnum } from "../../../utils";
import { AddToCharacterSchema, AddToCharacterType } from "../../../validation";
import { EntityPreview } from "../../DataDisplay";
import { Button, Search } from "../../Form";
import { Badge } from "../../Misc";

type Props = {
  data: {
    id: string;
    type: "documents" | "images" | "tags";
  };
};

export function CharacterAddDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [items, setItems] = useState<{ label: string; value: string; color?: string }[]>([]);
  const resetDrawer = useResetAtom(drawerAtom);
  const { mutateAsync: addToCharacter, isLoading: isMutating } = useAddToEntity<AddToCharacterType>(
    "characters",
    project_id as string,
  );
  return (
    <div className="flex flex-col gap-y-2">
      <Search
        name="items"
        onChange={async ({ label, value, color }) => {
          if (label && value) setItems((prev) => (prev || []).concat({ label, value, color }));
        }}
        placeholder={`Press enter to search and add ${data?.type}.`}
        searchEntity={data?.type}
      />
      {data?.type === "tags" ? (
        <div className="flex flex-wrap">
          {items.map((i) => (
            <div key={i.value} className="w-fit">
              <Badge customColor={i?.color} label={i.label} />
            </div>
          ))}
        </div>
      ) : (
        items.map((i) => (
          <EntityPreview
            clearAction={(id) => setItems((prev) => (prev || []).filter((item) => item.value !== id))}
            icon={data?.type === "documents" ? IconEnum.document : IconEnum.image}
            id={i.value}
            title={i.label}
          />
        ))
      )}
      <Button
        icon={IconEnum.add}
        isDisabled={isMutating || items.length === 0}
        isLoading={isMutating}
        label="Save"
        onClick={async () => {
          const payload = { data, relations: { [data.type]: items.map((i) => ({ id: i.value })) } };
          const parsedPayload = AddToCharacterSchema.parse(payload);
          await addToCharacter(parsedPayload, {
            onSuccess: resetDrawer,
          });
        }}
        variant="success"
      />
    </div>
  );
}
