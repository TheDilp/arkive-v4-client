import { tv } from "tailwind-variants";

import { GalleryType, Size } from "../../types";
import { Image } from "./Image";

const GalleryClasses = tv({
  slots: {
    container: "overflow-y-auto h-full",
    base: "grid gap-1 grid-cols-1 md:grid-cols-2 min-h-fit lg:pb-0 pb-48",
  },
  variants: {
    columns: {
      1: {
        base: "lg:grid-cols-1",
      },
      2: {
        base: "lg:grid-cols-2",
      },
      3: {
        base: "lg:grid-cols-3",
      },
      4: {
        base: "lg:grid-cols-4",
      },
      5: {
        base: "lg:grid-cols-5",
      },
      6: {
        base: "lg:grid-cols-6",
      },
      7: {
        base: "lg:grid-cols-7",
      },
      8: {
        base: "lg:grid-cols-8",
      },
      9: {
        base: "lg:grid-cols-9",
      },
      10: {
        base: "lg:grid-cols-10",
      },
      11: {
        base: "lg:grid-cols-11",
      },
      12: {
        base: "lg:grid-cols-12",
      },
    },
  },
});

function getRowSize(size: Size): number {
  if (size === "md") return 12;
  if (size === "lg") return 18;
  if (size === "xl") return 22;
  if (size === "2xl") return 28;
  if (size === "3xl") return 34;
  return 12;
}

export function Gallery({ images, isOpenable, columns = 4, size = "md", type }: GalleryType) {
  const { container, base } = GalleryClasses({ columns });
  const rowSize = getRowSize(size);
  return (
    <div className={container()}>
      <div
        className={base()}
        style={{
          height: `${rowSize}rem`,
          gridAutoRows: `${rowSize}rem`,
        }}>
        {images.map((image) => (
          <Image image={image} isOpenable={isOpenable} key={image.id} type={type} />
        ))}
      </div>
    </div>
  );
}

