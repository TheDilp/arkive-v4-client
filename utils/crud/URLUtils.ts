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

export function getSearchURL(
  type: SearchableEntities,
  isGlobal: boolean,
  project_id: string,
  isFolders: boolean,
  entityType: string
) {
  const parts = [];
  if (isGlobal) {
    parts.push("global");
  }

  if (project_id) {
    parts.push(project_id);
  }
  if (type === "by_tags") {
    parts.push("all/tags");
  } else if (type === "all") {
    parts.push("");
  } else {
    parts.push(entityType);
  }
  if (isFolders) {
    parts.push("folder");
  }
  if (entityType === "projects") {
    parts.push(entityType);
  }

  return parts.join("/");
}

export async function getImageURL(url: string, dimensions?: { width: number; height: number }) {
  const formatted_url = dimensions ? `${url}?width=${dimensions.width}&height=${dimensions.height}` : url;
  const link = await FetchFunction({ url: `${import.meta.env.VITE_ARKIVE_ASSET_SERVICE}/${formatted_url}`, method: "GET" });

  if (link) return link;

  return "";
}
