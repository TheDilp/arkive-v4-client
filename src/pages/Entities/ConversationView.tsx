import { useState } from "react";
import { useParams } from "react-router-dom";
import { RemirrorJSON } from "remirror";

import { Alert, Avatar, Button, Editor, Select, StaticRender } from "../../components";
import { useGetEntity } from "../../hooks";
import { ConversationType, MessageKindType } from "../../types";
import {
  getAvatarInitials,
  getCharacterFullName,
  getImageURL,
  IconEnum,
  messageEditorHooks,
  MessageTypeOptions,
} from "../../utils";

export function ConversationView({ id }: { id: string }) {
  const { project_id } = useParams();
  const [selectedType, setSelectedType] = useState<MessageKindType>("character");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [message, setMessage] = useState<RemirrorJSON | undefined>(undefined);
  const [messageLength, setMessageLength] = useState(0);
  const { data: existingConversation } = useGetEntity<ConversationType>(id, "conversations", {
    data: {
      id,
    },
    relations: {
      characters: true,
      messages: true,
    },
  });
  return (
    <div className="flex h-full w-full flex-col justify-between gap-y-2 overflow-hidden">
      <div className="flex flex-1 flex-col gap-y-2 overflow-y-auto">
        {existingConversation?.data?.messages?.length ? (
          existingConversation?.data?.messages.map((m) => {
            const char = existingConversation?.data?.characters?.find((c) => c?.id === m?.sender_id);
            return (
              <div key={m?.id} className="flex flex-nowrap">
                {char ? (
                  <div className="flex items-start gap-x-1 px-1">
                    <Avatar
                      hasShowImage
                      image={getImageURL(project_id as string, "images", char?.portrait_id)}
                      initials={getAvatarInitials(char?.first_name || "", char?.last_name || "") || ""}
                      isTooltipDisabled
                      size="sm"
                    />
                  </div>
                ) : null}
                <div className="flex flex-col [&>.staticRendererContainer]:p-0 [&>.staticRendererContainer]:text-sm">
                  {char ? <span className="font-bold">{char?.first_name}:</span> : null}
                  <StaticRender content={m?.content} />
                </div>
              </div>
            );
          })
        ) : (
          <Alert label="This is the start of this conversation." />
        )}
      </div>
      <div className="flex flex-nowrap justify-end gap-x-2">
        <div className="w-32">
          <Select
            label="Message type"
            name="messageType"
            onChange={({ value }) => setSelectedType(value as MessageKindType)}
            options={MessageTypeOptions}
            value={selectedType}
          />
        </div>
        <div className={`transition-all ${selectedType === "character" ? "w-52" : "w-0 opacity-0"}`}>
          <Select
            label="As"
            name="selectedCharacter"
            onChange={({ value }) => setSelectedCharacter(value as string)}
            options={(existingConversation?.data?.characters || []).map((char) => ({
              image: {
                link: getImageURL(project_id as string, "images", char.portrait_id),
                shape: "circle",
              },
              label: getCharacterFullName(char.first_name, undefined, char.last_name),
              value: char.id,
            }))}
            value={selectedCharacter}
          />
        </div>
      </div>

      <div className="flex flex-nowrap gap-x-2">
        <Editor
          hooks={messageEditorHooks(id, selectedCharacter)}
          initialContent={message}
          isMenubarDisabled
          name="message"
          onChange={({ value }) => setMessage(value)}
          onChangePlainText={({ value }) => setMessageLength(value?.length || 0)}
        />

        <div className="mt-auto">
          <Button
            icon={IconEnum.send}
            isDisabled={messageLength === 0 || (selectedType === "character" && !selectedCharacter)}
            label="Send"
            onClick={undefined}
            variant="info"
          />
        </div>
      </div>
    </div>
  );
}
