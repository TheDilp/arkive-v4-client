import { Icon as IconifyIcon } from "@iconify/react";
import { IconType } from "../../types";

export function Icon({ color, icon, fontSize, className }: IconType) {
  return <IconifyIcon className={className || ""} color={color} fontSize={fontSize} icon={icon || "ph:question"} />;
}
