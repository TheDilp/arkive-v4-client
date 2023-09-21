import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { ImageType } from "../../types";
import { getImageURL } from "../../utils";

type Props = {
  images: ImageType[];
  columns: number;
};

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

export function Gallery({ images, columns = 4 }: Props) {
  const { project_id } = useParams();
  const classes = GalleryClasses({ columns });
  return (
    <div className={classes}>
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
      {images.map((image) => (
        <div key={image.id} className="h-full w-full">
          <img alt={image.title} src={getImageURL(project_id as string, "images", image.id)} />
        </div>
      ))}
    </div>
  );
}
