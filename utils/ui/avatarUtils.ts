import { Size } from "../../types";

export function getAvatarThumbnailDimensions(size: Size): { width: number; height: number } {
  if (size === "3xs") return { width: 12, height: 12 };
  if (size === "sm") return { width: 35, height: 35 };
  if (size === "md") return { width: 40, height: 40 };
  if (size === "2xl") return { width: 160, height: 160 };
  if (size === "3xl") return { width: 180, height: 180 };
  if (size === "4xl") return { width: 200, height: 200 };
  return { width: 50, height: 50 };
}
