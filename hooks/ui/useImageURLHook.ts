import { useLayoutEffect, useState } from "react";

import { Size } from "../../types";
import { getAvatarThumbnailDimensions, getImageURL } from "../../utils";

export function useImageURL(image: string | null | undefined, size?: Size) {
  const [url, setUrl] = useState("");
  useLayoutEffect(() => {
    async function fetchData() {
      if (image) {
        if (size) {
          const dimensions = getAvatarThumbnailDimensions(size);
          const image_url = await getImageURL(image, dimensions);
          setUrl(image_url);
        } else {
          const image_url = await getImageURL(image);

          setUrl(image_url);
        }
      }
    }

    fetchData().catch(console.error);
  }, []);

  return url;
}
