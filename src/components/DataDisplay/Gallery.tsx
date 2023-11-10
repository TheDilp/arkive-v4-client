import { tv } from "tailwind-variants";

import { GalleryType, Size } from "../../types";
import { Image } from "./Image";

const GalleryClasses = tv({
  base: "grid gap-1 grid-cols-1 md:grid-cols-2 min-h-fit lg:pb-0 pb-48",
  variants: {
    columns: {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
      6: "lg:grid-cols-6",
      7: "lg:grid-cols-7",
      8: "lg:grid-cols-8",
      9: "lg:grid-cols-9",
      10: "lg:grid-cols-10",
      11: "lg:grid-cols-11",
      12: "lg:grid-cols-12",
    },
  },
});

function getRowSize(size: Size) {
  if (size === "md") return "12rem";
  if (size === "2xl") return "36rem";
  return "12rem";
}

export function Gallery({ images, isOpenable, columns = 4, size = "md" }: GalleryType) {
  const classes = GalleryClasses({ columns });
  return (
    <div className={`h-min max-h-[${getRowSize(size)}] overflow-y-auto`}>
      <div
        className={classes}
        style={{
          gridAutoRows: getRowSize(size),
        }}>
        {images.map((image) => (
          <Image key={image.id} image={image} isOpenable={isOpenable} />
        ))}
      </div>
    </div>
  );
}
