import { Icon as IconifyIcon } from "@iconify/react";

import { IconType } from "../../types";

export function Icon({ color, icon, fontSize, className, thickness = "regular", hFlip, vFlip }: IconType) {
  return (
    <IconifyIcon
      className={className || ""}
      color={color}
      fontSize={fontSize}
      hFlip={hFlip}
      icon={`${icon}${thickness === "regular" ? "" : "-".concat(thickness)}` || "ph:question"}
      vFlip={vFlip}
    />
  );
}
