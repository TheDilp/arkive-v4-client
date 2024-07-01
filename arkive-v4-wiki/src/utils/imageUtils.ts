export function getImageURL(
  project_id: string,
  type: "images" | "map_images",
  image_id?: string | null,
  isGraphImage?: boolean,
): string {
  if (!image_id) return "";
  return `https://${import.meta.env.DO_SPACES_NAME}.${
    isGraphImage
      ? import.meta.env.DO_SPACES_ENDPOINT
      : import.meta.env.DO_SPACES_CDN_ENDPOINT
  }/assets/${project_id}/${type}/${image_id}.webp`;
}
