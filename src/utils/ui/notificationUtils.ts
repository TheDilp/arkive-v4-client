import { useSetAtom } from "jotai";

import { AllAvailableEntities, NotificationType } from "../../types";
import { notificationsAtom } from "../atoms";
import { capitalizeFirstLetter } from "./textUtils";

export function useNotifications() {
  const setNotificationAtom = useSetAtom(notificationsAtom);

  return function createNotification(notification: Omit<NotificationType, "id">) {
    setNotificationAtom((prev) => [...prev, { ...notification, id: crypto.randomUUID() }]);
  };
}

export function removeNotification(setNotificationAtom: any, id: string) {
  setNotificationAtom((prev: NotificationType[]) => prev.filter((n) => n.id !== id));
}

export function getEntityCRUDNotification(type: AllAvailableEntities, action_type: "create" | "update" | "archive" | "delete") {
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
  if (type === "alter_names") return `Alter name successfully ${action}.`;
  if (type === "character_fields_templates") return `Template successfully ${action}.`;
  const entityTitle = capitalizeFirstLetter(type);
  return `${entityTitle} successfully ${action}.`;
}
