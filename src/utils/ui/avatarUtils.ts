import { Size } from "../../types";

export function getAvatarThumbnailDimensions(size: Size): { width: number; height: number } {
  if (size === "3xs") return { width: 12, height: 12 };
  if (size === "sm") return { width: 35, height: 35 };
  if (size === "md") return { width: 40, height: 40 };
  if (size === "4xl") return { width: 96, height: 96 };
  return { width: 50, height: 50 };
}
