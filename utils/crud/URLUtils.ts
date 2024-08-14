import { AssetType, SearchableEntities } from "../../types";
import { FetchFunction } from "./FetchFunction";

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
  return `${project_id}/${type}/${image_id}`;
}

export function getSearchURL(type: SearchableEntities) {
  if (type === "all" || type === "projects") return "";
  if (type === "by_tags") return "all/tags";
  return `${type}`;
}

export async function getImageURL(url: string, dimensions?: { width: number; height: number }) {
  const formatted_url = dimensions ? `${url}?width=${dimensions.width}&height=${dimensions.height}` : url;
  const link = await FetchFunction({ url: `${import.meta.env.VITE_ARKIVE_ASSET_SERVICE}/${formatted_url}`, method: "GET" });

  if (link) return link;

  return "";
}
