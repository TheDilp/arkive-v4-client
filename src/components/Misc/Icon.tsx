import { Icon as IconifyIcon } from "@iconify/react";

import { IconType } from "../../types";

export function Icon({ color, icon, fontSize, className, thickness = "regular" }: IconType) {
  return (
    <IconifyIcon
      className={className || ""}
      color={color}
      fontSize={fontSize}
      icon={`${icon}${thickness === "regular" ? "" : "-".concat(thickness)}` || "ph:question"}
    />
  );
}
