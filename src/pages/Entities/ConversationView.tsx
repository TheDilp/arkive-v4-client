import { UseMutateAsyncFunction, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";
import { isRemirrorJSON, RemirrorJSON } from "remirror";

import { Alert, Avatar, Button, Editor, Icon, Search, Select, Skeleton, StaticRender } from "../../../components";
import { useDeleteSubEntity, useGetEntity, useGetInfiniteEntities } from "../../../hooks";
import { ConversationType, MessageKindType, MessageType, WebsocketEventType } from "../../../types";
import {
  AvailableIcons,
  drawerAtom,
  getAvatarInitials,
  getImageURL,
  IconEnum,
  messageEditorHooks,
  MessageTypeOptions,
} from "../../../utils";

type DeleteMessageType = UseMutateAsyncFunction<
  any,
  unknown,
  {
    data: {
      id: string;
      parent_id: string;
    };
  },
  {
    old: ConversationType | any | undefined;
  }
>;

function getCharacterSide(
  item_id: string | undefined,
  selectedCharacter: string | undefined,
  character_id: string | undefined
): boolean {
  if (character_id) {
    if (selectedCharacter) return character_id === selectedCharacter;
    return item_id === character_id;
  }
  return false;
}

function NarrationMessage({
  id,
  content,
  parent_id,
  handleEditMessageDrawer,
  deleteMessage,
}: Pick<MessageType, "id" | "content"> & {
  parent_id: string | undefined;
  handleEditMessageDrawer: (message_id: string) => void;
  deleteMessage: DeleteMessageType;
}) {
  return (
    <div className="group relative flex flex-col text-center text-xl italic text-zinc-300 [&>.staticRendererContainer]:inline [&>.staticRendererContainer]:p-0 [&>.staticRendererContainer]:py-2">
      <div className="absolute right-4 z-20 flex h-min w-min flex-nowrap gap-x-1">
        <div className="w-0 transition-all group-hover:w-4">
          <Button
            hasNoBackground
            icon={IconEnum.close}
            isIconOnly
            onClick={async () => {
              if (parent_id) await deleteMessage({ data: { id, parent_id } });
            }}
          />
        </div>
        <div className="w-0 transition-all group-hover:w-4">
          <Button hasNoBackground icon={IconEnum.edit} isIconOnly onClick={() => handleEditMessageDrawer(id)} />
        </div>
      </div>
      <hr className="relative top-1/2 z-0" />
      <div className="z-10 max-w-[90%] self-center whitespace-normal bg-zinc-950">
        {isRemirrorJSON(content) ? <StaticRender content={content} /> : null}
      </div>
    </div>
  );
}

function PlaceMessage({
  id,
  content,
  project_id,
  parent_id,
  handleEditMessageDrawer,
  deleteMessage,
}: {
  id: string;
  project_id: string;
  parent_id: string | undefined;
  content: { title?: string; image_id?: string; icon?: AvailableIcons };
  handleEditMessageDrawer: (message_id: string) => void;
  deleteMessage: DeleteMessageType;
}) {
  return (
    <div className="relative my-2 h-fit w-full">
      <div className="group relative flex w-full justify-center">
        <div className="flex w-full flex-col items-center">
          <div className="absolute right-4 flex flex-nowrap">
            <div className="w-0 transition-all group-hover:w-4">
              <Button
                hasNoBackground
                icon={IconEnum.close}
                isIconOnly
                onClick={async () => {
                  if (parent_id) await deleteMessage({ data: { id, parent_id } });
                }}
              />
            </div>
            <div className="w-0 transition-all group-hover:w-4">
              <Button hasNoBackground icon={IconEnum.edit} isIconOnly onClick={() => handleEditMessageDrawer(id)} />
            </div>
          </div>
          <h5 className="text-bold font-merriweather text-lg">{content?.title}</h5>
          <div className="relative flex w-full justify-center">
            <hr className="absolute top-1/2 z-0 w-full" />

            {content?.image_id ? (
              <Avatar image={getImageURL(project_id, "map_images", content?.image_id)} initials="AB" size="2xl" />
            ) : null}
            {content?.icon ? (
              <div className="z-10 h-16 w-16 rounded-full border bg-zinc-700 p-1">
                <Icon fontSize={56} icon={content?.icon} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConversationView({ id }: { id: string }) {
  const { project_id, item_id } = useParams();
  const queryClient = useQueryClient();
  const setDrawer = useSetAtom(drawerAtom);
  const [selectedType, setSelectedType] = useState<MessageKindType>("character");
  const [selectedCharacter, setSelectedCharacter] = useState<string | undefined>(item_id ?? undefined);
  const [message, setMessage] = useState<RemirrorJSON | undefined>(undefined);
  const [messageLength, setMessageLength] = useState(0);
  const [flatMessages, setFlatMessages] = useState<MessageType[]>([]);

  const { data: existingConversation, isLoading } = useGetEntity<ConversationType>(id, "conversations", {
    data: {
      id,
    },
    fields: ["id", "title"],
    relations: {
      characters: true,
      messages: true,
    },
  });
  const {
    data: messages,
    // isFetching: isFetchingMessages,
    fetchNextPage,
  } = useGetInfiniteEntities<MessageType>(
    {
      data: {
        conversation_id: id,
        project_id,
      },
      fields: ["id", "content", "parent_id", "sender_id", "type"],
      pagination: {
        limit: 20,
      },
      orderBy: [
        {
          field: "created_at",
          sort: "desc",
        },
      ],
    },
    "messages",
    {
      enabled: !!existingConversation?.data?.id,
      keepPreviousData: true,
      queryKeyOverwrite: ["messages", id],

      getNextPageParam: (_, allPages) => {
        if (allPages[allPages.length - 1]?.data?.length < 10) return undefined;
        return allPages.length;
      },
    }
  );
  const { mutateAsync: deleteMessage } = useDeleteSubEntity("messages", project_id as string);

  const [connect, setConnection] = useState(true);

  const { sendJsonMessage } = useWebSocket(
    `ws://localhost:5174/ws/conversation/${id}`,
    {
      onMessage: (e) => {
        try {
          const parsedData: { event_type: WebsocketEventType; message: string } = JSON.parse(e.data);
          if (parsedData.event_type === "NEW_MESSAGE") {
            const parsedMessage = JSON.parse(parsedData.message);

            if (parsedMessage) {
              try {
                const hasMessage = (flatMessages || []).at(-1)?.id === parsedMessage.id;
                if (hasMessage) return;
                setFlatMessages((prev) => [parsedMessage, ...prev]);
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
    connect
  );

  function handleEditMessageDrawer(message_id: string) {
    setDrawer((prev) => ({
      ...prev,
      title: "Edit message",
      data: { id: message_id, setFlatMessages },
      type: "edit_message",
      size: "lg",
    }));
  }

  useEffect(() => {
    if (!id) setConnection(false);
  }, [id]);

  useLayoutEffect(() => {
    if (messages?.pages?.length) {
      const flattenedMessages = messages?.pages?.flatMap((page) => page?.data || []);
      if (flattenedMessages.length) setFlatMessages(flattenedMessages);
    }
  }, [messages?.pages?.length]);

  useEffect(() => {
    if (selectedType !== "character") {
      setSelectedCharacter(undefined);
    }
  }, [selectedType]);

  if (isLoading) return <Skeleton type="conversations" />;
  return (
    <div className="relative flex h-full max-h-full flex-col justify-between">
      <div className="flex flex-1 flex-col gap-y-2 overflow-auto">
        <div className="h-10">
          <Button
            label="Load more"
            onClick={async () => {
              await fetchNextPage();
            }}
            variant="info-bordered"
          />
        </div>
        <div className="flex flex-col-reverse gap-y-2">
          {flatMessages?.length ? (
            flatMessages.map((m) => {
              if (m.type === "narration")
                return (
                  <NarrationMessage
                    content={m?.content}
                    deleteMessage={deleteMessage}
                    handleEditMessageDrawer={handleEditMessageDrawer}
                    id={m?.id}
                    key={m?.id}
                    parent_id={existingConversation?.data?.id}
                  />
                );
              const char = existingConversation?.data?.characters?.find((c) => c?.id === m?.sender_id);
              if (m.type === "place")
                return (
                  <PlaceMessage
                    content={m?.content as any}
                    deleteMessage={deleteMessage}
                    handleEditMessageDrawer={handleEditMessageDrawer}
                    id={m.id}
                    parent_id={existingConversation?.data?.id}
                    project_id={project_id as string}
                  />
                );
              return (
                <div className="flex flex-nowrap" key={m?.id}>
                  <div
                    className={`group flex max-w-[100%] flex-nowrap lg:max-w-[50%] ${
                      getCharacterSide(item_id, selectedCharacter, char?.id)
                        ? "ml-auto max-w-fit flex-row-reverse text-left tracking-tight"
                        : ""
                    } w-fit`}>
                    {char ? (
                      <div className="flex flex-col items-end gap-x-1 self-end px-1">
                        <Avatar
                          image={getImageURL(project_id as string, "images", char?.portrait_id)}
                          initials={getAvatarInitials(char?.full_name || "") || ""}
                          label={char?.full_name || ""}
                          size="2xs"
                          tooltipAllowedPlacements={["left", "right"]}
                        />
                      </div>
                    ) : null}
                    <div className="flex max-h-fit w-max max-w-fit flex-col rounded-md bg-zinc-800 p-2 shadow [&>.staticRendererContainer>*]:w-fit [&>.staticRendererContainer]:p-0 [&>.staticRendererContainer]:text-sm">
                      <StaticRender content={m?.content} />
                    </div>
                    {getCharacterSide(item_id, selectedCharacter, char?.id) ? (
                      <div className="left-0 flex flex-nowrap gap-x-1">
                        <div className="w-0 transition-all group-hover:w-4">
                          <Button
                            hasNoBackground
                            icon={IconEnum.close}
                            isIconOnly
                            onClick={async () => {
                              if (existingConversation?.data?.id)
                                await deleteMessage({ data: { id: m.id, parent_id: existingConversation?.data?.id } });
                              const idx = flatMessages?.findIndex((flatMsg) => flatMsg.id === m.id);
                              if (idx > -1) {
                                setFlatMessages((prev) => prev.toSpliced(idx, 1));
                              }
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
          <div className={`transition-all ${selectedType === "character" ? "w-52" : "hidden"}`}>
            <Select
              label="As"
              name="selectedCharacter"
              onChange={({ value }) => setSelectedCharacter(value as string)}
              options={(existingConversation?.data?.characters || []).map((char) => ({
                image: {
                  link: getImageURL(project_id as string, "images", char.portrait_id),
                  shape: "circle",
                },
                label: char?.full_name || "",
                value: char.id,
              }))}
              value={selectedCharacter}
              variant={selectedType === "character" && !selectedCharacter ? "error" : "primary"}
            />
          </div>
        </div>
        {selectedType === "place" ? (
          <Search
            allowedPlacements={["top"]}
            imageType="map_images"
            name="place"
            onChange={({ value, label, image, parent_id, icon }) => {
              const content = {
                id: value,
                title: label,
                image_id: image,
                icon,
                parent_id,
              } as any;
              const messageData = {
                id: crypto.randomUUID(),
                parent_id: id,
                content,
                type: selectedType,
                sender_id: selectedCharacter,
              };
              queryClient.setQueryData<{ data: ConversationType }>(["conversations", id], (old) => {
                if (old)
                  return {
                    ...old,
                    data: {
                      ...old?.data,
                      messages: [...(old?.data?.messages || []), messageData],
                    },
                  };
                return old;
              });
              sendJsonMessage({
                data: messageData,
                project_id,
                conversation: {
                  id: existingConversation?.data?.id,
                  title: existingConversation?.data?.title,
                },
              });
            }}
            searchEntity="places"
          />
        ) : (
          <div className="flex flex-nowrap gap-x-2 [&>.editor-component]:max-h-56 [&>.editor-component]:self-end [&>.editor-component]:overflow-y-auto">
            <Editor
              customPlaceholder={
                selectedType === "character" && !selectedCharacter ? "Please select a character first." : undefined
              }
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
                setMessageLength
              )}
              initialContent={message}
              isDisabled={selectedType === "character" && !selectedCharacter}
              menubarSize="sm"
              name="message"
              onChange={({ value }) => setMessage(value)}
              onChangePlainText={({ value }) => {
                setMessageLength(value?.length || 0);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
