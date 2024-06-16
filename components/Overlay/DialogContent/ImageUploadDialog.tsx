import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useHasPermissions, useUploadAsset } from "../../../hooks";
import { Size } from "../../../types";
import { dialogAtom, getPreviewImageURLs, IconEnum } from "../../../utils";
import { ImagePreview } from "../../DataDisplay/ImagePreview";
import { Button, ImageUpload } from "../../Form";
import { Tabs } from "../../Layout";

const ImageUploadClasses = tv({
  slots: {
    imageUploadContainer: "sticky top-0 bg-zinc-700",
    imagesList: "grid grid-cols-2 gap-2 overflow-y-auto items-start",
  },
  variants: {
    size: {
      lg: {
        base: "h-[40rem] lg:w-[50rem] w-full",
        imageUploadContainer: "h-[15rem] max-h-[15rem]",
      },
    },
  },
});

const tabs = [
  { id: "1", label: "Images", icon: IconEnum.image },
  { id: "2", label: "Map images", icon: IconEnum.map },
];

export function ImageUploadDialog({ size }: { size: Size }) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const resetDialogAtom = useResetAtom(dialogAtom);

  const { imageUploadContainer, imagesList } = ImageUploadClasses({ size });
  const { mutateAsync: uploadImages, isLoading: isUploadingImages } = useUploadAsset("images", project_id as string);
  const { mutateAsync: uploadMapImages, isLoading: isUploadingMapImages } = useUploadAsset("map_images", project_id as string);
  const [images, setImages] = useState<File[]>([]);
  const [mapImages, setMapImages] = useState<File[]>([]);
  const permissions = useHasPermissions(["create_assets"], undefined);
  const imageUrls = images.length ? getPreviewImageURLs(images) : [];
  const mapImageUrls = mapImages.length ? getPreviewImageURLs(mapImages) : [];

  return (
    <div className="flex h-full flex-col justify-start gap-y-2 overflow-hidden p-2">
      <Tabs onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
      <div className={imageUploadContainer()}>
        <ImageUpload
          images={selectedTab ? mapImages : images}
          isDisabled={!permissions?.create_assets}
          onChange={selectedTab ? setMapImages : setImages}
        />
      </div>
      <div className={imagesList()}>
        {imageUrls?.length && !isUploadingImages && selectedTab === 0
          ? imageUrls.map((img) => (
              <ImagePreview
                clearAction={(name) => {
                  setImages((prev) => prev.filter((f) => f.name !== name));
                }}
                id={img.name}
                key={`${img.name}${img.url}`}
                title={img.name}
                url={img.url}
              />
            ))
          : null}
        {mapImageUrls?.length && !isUploadingMapImages && selectedTab === 1
          ? mapImageUrls.map((img) => (
              <ImagePreview
                clearAction={(name) => {
                  setMapImages((prev) => prev.filter((f) => f.name !== name));
                }}
                id={img.name}
                key={`${img.name}${img.url}`}
                title={img.name}
                url={img.url}
              />
            ))
          : null}
      </div>
      <div className="mt-auto">
        <Button
          icon={IconEnum.upload}
          isDisabled={isUploadingImages || isUploadingMapImages || !permissions?.create_assets}
          isLoading={isUploadingImages || isUploadingMapImages}
          label={isUploadingImages || isUploadingMapImages ? "Uploading..." : "Upload"}
          onClick={async () => {
            if (images.length) await uploadImages(images);
            if (mapImages.length) await uploadMapImages(mapImages);
            resetDialogAtom();
          }}
          variant="info"
        />
      </div>
    </div>
  );
}
