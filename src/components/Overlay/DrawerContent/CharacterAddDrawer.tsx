import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { useAddToEntity, useCreateEntity, useDeleteEntity, useHandleChange } from "../../../hooks";
import { DocumentType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { AddToCharacterSchema, AddToCharacterType } from "../../../validation";
import { Editor } from "../../Complex";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search, Title } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Badge } from "../../Misc";

type Props = {
  data: {
    id: string;
    type: "documents" | "images" | "tags";
  };
};

export function CharacterAddDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [items, setItems] = useState<{ label: string; value: string; image?: string; color?: string }[]>([]);
  const [newDocument, setNewDocument] = useState<Partial<DocumentType>>({ title: "" });
  const { handleChange } = useHandleChange({ data: newDocument, setData: setNewDocument });
  const resetDrawer = useResetAtom(drawerAtom);
  const { mutateAsync: addToCharacter, isLoading: isMutating } = useAddToEntity<AddToCharacterType>(
    data.id,
    "characters",
    project_id as string,
  );
  const { mutateAsync: createDocument, isLoading: isCreating } = useCreateEntity<{
    data: Pick<DocumentType, "id" | "title" | "project_id" | "content">;
  }>("documents");
  const { mutate: deleteDocument } = useDeleteEntity("documents", project_id as string, false);
  return (
    <DrawerLayout>
      <Search
        isMultiple
        name="items"
        onChange={async ({ label, value, image, color }) => {
          if (items.some((i) => i.value === value)) {
            setItems((prev) => prev.filter((i) => i.value !== value));
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
      {data?.type === "documents" ? (
        <div className="relative flex flex-col gap-y-2">
          <Title isDrawerTitle label="Or create a new document" />
          <Input isDisabled={!!items.length} label="Title" name="title" onChange={handleChange} value={newDocument.title} />
          <Editor initialContent={undefined} isDisabled={!!items.length} name="content" onChange={handleChange} />
        </div>
      ) : null}
      <Button
        icon={IconEnum.add}
        isDisabled={isMutating || (items.length === 0 && !newDocument.title)}
        isLoading={isMutating || isCreating}
        label="Save"
        onClick={async () => {
          if (items.length) {
            const payload = { relations: { [data.type]: items.map((i) => ({ id: i.value })) } };
            const parsedPayload = AddToCharacterSchema.parse(payload);
            await addToCharacter(parsedPayload, {
              onSuccess: resetDrawer,
            });
            return;
          }
          if (newDocument.title) {
            const id = crypto.randomUUID();
            await createDocument({
              data: {
                id,
                title: newDocument.title,
                content: newDocument.content as RemirrorJSON,
                project_id: project_id as string,
              },
            });
            await addToCharacter(
              { relations: { documents: [{ id }] } },
              {
                onSuccess: resetDrawer,
                onError: () => {
                  deleteDocument({ data: { id } });
                  resetDrawer();
                },
              },
            );
          }
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
