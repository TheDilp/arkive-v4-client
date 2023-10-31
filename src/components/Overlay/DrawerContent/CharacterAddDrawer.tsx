import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useAddToEntity } from "../../../hooks";
import { drawerAtom, IconEnum, useNotifications } from "../../../utils";
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
  const createNotification = useNotifications();
  const [items, setItems] = useState<{ label: string; value: string; image?: string; color?: string }[]>([]);
  const resetDrawer = useResetAtom(drawerAtom);
  const { mutateAsync: addToCharacter, isLoading: isMutating } = useAddToEntity<AddToCharacterType>(
    "characters",
    project_id as string,
  );
  return (
    <div className="flex flex-col gap-y-2">
      <Search
        isMultiple
        name="items"
        onChange={async ({ label, value, image, color }) => {
          if (items.some((i) => i.value === value)) {
            createNotification({
              title: "Cannot add same image more than once.",
              variant: "warning",
              timer: 3,
              icon: IconEnum.warning,
            });
            return;
          }

          if (label && value) setItems((prev) => (prev || []).concat({ label, image, value, color }));
        }}
        placeholder={`Press enter to search and add ${data?.type}.`}
        searchEntity={data?.type}
        value={items.map((i) => i.value)}
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
            key={i.value}
            clearAction={(id) => setItems((prev) => (prev || []).filter((item) => item.value !== id))}
            icon={data?.type === "documents" ? IconEnum.document : IconEnum.image}
            id={i.value}
            image_id={data?.type === "images" ? i.value : i?.image}
            title={i.label}
            type={data?.type}
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
