import { useQueryClient } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateSubEntity,
  useGetEntities,
  useGetSubEntity,
  useHandleChange,
  useHasPermissions,
  useUpdateSubEntity,
} from "../../../hooks";
import { TabType, UserHasPermissionsType, WordStateType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { InsertWordSchema, InsertWordType, UpdateWordSchema } from "../../../validation";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button, Input, Select, Textarea } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data: {
    id?: string;
    title?: string;
  };
};

function isSaveDisabled(word: WordStateType) {
  if (!word.title) return true;
  if (!word.translation) return true;
  if (!word.parent_id) return true;
  return false;
}

function getTabs(permissions: UserHasPermissionsType, id: string | undefined): TabType[] {
  const tabs: TabType[] = [{ id: "1", label: "Basic info", icon: IconEnum.info_circle }];
  if (permissions?.is_owner || !id) {
    tabs.push({ id: "2", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function WordDrawer({ data }: Props) {
  const queryClient = useQueryClient();
  const { project_id, item_id } = useParams();
  const resetDrawer = useResetAtom(drawerAtom);
  const [word, setWord] = useState<WordStateType>({
    title: data?.title || undefined,
    parent_id: data?.title ? undefined : item_id,
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const permissions = useHasPermissions(["read_words", "update_words", "delete_words"], word?.owner_id);
  const tabs = getTabs(permissions, data?.id);
  const { data: dictionaries } = useGetEntities({ fields: ["id", "title"], data: { project_id } }, "dictionaries", {
    enabled: !!data?.title,
    isPublic: false,
  });
  const { data: existingWord, isFetching } = useGetSubEntity(
    data?.id,
    "words",
    {
      data: { id: data?.id },
      fields: ["id", "owner_id", "title", "description", "translation", "parent_id"],
      permissions: true,
    },
    { enabled: !!data?.id },
  );
  const { mutateAsync: createWord, isLoading: isCreating } = useCreateSubEntity<InsertWordType>("words", project_id);
  const { mutateAsync: updateWord, isLoading: isUpdating } = useUpdateSubEntity("words", project_id, item_id);
  const { handleChange } = useHandleChange({ data: word, setData: setWord });
  useLayoutEffect(() => {
    if (existingWord?.data) setWord(existingWord?.data);
  }, [existingWord]);

  async function handleSave() {
    if (!data?.id) {
      const parsedData = InsertWordSchema.parse({ data: word, permissions: word.permissions });
      await createWord(parsedData, { onSuccess: resetDrawer });
    } else {
      const parsedData = UpdateWordSchema.parse({ data: word, permissions: word.permissions });
      await updateWord(parsedData, { onSuccess: resetDrawer });
    }
    queryClient.invalidateQueries(["allEntities", project_id, "words"]);
  }

  if (isFetching) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <div className="flex flex-col gap-y-2">
          {data?.title ? (
            <Select
              name="parent_id"
              onChange={handleChange}
              options={(dictionaries?.data || []).map((dict) => ({ label: dict?.title, value: dict?.id }))}
              value={word?.parent_id || ""}
            />
          ) : null}
          <Input
            label="Word (required)"
            name="title"
            onChange={handleChange}
            value={word?.title || ""}
            variant={word?.title ? "primary" : "error"}
          />
          <Input
            label="Translation (required)"
            name="translation"
            onChange={handleChange}
            value={word?.translation || ""}
            variant={word?.translation ? "primary" : "error"}
          />
          <div className="h-96">
            <Textarea label="Context (optional)" name="description" onChange={handleChange} value={word?.description || ""} />
          </div>
        </div>
      ) : null}

      {tabs[selectedTab].id === "2" ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={word?.owner_id}
          permissions={word?.permissions || []}
          related_id={word?.id || null}
          selectablePermissions={["read_words", "update_words", "delete_words"]}
        />
      ) : null}

      <div>
        <Button
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isCreating || isUpdating || isSaveDisabled(word)}
          isLoading={isCreating || isUpdating}
          label={data?.id ? "Save" : "Create"}
          onClick={handleSave}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
