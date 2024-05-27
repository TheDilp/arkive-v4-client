import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetImage, useHandleChange, useHasPermissions, useToggledResetAtom, useUpdateImage } from "../../../hooks";
import { ImageType, TabType, UserHasPermissionsType } from "../../../types";
import { IconEnum } from "../../../utils";
import { EntityPermission } from "../../Complex/EntityPermission";
import { Button, Input } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data: ImageType;
};

function getTabs(permissions: UserHasPermissionsType): TabType[] {
  const tabs: TabType[] = [{ id: "1", label: "Basic info", icon: IconEnum.info_circle }];

  if (permissions?.is_owner) {
    tabs.push({ id: "2", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}
export function ImageDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [image, setImage] = useState<ImageType | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const resetDrawer = useToggledResetAtom();
  const { data: imageData, isInitialLoading } = useGetImage(data?.id, project_id as string, "images", {
    fields: ["id", "title", "is_public", "owner_id"],
    permissions: true,
  });

  useEffect(() => {
    if (imageData?.data) {
      setImage(imageData?.data);
    }
  }, [imageData]);

  const { handleChange } = useHandleChange({ data: image, setData: setImage });
  const { mutateAsync: update, isLoading: isMutating } = useUpdateImage(data.id, project_id, image?.type || "images");

  const permissions = useHasPermissions(["read_assets", "update_assets"], image?.owner_id);

  const tabs = getTabs(permissions);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? <Input name="title" onChange={handleChange} value={image?.title || ""} /> : null}
      {tabs[selectedTab].id === "2" && permissions?.is_owner ? (
        <EntityPermission
          handleChange={handleChange}
          owner_id={image?.owner_id}
          permissions={image?.permissions || []}
          related_id={image?.id || null}
          selectablePermissions={["read_assets", "update_assets", "delete_assets"]}
        />
      ) : null}
      <Button
        icon={IconEnum.save}
        isDisabled={isMutating}
        isLoading={isMutating}
        label="Save"
        onClick={async () => {
          if (image?.title)
            await update({ data: { title: image.title }, permissions: image?.permissions || [] }, { onSuccess: resetDrawer });
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
