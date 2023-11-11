import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { getImageURL, IconEnum } from "../../../utils";
import { ImagePreview } from "../../DataDisplay";
import { Button, Search, Title } from "../../Form";

type Props = {
  getContext: ReactFrameworkOutput<Remirror.Extensions>;
};

export function InsertEditorImageDrawer({ getContext }: Props) {
  const { project_id } = useParams();
  const [selectedImages, setSelectedImages] = useState<{ label: string; value: string }[]>([]);
  return (
    <div>
      <Search
        name="images"
        onChange={({ label, value }) => {
          if (selectedImages.some((img) => img.value === value)) {
            return;
          }
          setSelectedImages(selectedImages.concat({ label: label as string, value }));
        }}
        searchEntity="images"
      />
      <div className="my-2 flex flex-col gap-y-2">
        <Title isDrawerTitle label="Images to insert" size="xl" />
        {selectedImages.map((img) => (
          <ImagePreview
            key={img.value}
            clearAction={(id) => setSelectedImages((prev) => prev.filter((im) => im.value !== id))}
            id={img.value}
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
            getContext?.chain
              ?.insertImage({
                src: getImageURL(project_id as string, "images", image.value),
                alt: image.label,
                title: image.label,
                align: "right",
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
