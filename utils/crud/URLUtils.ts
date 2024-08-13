import { createHmac } from "crypto";

import { AssetType, SearchableEntities } from "../../types";
import { baseURLS } from "../enums/ServerEnum";

export function getPreviewImageURLs(files: File[] | undefined): { name: string; url: string }[] {
  if (files) {
    const urls = [];
    for (let index = 0; index < files.length; index += 1) {
      const { name } = files[index];
      const url = window.URL.createObjectURL(files[index]);
      urls.push({ name, url });
    }
    return urls;
  }
  return [];
}

export function getAssetURL(project_id: string, type: AssetType, image_id?: string | null): string {
  if (!image_id) return "";
  return `assets/${project_id}/${type}/${image_id}.webp`;
}

export function getSearchURL(type: SearchableEntities) {
  if (type === "all" || type === "projects") return "";
  if (type === "by_tags") return "all/tags";
  return `${type}`;
}

export function getImageURL(url: string, dimensions?: { width: number; height: number }) {
  const sizedUrl = dimensions ? `${dimensions?.width || 35}x${dimensions?.height || 35}/${url}` : url;
  const hash = createHmac("sha512", import.meta.env.VITE_THUMBNAIL_SECRET)
    .update(sizedUrl)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${baseURLS.baseThumbnailServer}/${hash}/${sizedUrl}`;
}
