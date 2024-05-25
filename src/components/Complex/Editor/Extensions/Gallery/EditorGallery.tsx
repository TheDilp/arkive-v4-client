import { useState } from "react";

import { IconEnum } from "../../../../../utils";
import { Button } from "../../../../Form";

type Props = {
  title: string;
};

export default function EditorGallery({ title = "Gallery" }: Props) {
  // Use intersection observer to begin playing
  const [index, setIndex] = useState(0);
  const images = [
    "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/1038a46c-c8c9-4396-bf3b-ddad84d7b45e.webp",
    "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/baaeb8fc-b816-4170-923c-a791b9ffbcc3.webp",
    "https://the-arkive-v3.nyc3.cdn.digitaloceanspaces.com/assets/43e1c879-415b-4394-95ad-f9a4c42a43c5/images/d3f6770e-049b-4030-92dd-e6f8d4cbdb8c.webp",
  ];

  function changeIndexPrev() {
    if (images.length) {
      if (index - 1 <= 0) setIndex(images.length - 1);
      else setIndex(index - 1);
    }
  }
  function changeIndexNext() {
    if (images.length) {
      if (index + 1 >= images.length) setIndex(0);
      else setIndex(index + 1);
    }
  }

  return (
    <div className="relative flex w-fit flex-col justify-center">
      <div className="flex w-96 flex-nowrap justify-center gap-x-2">
        <div>
          <Button hasNoBackground icon={IconEnum.chevron_left} isIconOnly onClick={changeIndexPrev} />
        </div>
        <div className="h-96">
          <img alt="gallery" className="h-full w-full object-contain" src={images[index]} />
        </div>
        <div>
          <Button hasNoBackground icon={IconEnum.chevron_right} isIconOnly onClick={changeIndexNext} />
        </div>
      </div>
      <h4 className="max-w-full break-words text-center" contentEditable={false}>
        {title}
      </h4>
    </div>
  );
}
