import { tv } from "tailwind-variants";

import { GalleryType } from "../../types";
import { Image } from "./Image";

const GalleryClasses = tv({
  base: "grid gap-1 grid-cols-1 md:grid-cols-2",
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

export function Gallery({ images, isOpenable, columns = 4 }: GalleryType) {
  const classes = GalleryClasses({ columns });
  return (
    <div className={classes}>
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} isOpenable={isOpenable} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <Image image={image} />
        </div>
      ))}
    </div>
  );
}
