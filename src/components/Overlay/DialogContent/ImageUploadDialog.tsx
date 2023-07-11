import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";
import { AssetType, Size } from "../../../types";
import { useUploadAsset } from "../../../hooks";
import { useState } from "react";
import { IconEnum, getPreviewImageURLs } from "../../../utils";
import { Button, ImageUpload } from "../../Form";
import ImagePreview from "../../DataDisplay/ImagePreview";

const ImageUploadClasses = tv({
  slots: {
    imageUploadContainer: "sticky top-0 bg-zinc-700",
    imagesList: "grid grid-cols-2 gap-2 overflow-y-auto",
  },
  variants: {
    size: {
      lg: {
        base: "h-[40rem] lg:w-[50rem] w-full",
        imageUploadContainer: "h-[15rem] max-h-[15rem]",
        imagesList: "h-[15rem]",
      },
    },
  },
});

export function ImageUploadDialog({ size, type }: { size: Size; type: AssetType }) {
  const { project_id } = useParams();

  const { imageUploadContainer, imagesList } = ImageUploadClasses({ size });
  const { mutateAsync, isLoading: isMutating } = useUploadAsset(type, project_id as string);
  const [files, setFiles] = useState<File[]>([]);
  const imageUrls = getPreviewImageURLs(files);
  return (
    <div className="flex h-full flex-col justify-start gap-y-2 p-4">
      <div className={imageUploadContainer()}>
        <ImageUpload images={files} onChange={setFiles} />
      </div>
      <div className={imagesList()}>
        {imageUrls?.length && !isMutating
          ? imageUrls.map((img) => <ImagePreview key={`${img.name}${img.url}`} name={img.name} url={img.url} />)
          : null}
      </div>
      <Button
        icon={IconEnum.upload}
        isDisabled={isMutating}
        isLoading={isMutating}
        label="Upload"
        onClick={async () => {
          if (files) await mutateAsync(files);
        }}
        variant="info"
      />
    </div>
  );
}
