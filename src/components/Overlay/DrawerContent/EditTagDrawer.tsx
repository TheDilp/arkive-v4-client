import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntity, useHandleChange, useToggledResetAtom, useUpdateEntity } from "../../../hooks";
import { EntityPermissionType, TagType } from "../../../types";
import { DefaultTagColor, IconEnum } from "../../../utils";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button, Input } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";
import { ColorPicker } from "..";

type Props = {
  data: {
    id: string;
  };
};

const tabs = [
  { id: "1", label: "Basic info", icon: IconEnum.info_circle },
  { id: "2", label: "Access", icon: IconEnum.permissions },
];

export function EditTagDrawer({ data }: Props) {
  const { project_id } = useParams();
  const { data: tagData, isInitialLoading } = useGetEntity<TagType>(data?.id, "tags", {
    fields: ["id", "title", "color", "owner_id"],
    permissions: true,
  });
  const resetDrawer = useToggledResetAtom();
  const [tag, setTag] = useState<TagType | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const { mutate: update, isLoading } = useUpdateEntity<{
    data: Pick<TagType, "id" | "title" | "color">;
    permissions: EntityPermissionType[];
  }>("tags", project_id as string);

  function handleSave() {
    if (tag) {
      update({ data: { id: data.id, title: tag?.title, color: tag?.color }, permissions: tag.permissions });
      resetDrawer();
    }
  }

  const { handleChange } = useHandleChange({ data: tag, setData: setTag });

  useLayoutEffect(() => {
    if (tagData?.data) setTag(tagData?.data);
  }, [tagData]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />

      {tabs[selectedTab].id === "1" ? (
        <div className="flex items-center justify-between gap-x-2">
          <Input label="Title" name="title" onChange={handleChange} value={tag?.title} />
          <div className="mb-2 self-end">
            <ColorPicker name="color" onChange={handleChange} value={tag?.color || DefaultTagColor} />
          </div>
        </div>
      ) : null}

      {tabs[selectedTab].id === "2" ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={tag?.owner_id}
          permissions={tag?.permissions || []}
          related_id={tag?.id || null}
          selectablePermissions={["read_tags", "update_tags", "delete_tags"]}
        />
      ) : null}
      <Button
        icon={IconEnum.save}
        isDisabled={!tag?.title || isLoading}
        isLoading={isLoading}
        label="Save"
        onClick={handleSave}
        variant="success"
      />
    </DrawerLayout>
  );
}
