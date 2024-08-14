import { useAtomValue, useSetAtom } from "jotai";
import { useLayoutEffect, useState } from "react";

import { Size } from "../../types";
import { assetsUrlsAtom, getAvatarThumbnailDimensions, getImageURL, imageUrlsAtom, thumbnailUrlsAtom } from "../../utils";

export function useImageURL(image: string | null | undefined, size?: Size) {
  const setUrls = useSetAtom(assetsUrlsAtom);
  const urls = useAtomValue(size ? thumbnailUrlsAtom : imageUrlsAtom);
  const [url, setUrl] = useState(image ? urls?.[image] : "");
  useLayoutEffect(() => {
    async function fetchData() {
      if (image && !url) {
        if (size) {
          const dimensions = getAvatarThumbnailDimensions(size);
          const image_url = await getImageURL(image, dimensions);
          setUrl(image_url);

          setUrls((prev) => {
            const temp = { ...prev.thumbnails };
            temp[image] = image_url;
            return { thumbnails: temp, images: prev.thumbnails };
          });
        } else {
          const image_url = await getImageURL(image);
          setUrl(image_url);
          setUrls((prev) => {
            const temp = { ...prev.images };
            temp[image] = image_url;
            return { thumbnails: prev.thumbnails, images: temp };
          });
        }
      }
    }

    fetchData().catch(console.error);
  }, [url, size]);
  return image && urls?.[image] ? urls?.[image] : url;
}
