import { useSetAtom } from "jotai";

import { AllAvailableEntities, AssetType, NotificationType } from "../../types";
import { notificationsAtom } from "../atoms";
import { capitalizeFirstLetter, getSingularEntityType } from "./textUtils";

export function useNotifications() {
  const setNotificationAtom = useSetAtom(notificationsAtom);

  return function createNotification(notification: Omit<NotificationType, "id">) {
    setNotificationAtom((prev) => [...prev, { ...notification, id: crypto.randomUUID() }]);
  };
}

export function removeNotification(setNotificationAtom: any, id: string) {
  setNotificationAtom((prev: NotificationType[]) => prev.filter((n) => n.id !== id));
}

export function getEntityCRUDNotification(
  type: AllAvailableEntities | AssetType,
  action_type: "create" | "update" | "archive" | "delete",
) {
  let action = "";
  if (action_type === "create") {
    action = "created";
  } else if (action_type === "update") {
    action = "updated";
  }
  if (action_type === "archive") {
    action = "archived";
  }
  if (action_type === "delete") {
    action = "deleted";
  }
  const singularName = capitalizeFirstLetter(getSingularEntityType(type));
  return `${singularName} successfully ${action}`;
}
