import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { RemirrorJSON } from "remirror";

import { Alert, Avatar, Button, Editor, Select, StaticRender } from "../../components";
import { useGetEntity } from "../../hooks";
import { ConversationType, MessageKindType, MessageType } from "../../types";
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
  const [selectedCharacter, setSelectedCharacter] = useState<string | undefined>(undefined);
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

  const queryClient = useQueryClient();

  const [connect, setConnection] = useState(true);

  const { sendJsonMessage } = useWebSocket(
    `ws://localhost:5174/ws/conversation/${id}`,
    {
      onMessage: (e) => {
        try {
          const parsedData: { event_type: string; message: string } = JSON.parse(e.data);
          const parsedMessage: Omit<MessageType, "content"> & { content: string } = JSON.parse(parsedData.message);
          if (parsedMessage) {
            try {
              const parsedContent: RemirrorJSON = JSON.parse(parsedMessage.content);
              queryClient.setQueryData<{ data: ConversationType }>(["conversations", id], (old) => {
                if (old)
                  return {
                    ...old,
                    data: {
                      ...old?.data,
                      messages: [{ ...parsedMessage, content: parsedContent }, ...(old?.data?.messages || [])],
                    },
                  };
                return old;
              });
            } catch (error) {
              // console.error("ERROR PARSING MESSAGE CONTENT.");
            }
          }
        } catch (error) {
          // console.error("ERROR PARSING MESSAGE.");
        }
      },
    },
    connect,
  );
  useEffect(() => {
    if (!id) setConnection(false);
  }, [id]);
  return (
    <div className="flex h-[calc(100vh-20rem)] max-h-[calc(100vh-20rem)] flex-col justify-between lg:h-[calc(100vh-20rem)] lg:max-h-[calc(100vh-20rem)]">
      <div className="flex max-h-[96%] flex-col gap-y-2 overflow-y-auto">
        <div className="flex flex-col gap-y-2 overflow-y-auto">
          {existingConversation?.data?.messages?.length ? (
            existingConversation?.data?.messages.toReversed().map((m) => {
              if (m.type === "narration")
                return (
                  <div
                    className="flex flex-col text-center text-xl
                  italic text-zinc-300 [&>.staticRendererContainer]:inline
                [&>.staticRendererContainer]:p-0
                [&>.staticRendererContainer]:py-2
                [&_span:has(svg)]:hidden ">
                    <hr className="relative top-1/2 z-0" />
                    <div className="z-10 max-w-[90%] self-center whitespace-normal bg-zinc-950">
                      <StaticRender content={m?.content} />
                    </div>
                  </div>
                );
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
      </div>
      <div className="flex flex-col gap-y-2 pt-2 lg:h-[4%] lg:max-h-[4%]">
        <div className="flex w-full flex-nowrap justify-end gap-x-2 ">
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
        <div className="flex flex-nowrap gap-x-2 [&>.editor-component]:overflow-visible">
          <Editor
            hooks={messageEditorHooks(id, selectedCharacter, selectedType, sendJsonMessage)}
            initialContent={message}
            isMenubarDisabled
            name="message"
            onChange={({ value }) => setMessage(value)}
            onChangePlainText={({ value }) => {
              setMessageLength(value?.length || 0);
            }}
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
    </div>
  );
}
