import { useParams } from "react-router-dom";

import { useImageURL } from "../../../hooks/ui/useImageURLHook";
import { getAssetURL } from "../../../utils";

export function ImageViewDialog({
  data,
}: {
  data: { title: string; image_id?: string; image_type: "images" | "map_images"; url?: string; manual_project_id?: string };
}) {
  const { project_id } = useParams();

  const image_url = useImageURL(
    data?.image_id ? getAssetURL((data?.manual_project_id || project_id) as string, data?.image_type, data?.image_id) : null
  );

  return (
    <div className="flex h-full w-full select-none flex-col items-center justify-center gap-y-2">
      <img
        alt="preview"
        className="h-[95%] cursor-default object-contain"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        src={image_url || data?.url}
      />
      <h4 className="bottom-0 h-fit font-merriweather text-4xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
        {data.title}
      </h4>
    </div>
  );
}
