import { useResetAtom } from "jotai/utils";
import { Dispatch, SetStateAction, useLayoutEffect, useState } from "react";
import { isRemirrorJSON, RemirrorJSON } from "remirror";

import { useGetSubEntity, useUpdateMessageSubEntity } from "../../../hooks";
import { MessagePlaceContentType, MessageType } from "../../../types";
import { drawerAtom, getCharacterFullName, IconEnum } from "../../../utils";
import { Editor } from "../../Complex";
import { EntityPreview } from "../../DataDisplay";
import { Button, Search } from "../../Form";
import { Skeleton } from "../../Misc";

type Props = {
  data: {
    id: string;
    setFlatMessages: Dispatch<SetStateAction<MessageType[]>>;
  };
};

export function EditMessageDrawer({ data }: Props) {
  const { data: existingMessage, isFetching } = useGetSubEntity<MessageType>(
    data?.id,
    "messages",
    {
      data: { id: data?.id },
      fields: ["id", "content", "parent_id", "type"],
      relations: {
        character: true,
      },
    },
    {
      enabled: !!data?.id,
    },
  );
  const resetDrawer = useResetAtom(drawerAtom);
  const [content, setContent] = useState<RemirrorJSON | MessagePlaceContentType>();

  const { mutateAsync: updateMessage, isLoading: isUpdating } = useUpdateMessageSubEntity<any>(
    existingMessage?.data?.parent_id as string,
  );

  async function handleSave() {
    if (content)
      await updateMessage(
        { data: { id: existingMessage?.data?.id, content, type: existingMessage?.data?.type } },
        {
          onSuccess: () => {
            if (existingMessage?.data?.type)
              data.setFlatMessages((prev) => {
                const idx = prev.findIndex((msg) => msg.id === data.id);
                if (idx > -1) {
                  const temp = [...prev];
                  if (
                    isRemirrorJSON(content) &&
                    (existingMessage?.data?.type === "character" || existingMessage?.data?.type === "narration")
                  ) {
                    temp[idx] = { ...temp[idx], content, type: existingMessage?.data?.type };
                  } else if (!isRemirrorJSON(content) && existingMessage?.data?.type === "place") {
                    temp[idx] = { ...temp[idx], content, type: existingMessage?.data?.type };
                  }
                  return temp;
                }
                return prev;
              });
            resetDrawer();
          },
        },
      );
  }
  function handleChange({ value }: { value: RemirrorJSON }) {
    setContent(value);
  }

  useLayoutEffect(() => {
    if (existingMessage?.data?.content && !content) {
      setContent(existingMessage?.data?.content);
    }
  }, [existingMessage]);

  if (isFetching) return <Skeleton type="drawer_form" />;
  return (
    <div className="flex flex-col gap-y-2">
      {existingMessage?.data?.character ? (
        <EntityPreview
          id={existingMessage?.data?.character?.id}
          image_id={existingMessage?.data?.character?.portrait_id}
          title={getCharacterFullName(
            existingMessage?.data?.character?.first_name,
            undefined,
            existingMessage?.data?.character?.last_name,
          )}
          type="characters"
        />
      ) : null}
      {existingMessage?.data?.type === "character" || existingMessage?.data?.type === "narration" ? (
        <Editor initialContent={existingMessage?.data?.content ?? undefined} name="message" onChange={handleChange} />
      ) : null}

      {existingMessage?.data?.type === "place" && content && !isRemirrorJSON(content) ? (
        <>
          <Search
            imageType="map_images"
            isAutocomplete
            name="place"
            onChange={({ value, label, image, parent_id, icon }) => {
              setContent({
                id: value,
                title: label,
                image_id: image,
                icon,
                parent_id,
              } as any);
            }}
            searchEntity="places"
          />
          <EntityPreview
            icon={content?.icon}
            id={content?.id}
            image_id={content?.image_id}
            title={content?.title}
            type={content?.parent_id ? "map_pins" : "maps"}
          />
        </>
      ) : null}
      <div>
        <Button
          icon={IconEnum.save}
          isDisabled={isUpdating}
          isLoading={isUpdating}
          label="Update"
          onClick={handleSave}
          variant="success"
        />
      </div>
    </div>
  );
}
