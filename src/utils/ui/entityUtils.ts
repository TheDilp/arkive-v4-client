import { AvailableEntityType } from "../../types";
import { IconEnum } from "..";

export function getDefaultEntityIcon(type: AvailableEntityType) {
  if (type === "graphs") return IconEnum.board;
  return IconEnum.error;
}
