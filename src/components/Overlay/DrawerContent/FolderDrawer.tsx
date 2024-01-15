import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useUpdateEntity } from "../../../hooks";
import { AvailableEntityType, TagType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { Button, Input } from "../../Form";

type Props = {
  data: {
    id?: string;
    type: AvailableEntityType;
  };
};
type ExistingFolderType = {
  id?: string;
  project_id: string;
  parent_id: string | undefined;
  is_folder: boolean;
  title: string;
  tags?: TagType[];
};

export function FolderDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const [folder, setFolder] = useState<ExistingFolderType>({
    title: "",
    project_id: project_id as string,
    is_folder: true,
    parent_id: item_id,
    tags: [],
  });

  const { mutateAsync: createFolder, isLoading: isCreating } = useCreateEntity(data.type);
  const { mutateAsync: updateFolder, isLoading: isUpdating } = useUpdateEntity<{
    data: { id: string; title: string };
    relations?: { tags: { id: string }[] };
  }>(data.type, project_id as string);
  const { data: existingFolder } = useGetEntity<ExistingFolderType>(
    data?.id,
    data.type,
    {
      data: {},
      fields: ["id", "is_folder", "title"],
      relations: data.type === "random_tables" ? {} : { tags: true },
    },
    {
      enabled: !!data?.id,
    },
  );

  useLayoutEffect(() => {
    if (existingFolder?.data) {
      setFolder(existingFolder?.data);
    }
  }, [existingFolder]);

  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { changedData, handleChange } = useHandleChange({ data: folder, setData: setFolder });

  async function handleSave() {
    if (changedData) {
      if (data?.id) {
        await updateFolder(
          data.type === "random_tables"
            ? { data: { id: data.id, title: folder.title } }
            : {
                data: { id: data.id, title: folder.title },
                relations: { tags: folder.tags || [] },
              },
          {
            onSuccess: resetDrawerAtom,
          },
        );
      } else {
        const { tags, ...rest } = folder;
        await createFolder(data.type === "random_tables" ? { data: rest } : { data: rest, relations: { tags } }, {
          onSuccess: resetDrawerAtom,
        });
      }
    }
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Input
        label="Title (required)"
        name="title"
        onChange={handleChange}
        onKeyDown={async (e) => {
          if (e.key === "Enter") await handleSave();
        }}
        value={folder.title}
      />
      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        isDisabled={!folder.title || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label={data?.id ? "Update" : "Create"}
        onClick={handleSave}
        variant="success"
      />
    </div>
  );
}
