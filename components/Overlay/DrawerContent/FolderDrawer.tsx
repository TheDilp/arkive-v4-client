import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateEntity,
  useGetEntity,
  useHandleChange,
  useHasPermissions,
  useToggledResetAtom,
  useUpdateEntity,
} from "../../../hooks";
import { EntitiesWithFolders, EntityPermissionType, TagType } from "../../../types";
import { IconEnum, useNotifications } from "../../../utils";
import { FolderSelect } from "../../Complex";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button, Input } from "../../Form";
import { Skeleton } from "../../Misc";

type Props = {
  data: {
    id?: string;
    type: EntitiesWithFolders;
  };
};
type ExistingFolderType = {
  id?: string;
  owner_id: string;
  project_id: string;
  parent_id: string | undefined;
  is_folder: boolean;
  title: string;
  tags?: Omit<TagType, "owner_id" | "permissions">[];
  permissions: EntityPermissionType[];
};

export function FolderDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const [folder, setFolder] = useState<ExistingFolderType>({
    title: "",
    owner_id: "",
    project_id: project_id as string,
    is_folder: true,
    parent_id: item_id,
    permissions: [],
    tags: [],
  });
  const createNotification = useNotifications();

  const permissions = useHasPermissions(
    [`read_${data?.type}`, `create_${data?.type}`, `update_${data?.type}`],
    folder?.owner_id
  );

  const { mutateAsync: createFolder, isLoading: isCreating } = useCreateEntity<{
    data: Omit<ExistingFolderType, "owner_id" | "permissions">;
    relations?: { tags: { id: string }[] };
    permissions: EntityPermissionType[];
  }>(data.type);
  const { mutateAsync: updateFolder, isLoading: isUpdating } = useUpdateEntity<{
    data: { id: string; title: string; parent_id: string | null };
    relations?: { tags: { id: string }[] };
    permissions: EntityPermissionType[];
  }>(data.type, project_id as string);
  const { data: existingFolder, isFetching } = useGetEntity<ExistingFolderType>(
    data?.id,
    data.type,
    {
      data: {},
      fields: ["id", "owner_id", "is_folder", "title", "parent_id"],
      relations: data.type === "random_tables" ? {} : { tags: true },
      permissions: true,
    },
    {
      enabled: !!data?.id,
    }
  );

  useLayoutEffect(() => {
    if (existingFolder?.data) {
      setFolder(existingFolder?.data);
    }
  }, [existingFolder]);

  const resetDrawerAtom = useToggledResetAtom();
  const { changedData, handleChange } = useHandleChange({ data: folder, setData: setFolder });
  async function handleSave() {
    if (changedData) {
      if (data?.id) {
        await updateFolder(
          data.type === "random_tables"
            ? {
                data: { id: data.id, title: folder.title, parent_id: folder?.parent_id || null },
                permissions: folder.permissions,
              }
            : {
                data: { id: data.id, title: folder.title, parent_id: folder?.parent_id || null },
                relations: { tags: folder.tags || [] },
                permissions: folder.permissions,
              },
          {
            onSuccess: resetDrawerAtom,
          }
        );
      } else {
        const { tags, title, parent_id } = folder;
        await createFolder(
          data.type === "random_tables"
            ? { data: { title, parent_id, is_folder: true, project_id: project_id as string }, permissions: folder.permissions }
            : {
                data: { title, parent_id, is_folder: true, project_id: project_id as string },
                relations: { tags: tags || [] },
                permissions: folder.permissions,
              },
          {
            onSuccess: resetDrawerAtom,
          }
        );
      }
    }
  }

  if (isFetching) return <Skeleton type="drawer_form" />;

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

      <FolderSelect
        handleChange={(props) => {
          if (!Array.isArray(props)) {
            if (folder.id && props?.value === folder.id) {
              createNotification({
                title: "Cannot move a folder to itself.",
                variant: "error",
                timer: 3,
                icon: IconEnum.error,
              });
              return;
            }
          }
          handleChange(props);
        }}
        parent_id={folder?.parent_id ?? null}
        type={data.type}
      />

      {permissions?.is_owner || !data?.id ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={folder?.owner_id}
          permissions={folder?.permissions || []}
          related_id={folder?.id || null}
          selectablePermissions={[`read_${data.type}`, `update_${data.type}`, `delete_${data.type}`]}
        />
      ) : null}

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
