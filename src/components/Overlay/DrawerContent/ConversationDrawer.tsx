import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { CharacterType, ConversationType } from "../../../types";
import { drawerAtom, IconEnum, useNotifications } from "../../../utils";
import {
  InsertConversationSchema,
  InsertConversationType,
  UpdateConversationSchema,
  UpdateConversationType,
} from "../../../validation/conversations";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search } from "../../Form";
import { Skeleton } from "../../Misc";

type ConversationCharacterType = Pick<CharacterType, "id" | "full_name" | "portrait_id">;
type Props = {
  data: {
    conversation_id?: string;
    character?: Pick<CharacterType, "id" | "full_name" | "portrait_id">;
  };
};

function isSaveDisabled(conversation: Partial<ConversationType>, characters: ConversationCharacterType[]): boolean {
  if (!conversation.title) return true;
  if (characters.length < 1) return true;
  return false;
}

export function ConversationDrawer({ data }: Props) {
  const { project_id } = useParams();
  const resetDrawer = useResetAtom(drawerAtom);
  const createNotification = useNotifications();
  const [conversation, setConversation] = useState<Partial<ConversationType>>({ project_id });

  const { changedData, handleChange } = useHandleChange({ data: conversation, setData: setConversation });
  const { mutateAsync: createConversation, isLoading: isCreating } = useCreateEntity<InsertConversationType>("conversations");
  const { mutateAsync: updateConversation, isLoading: isUpdating } = useUpdateEntity<UpdateConversationType>(
    "conversations",
    project_id as string,
  );
  const { data: existingConversation, isFetching } = useGetEntity<ConversationType>(
    data?.conversation_id,
    "conversations",
    {
      data: {
        id: data?.conversation_id,
      },
      fields: ["id", "title", "project_id"],
      relations: {
        characters: true,
      },
    },
    {
      enabled: !!data?.conversation_id,
    },
  );
  async function handleSave() {
    if (conversation?.id) {
      const conversationToUpdate = { ...(changedData || {}), id: conversation.id };

      const allCharacters = [data.character, ...(conversation?.characters || [])];
      const parsedData = UpdateConversationSchema.parse({
        data: conversationToUpdate,
        relations: {
          characters: allCharacters,
        },
      });
      await updateConversation(parsedData);
    } else {
      const conversationToUpdate = { ...(changedData || {}), id: conversation.id, project_id };
      const allCharacters = [data.character, ...(conversation?.characters || [])];

      const parsedData = InsertConversationSchema.parse({
        data: conversationToUpdate,
        relations: {
          characters: allCharacters,
        },
      });
      await createConversation(parsedData);
    }
    resetDrawer();
  }

  useLayoutEffect(() => {
    if (existingConversation?.data && !conversation?.title) {
      setConversation(existingConversation?.data);
    }
  }, [existingConversation?.data]);

  if (!data?.character?.full_name) {
    resetDrawer();
    return null;
  }

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex flex-col gap-y-2">
      <Input
        isDisabled={isCreating || isUpdating}
        label="Title (required)"
        name="title"
        onChange={handleChange}
        value={conversation.title || ""}
      />
      <Search
        isDisabled={isCreating || isUpdating}
        label="Members"
        name="characters"
        onChange={({ label, image, value }) => {
          if (data?.character?.id === value) {
            createNotification({
              title: "Cannot add same character more than once.",
              timer: 3,
              variant: "warning",
              icon: IconEnum.warning,
            });
            return;
          }
          if ((conversation?.characters || [])?.some((c) => c.id === value)) {
            createNotification({
              title: "Cannot add same character more than once.",
              timer: 3,
              variant: "warning",
              icon: IconEnum.warning,
            });
            return;
          }
          if (!label) return;
          setConversation((prev) => ({
            ...prev,
            characters: (prev.characters || [])?.concat([{ id: value, full_name: label, portrait_id: image }]),
          }));
        }}
        placeholder="Press enter to search and add a character."
        searchEntity="characters"
      />
      {data?.conversation_id ? null : (
        <EntityPreview
          id={data.character.id}
          image_id={data.character.portrait_id}
          title={data.character.full_name}
          type="characters"
        />
      )}
      {(conversation?.characters || [])?.map((char) => (
        <EntityPreview
          key={char.id}
          clearAction={(id) =>
            setConversation((prev) => ({ ...prev, characters: prev?.characters?.filter((c) => c.id !== id) }))
          }
          id={char.id}
          image_id={char?.portrait_id}
          title={char?.full_name || ""}
          type="characters"
        />
      ))}
      <Button
        icon={IconEnum.conversation}
        isDisabled={isCreating || isUpdating || isSaveDisabled(conversation, conversation?.characters || [])}
        isLoading={isCreating || isUpdating}
        label={`${data?.conversation_id ? "Update" : "Start"} conversation`}
        onClick={handleSave}
        variant="success"
      />
    </div>
  );
}
