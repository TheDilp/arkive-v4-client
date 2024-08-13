import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateSubEntity,
  useGetEntity,
  useGetSubEntity,
  useHandleChange,
  useHasPermissions,
  useToggledResetAtom,
  useUpdateSubEntity,
} from "../../../hooks";
import { DrawerAtomType, TabType, UserHasPermissionsType, WordStateType } from "../../../types";
import { createOrEditPermission, IconEnum } from "../../../utils";
import { InsertWordSchema, InsertWordType, UpdateWordSchema } from "../../../validation";
import { EntityPermission } from "../../Complex/EntityPermission";
import { EntityPreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search, Textarea } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data: {
    id?: string;
    title?: string;
    getContext?: ReactFrameworkOutput<Remirror.Extensions>;
    range?: { from: number | undefined; to: number | undefined };
  };
  exceptions: DrawerAtomType["exceptions"];
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

export function WordDrawer({ data, exceptions }: Props) {
  const queryClient = useQueryClient();
  const { project_id, item_id } = useParams();
  const resetDrawer = useToggledResetAtom();
  const [word, setWord] = useState<WordStateType>({
    title: data?.title || undefined,
    parent_id: data?.title || exceptions?.globalCreate ? undefined : item_id,
  });
  const [createMention, setCreateMention] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const permissions = useHasPermissions(["read_words", "update_words", "delete_words"], word?.owner_id);
  const tabs = getTabs(permissions, data?.id);
  const {
    data: existingWord,
    isInitialLoading,
    isFetching,
  } = useGetSubEntity(
    data?.id,
    "words",
    {
      data: { id: data?.id },
      fields: ["id", "owner_id", "title", "description", "translation", "parent_id"],
      permissions: true,
    },
    { enabled: !!data?.id }
  );
  const { data: dictionary } = useGetEntity(
    exceptions?.globalCreate ? word?.parent_id : item_id,
    "dictionaries",
    { fields: ["id", "title", "icon"] },
    {
      enabled: !!data?.title || (!!word?.parent_id && exceptions?.globalCreate),
    }
  );

  const canCreateOrEdit = createOrEditPermission(
    permissions?.create_words,
    permissions?.update_words,
    permissions?.is_owner,
    data?.id
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
      await createWord(parsedData, {
        onSuccess: (res) => {
          if (res?.ok && createMention) {
            if (
              exceptions?.mention &&
              data?.getContext &&
              typeof data.range?.from === "number" &&
              typeof data.range?.to === "number" &&
              res?.data?.id
            ) {
              data.getContext.chain
                .delete({ from: Number(data.range.from), to: Number(data.range.to) })
                .createMentionAtom(
                  {
                    name: "words",
                    range: {
                      from: data.range.from,
                      cursor: data.range.to,
                      to: data.range.to,
                    },
                  },
                  {
                    id: res?.data?.id,
                    label: data?.title || "",
                    name: "words",
                    icon: undefined,
                    projectId: project_id,
                    parent_id: undefined,
                  }
                )
                .run();
            }
          }

          resetDrawer();
          setWord({
            parent_id: data?.title || exceptions?.globalCreate ? undefined : item_id,
          });
        },
      });
    } else {
      const parsedData = UpdateWordSchema.parse({ data: word, permissions: word.permissions });
      await updateWord(parsedData, { onSuccess: resetDrawer });
    }
    queryClient.invalidateQueries(["allEntities", project_id, "words"]);
  }

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <div className="flex flex-col gap-y-2">
          {(data?.title || exceptions?.globalCreate) && !word?.parent_id ? (
            <Search
              label="Dictionary (required)"
              name="parent_id"
              onChange={handleChange}
              searchEntity="dictionaries"
              value={word?.parent_id}
            />
          ) : null}
          {(data?.title || exceptions?.globalCreate) && word?.parent_id && dictionary?.data ? (
            <EntityPreview
              clearAction={() => handleChange({ name: "parent_id", value: null })}
              icon={dictionary?.data?.icon}
              id={word?.parent_id}
              title={dictionary?.data?.title}
              type="dictionaries"
            />
          ) : null}
          {exceptions?.globalCreate && !word?.parent_id ? null : (
            <>
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
                <Textarea
                  label="Context (optional)"
                  name="description"
                  onChange={handleChange}
                  value={word?.description || ""}
                />
              </div>
            </>
          )}
        </div>
      ) : null}

      {exceptions?.mention ? (
        <li className="flex w-full items-center justify-between">
          <span>Create mention:</span>
          <Checkbox
            isDisabled={!canCreateOrEdit}
            name="create_mention"
            onChange={(e) => setCreateMention(e.value)}
            value={createMention}
          />
        </li>
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
          isDisabled={isFetching || isCreating || isUpdating || isSaveDisabled(word)}
          isLoading={isCreating || isUpdating}
          label={data?.id ? "Save" : "Create"}
          onClick={handleSave}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
