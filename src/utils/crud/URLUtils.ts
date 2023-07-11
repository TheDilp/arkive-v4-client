import { AssetType } from "../../types";

import { baseURLS } from "../enums/ServerEnum";

export function createURL(type: string): string {
  if (type === "dictionaries") return `${baseURLS.baseServer}api/v4/${type}/create`;
  if (type === "entities") return `${baseURLS.baseServer}createentity`;
  if (type === "entityinstances") return `${baseURLS.baseServer}createentityinstance`;

  return `${baseURLS.baseServer}create${type.slice(0, -1).replace("_", "")}`; // Replace is for random_tables
}

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

export function getImageURL(project_id: string, type: AssetType, image_name?: string): string {
  if (!image_name) return "";
  return `${baseURLS.baseServer}assets/${project_id}/${type}/${image_name}`;
}
