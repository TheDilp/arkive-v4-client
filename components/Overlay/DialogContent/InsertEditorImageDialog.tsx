import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useGetImages } from "../../../hooks";
import { ImageType } from "../../../types";
import { getImageURL, IconEnum } from "../../../utils";
import { ImagePreview } from "../../DataDisplay";
import { Button, Search, Select, Title } from "../../Form";

type Props = {
  data: {
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
  };
};

export function InsertEditorImageDialog({ data }: Props) {
  const { type, access_id, project_id } = useParams();
  const [selectedImages, setSelectedImages] = useState<{ project_id?: string; label: string; value: string }[]>([]);
  const { data: images } = useGetImages<ImageType>(
    "",
    "images",
    {
      fields: ["id", "title", "project_id"],
      data: { entity_type: type, access_id },
    },
    {
      enabled: IS_GATEWAY,
    }
  );
  return (
    <div>
      {IS_GATEWAY ? (
        <Select
          isMultiple
          name="selectedImages"
          onChange={({ value }) => {
            if (selectedImages.some((img) => value?.includes(img.value))) {
              return;
            }

            setSelectedImages(
              (images?.data || [])
                .filter((img) => value?.includes(img.id))
                .map((img) => ({ id: img.id, label: img.title, project_id: img.project_id, value: img.id }))
            );
          }}
          options={(images?.data || []).map((image) => ({
            id: image.id,
            label: image.title,
            value: image.id,
            project_id: image.project_id,
            image: { id: image.id, link: getImageURL(image.project_id, "images", image.id), shape: "circle" },
          }))}
          value={selectedImages.map((img) => img.value)}
        />
      ) : (
        <Search
          isAutofocused
          isMultiple
          name="images"
          onChange={({ label, value }) => {
            if (selectedImages.some((img) => img.value === value)) {
              return;
            }
            setSelectedImages(selectedImages.concat({ label: label as string, value }));
          }}
          searchEntity="images"
          value={selectedImages.map((img) => img.value)}
        />
      )}
      <div className="my-2 flex flex-col gap-y-2">
        <Title isDrawerTitle label="Images to insert" size="xl" />
        {selectedImages.map((img) => (
          <ImagePreview
            clearAction={(id) => setSelectedImages((prev) => prev.filter((im) => im.value !== id))}
            id={img.value}
            key={img.value}
            manual_project_id={selectedImages?.[0]?.project_id}
            title={img.label}
          />
        ))}
      </div>
      <Button
        icon={IconEnum.image}
        isDisabled={!selectedImages.length}
        label="Insert"
        onClick={() => {
          for (let index = 0; index < selectedImages.length; index += 1) {
            const image = selectedImages[index];
            data?.getContext?.chain
              ?.insertImage({
                src: getImageURL((image.project_id || project_id) as string, "images", image.value),
                alt: image.label,
                title: image.label,
                align: "right",
                id: image.value,
              })
              ?.run();
          }
          setSelectedImages([]);
        }}
        variant="success"
      />
    </div>
  );
}
