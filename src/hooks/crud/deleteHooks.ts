import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AvailableEntityType } from "../../types";
import { baseURLS, FetchFunction, getEntityCRUDNotification, IconEnum, useNotifications } from "../../utils";

export function useDeleteEntity(type: AvailableEntityType, project_id: string, archive: boolean) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (data: { id: string }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}${archive ? "/archive" : ""}/${data.id}`,
        method: "DELETE",
      });
    },
    {
      onSettled: (data) => {
        if (data?.ok) {
          queryClient.invalidateQueries({ queryKey: ["allEntities", project_id, type] });
          createNotification({
            id: crypto.randomUUID(),
            title: getEntityCRUDNotification(type, archive ? "archive" : "delete"),
            variant: "success",
            icon: IconEnum.check,
            timer: 5,
          });
        } else
          createNotification({
            id: crypto.randomUUID(),
            title: data?.message || "There was an error updating this item.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    },
  );
}
