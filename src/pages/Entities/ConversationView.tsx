import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { RemirrorJSON } from "remirror";

import { Alert, Avatar, Button, Editor, Select, StaticRender } from "../../components";
import { useDeleteSubEntity, useGetEntity } from "../../hooks";
import { ConversationType, MessageKindType, MessageType, WebsocketEventType } from "../../types";
import {
  drawerAtom,
  getAvatarInitials,
  getCharacterFullName,
  getImageURL,
  IconEnum,
  messageEditorHooks,
  MessageTypeOptions,
} from "../../utils";

export function ConversationView({ id }: { id: string }) {
  const { project_id, item_id } = useParams();
  const queryClient = useQueryClient();
  const messageContainerRef = useRef() as MutableRefObject<HTMLDivElement>;
  const setDrawer = useSetAtom(drawerAtom);
  const [selectedType, setSelectedType] = useState<MessageKindType>("character");
  const [selectedCharacter, setSelectedCharacter] = useState<string | undefined>(item_id ?? undefined);
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
  const { mutateAsync: deleteMessage } = useDeleteSubEntity("messages", project_id as string);

  const [connect, setConnection] = useState(true);

  const { sendJsonMessage } = useWebSocket(
    `ws://localhost:5174/ws/conversation/${id}`,
    {
      onMessage: (e) => {
        try {
          const parsedData: { event_type: WebsocketEventType; message: string } = JSON.parse(e.data);
          if (parsedData.event_type === "NEW_MESSAGE") {
            const parsedMessage: Omit<MessageType, "content"> & { content: string } = JSON.parse(parsedData.message);

            if (parsedMessage) {
              try {
                const parsedContent: RemirrorJSON = JSON.parse(parsedMessage.content);
                const existingMessages = queryClient.getQueryData<{ data: ConversationType }>(["conversations", id]);
                const hasMessage = (existingMessages?.data?.messages || []).at(-1)?.id === parsedMessage.id;
                if (hasMessage) return;
                queryClient.setQueryData<{ data: ConversationType }>(["conversations", id], (old) => {
                  if (old)
                    return {
                      ...old,
                      data: {
                        ...old?.data,
                        messages: [...(old?.data?.messages || []), { ...parsedMessage, content: parsedContent }],
                      },
                    };
                  return old;
                });
                messageContainerRef.current.scrollIntoView({ behavior: "smooth" });
              } catch (error) {
                // console.error("ERROR PARSING MESSAGE CONTENT.");
              }
            }
          }
        } catch (error) {
          // console.error("ERROR PARSING MESSAGE.");
        }
      },
    },
    connect,
  );

  function handleEditMessageDrawer(message_id: string) {
    setDrawer((prev) => ({ ...prev, title: "Edit message", data: { id: message_id }, type: "edit_message", size: "lg" }));
  }

  useEffect(() => {
    if (!id) setConnection(false);
  }, [id]);

  useLayoutEffect(() => {
    if (existingConversation?.data?.messages?.length) messageContainerRef.current.scrollIntoView();
  }, [existingConversation?.data?.messages]);

  return (
    <div className="flex h-[calc(100vh-20rem)] max-h-[calc(100vh-20rem)] flex-col justify-between lg:h-[calc(100vh-15rem)] lg:max-h-[calc(100vh-15rem)]">
      <div className="flex h-max flex-col gap-y-2 overflow-y-auto">
        <div className="flex flex-col gap-y-2 overflow-y-auto">
          {existingConversation?.data?.messages?.length ? (
            existingConversation?.data?.messages?.map((m) => {
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
                  <div
                    className={`group flex flex-nowrap ${
                      char?.id === selectedCharacter ? "ml-auto flex-row-reverse" : ""
                    } w-fit`}>
                    {char ? (
                      <div className=" flex flex-col items-end gap-x-1 self-end px-1">
                        <Avatar
                          image={getImageURL(project_id as string, "images", char?.portrait_id)}
                          initials={getAvatarInitials(char?.first_name || "", char?.last_name || "") || ""}
                          label={getCharacterFullName(char.first_name, undefined, char?.last_name)}
                          size="xxs"
                          tooltipAllowedPlacements={["left", "right"]}
                        />
                      </div>
                    ) : null}
                    <div className="flex max-h-fit flex-col rounded-md bg-zinc-800 p-2 shadow [&>.staticRendererContainer]:p-0 [&>.staticRendererContainer]:text-sm">
                      <StaticRender content={m?.content} />
                    </div>
                    {selectedCharacter === char?.id ? (
                      <div className="left-0 flex flex-nowrap gap-x-1">
                        <div className="w-0 transition-all group-hover:w-4">
                          <Button
                            hasNoBackground
                            icon={IconEnum.close}
                            isIconOnly
                            onClick={async () => {
                              await deleteMessage({ data: { id: m.id, parent_id: existingConversation?.data?.id } });
                            }}
                          />
                        </div>
                        <div className="w-0 transition-all group-hover:w-4">
                          <Button
                            hasNoBackground
                            icon={IconEnum.edit}
                            isIconOnly
                            onClick={() => handleEditMessageDrawer(m.id)}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <Alert label="This is the start of this conversation." />
          )}
          <div ref={messageContainerRef} className="h-0 w-0" />
        </div>
      </div>
      <div className="flex min-h-fit flex-col gap-y-2 pt-2">
        <div className="flex w-full flex-nowrap justify-end gap-x-2">
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
        <div
          className="flex flex-nowrap gap-x-2 [&>.editor-component]:max-h-56 [&>.editor-component]:self-end
        [&>.editor-component]:overflow-y-auto
        ">
          <Editor
            hooks={messageEditorHooks(
              id,
              selectedCharacter,
              selectedType,
              sendJsonMessage,
              {
                id: existingConversation?.data?.id,
                title: existingConversation?.data?.title,
              },
              messageLength > 0,
              setMessageLength,
            )}
            initialContent={message}
            menubarSize="sm"
            name="message"
            onChange={({ value }) => setMessage(value)}
            onChangePlainText={({ value }) => {
              setMessageLength(value?.length || 0);
            }}
          />
        </div>
      </div>
    </div>
  );
}
