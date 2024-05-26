import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange, useHasPermissions, useUpdateEntity } from "../../../hooks";
import { DictionaryStateType, DictionaryType, DrawerAtomType, TabType, UserHasPermissionsType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import {
  InsertDictionarySchema,
  InsertDictionaryType,
  UpdateDictionarySchema,
  UpdateDictionaryType,
} from "../../../validation";
import { FolderSelect } from "../../Complex";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button, Checkbox, Input } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";
import { IconPicker } from "../IconPicker";

type Props = {
  data: { id?: string };
  exceptions: DrawerAtomType["exceptions"];
};

function getTabs(permissions: UserHasPermissionsType, id: string | undefined): TabType[] {
  const tabs: TabType[] = [{ id: "1", label: "Basic info", icon: IconEnum.info_circle }];

  if (permissions?.is_owner || !id) {
    tabs.push({ id: "2", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function DictionaryDrawer({ data, exceptions }: Props) {
  const { project_id, item_id } = useParams();
  const { data: existingDictionary, isFetching: isFetchingDictionary } = useGetEntity<DictionaryType>(
    data?.id,
    "dictionaries",
    { data, fields: ["id", "title", "icon", "is_public", "is_folder", "parent_id"], permissions: true },
    { enabled: !!data?.id },
  );
  const { mutateAsync: createDictionary, isLoading: isCreating } = useCreateEntity<InsertDictionaryType>("dictionaries");
  const { mutateAsync: updateDictionary, isLoading: isUpdating } = useUpdateEntity<UpdateDictionaryType>(
    "dictionaries",
    project_id as string,
  );
  const [dictionary, setDictionary] = useState<DictionaryStateType>({
    id: data?.id,
    parent_id: exceptions?.globalCreate ? null : item_id,
    project_id,
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const permissions = useHasPermissions(
    ["read_dictionaries", "create_dictionaries", "update_dictionaries", "read_tags", "read_character_fields_templates"],
    dictionary?.owner_id,
  );
  const tabs = getTabs(permissions, data?.id);

  useLayoutEffect(() => {
    if (existingDictionary?.data) setDictionary(existingDictionary.data);
  }, [existingDictionary]);
  const { handleChange } = useHandleChange({ data: dictionary, setData: setDictionary });
  const resetDrawer = useResetAtom(drawerAtom);
  async function handleSave() {
    if (!data?.id) {
      const parsedData = InsertDictionarySchema.parse({ data: dictionary, permissions: dictionary.permissions });

      await createDictionary(parsedData, { onSuccess: resetDrawer });
    } else {
      const parsedData = UpdateDictionarySchema.parse({ data: dictionary, permissions: dictionary.permissions });
      await updateDictionary(parsedData, { onSuccess: resetDrawer });
    }
  }

  if (isFetchingDictionary) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <div className="flex flex-nowrap gap-x-2">
            <Input
              label="Title (required)"
              name="title"
              onChange={handleChange}
              placeholder="Eg. English dictionary"
              value={dictionary?.title || ""}
              variant={dictionary?.title ? "primary" : "error"}
            />
            <span className="h-8 self-end">
              <IconPicker icon={dictionary?.icon || undefined} name="icon" onChange={handleChange} />
            </span>
          </div>

          <FolderSelect handleChange={handleChange} parent_id={dictionary?.parent_id ?? null} type="dictionaries" />

          <div className="flex w-full items-center justify-between">
            <span>Is public:</span>
            <Checkbox name="is_public" onChange={handleChange} value={dictionary?.is_public ?? false} />
          </div>
        </>
      ) : null}
      {tabs[selectedTab].id === "2" && (permissions?.is_owner || !data?.id) ? (
        <EntityPermission
          handleChange={handleChange}
          permissions={dictionary?.permissions || []}
          related_id={dictionary?.id || null}
          selectablePermissions={["read_dictionaries", "update_dictionaries", "delete_dictionaries"]}
        />
      ) : null}
      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        isDisabled={!dictionary.title || isCreating || isUpdating}
        isLoading={isCreating || isUpdating}
        label={data?.id ? "Save" : "Create"}
        onClick={handleSave}
        variant="success"
      />
    </DrawerLayout>
  );
}
