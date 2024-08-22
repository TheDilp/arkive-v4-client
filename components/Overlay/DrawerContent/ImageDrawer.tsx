import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetImage, useHandleChange, useHasPermissions, useToggledResetAtom, useUpdateImage } from "../../../hooks";
import { ImageType, TabType, UserHasPermissionsType } from "../../../types";
import { createOrEditPermission, getPreviewImageURLs, IconEnum } from "../../../utils";
import { EntityPermission } from "../../Complex/EntityPermission";
import { ImagePreview } from "../../DataDisplay";
import { Button, ImageUpload, Input, TagInput } from "../../Form";
import { DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data: ImageType;
};

function getTabs(permissions: UserHasPermissionsType): TabType[] {
  const tabs: TabType[] = [{ id: "1", label: "Basic info", icon: IconEnum.info_circle }];

  if (permissions?.read_tags) {
    tabs.push({ id: "2", label: "Tags", icon: IconEnum.tags });
  }
  if (permissions?.is_owner) {
    tabs.push({ id: "3", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}
export function ImageDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [image, setImage] = useState<ImageType | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [replacementImage, setReplacementImage] = useState<File[]>([]);

  const imageUrls = replacementImage ? getPreviewImageURLs(replacementImage) : [];

  const resetDrawer = useToggledResetAtom();

  const { data: imageData, isInitialLoading } = useGetImage(data?.id, project_id as string, "images", {
    fields: ["id", "title", "is_public", "owner_id", "type"],
    relations: {
      tags: true,
    },
    permissions: true,
  });

  useEffect(() => {
    if (imageData?.data) {
      setImage(imageData?.data);
    }
  }, [imageData]);

  const { handleChange } = useHandleChange({ data: image, setData: setImage });
  const { mutateAsync: update, isLoading: isMutating } = useUpdateImage(data.id, project_id, image?.type || "images");

  const permissions = useHasPermissions(["read_assets", "update_assets", "read_tags"], image?.owner_id);

  const hasCreateOrEdit = createOrEditPermission(
    permissions?.create_assets,
    permissions?.update_assets,
    permissions?.is_owner,
    data?.id
  );

  const tabs = getTabs(permissions);

  useEffect(() => {
    if (replacementImage.length > 1) {
      setReplacementImage([replacementImage[0]]);
    }
  }, [replacementImage]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      {tabs[selectedTab].id === "1" ? (
        <>
          <Input name="title" onChange={handleChange} value={image?.title || ""} />
          {replacementImage.length ? (
            imageUrls.map((img) => (
              <ImagePreview
                key={`${img.name}${img.url}`}
                clearAction={() => setReplacementImage([])}
                id={img.name}
                title={img.name}
                url={img.url}
              />
            ))
          ) : (
            <div className="mb-6 max-h-56">
              <span className="text-sm text-zinc-400">Replace image</span>
              <ImageUpload
                images={[]}
                isDisabled={!permissions?.update_assets}
                isMultiple={false}
                onChange={setReplacementImage}
              />
            </div>
          )}
        </>
      ) : null}
      {tabs[selectedTab].id === "2" && permissions?.read_tags ? (
        <div className="flex flex-col gap-y-2">
          <TagInput
            handleChange={handleChange}
            isAutofocused
            isDisabled={!hasCreateOrEdit}
            isMultiple
            tags={image?.tags || []}
          />
        </div>
      ) : null}
      {tabs[selectedTab].id === "3" && permissions?.is_owner ? (
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
            await update(
              {
                data: { title: image.title, owner_id: image.owner_id, file: replacementImage[0] },
                relations: { tags: image.tags.map((t) => ({ id: t.id })) },
                permissions: image?.permissions || [],
              },
              { onSuccess: resetDrawer }
            );
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
