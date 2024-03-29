import { useResetAtom } from "jotai/utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetImage, useHandleChange, useHasPermissions, useUpdateImage } from "../../../hooks";
import { ImageType, TabType, UserHasPermissionsType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
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
  const resetDrawer = useResetAtom(drawerAtom);
  const { data: imageData } = useGetImage(data?.id, project_id as string, "images", {
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

  if (!image) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? <Input name="title" onChange={handleChange} value={image?.title || ""} /> : null}
      {tabs[selectedTab].id === "2" && permissions?.is_owner ? (
        <EntityPermission
          handleChange={handleChange}
          permissions={image?.permissions || []}
          related_id={image?.id || null}
          selectablePermissions={["read_assets", "update_assets", "delete_assets"]}
          type="images"
        />
      ) : null}
      <Button
        icon={IconEnum.save}
        isDisabled={isMutating}
        isLoading={isMutating}
        label="Save"
        onClick={async () =>
          update({ data: { title: image.title }, permissions: image?.permissions || [] }, { onSuccess: resetDrawer })
        }
        variant="success"
      />
    </DrawerLayout>
  );
}
