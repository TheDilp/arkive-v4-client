import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { RemirrorJSON } from "remirror";

import { useGetSubEntity, useUpdateMessageSubentity } from "../../../hooks";
import { MessageType } from "../../../types";
import { drawerAtom, getCharacterFullName, IconEnum } from "../../../utils";
import { Editor } from "../../Complex";
import { EntityPreview } from "../../DataDisplay";
import { Button } from "../../Form";
import { Skeleton } from "../../Misc";

type Props = {
  data: {
    id: string;
  };
};

export function EditMessageDrawer({ data }: Props) {
  const { data: existingMessage, isFetching } = useGetSubEntity<MessageType>(
    data?.id,
    "messages",
    {
      data: { id: data?.id },
      relations: {
        character: true,
      },
    },
    {
      enabled: !!data?.id,
    },
  );
  const resetDrawer = useResetAtom(drawerAtom);
  const [content, setContent] = useState<RemirrorJSON | null>();

  const { mutateAsync: updateMessage, isLoading: isUpdating } = useUpdateMessageSubentity<any>(
    existingMessage?.data?.parent_id as string,
  );

  async function handleSave() {
    if (content)
      await updateMessage(
        { data: { id: existingMessage?.data?.id, content } },
        {
          onSuccess: resetDrawer,
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
      <Editor initialContent={existingMessage?.data?.content ?? undefined} name="message" onChange={handleChange} />
      <Button
        icon={IconEnum.save}
        isDisabled={isUpdating}
        isLoading={isUpdating}
        label="Update"
        onClick={handleSave}
        variant="success"
      />
    </div>
  );
}
