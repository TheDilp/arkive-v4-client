import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AvailableEntityType } from "../../types";
import { baseURLS, FetchFunction, getEntityCRUDNotification, IconEnum, useNotifications } from "../../utils";

export function useUpdateEntity<InsertType extends { data: { id?: string } }>(type: AvailableEntityType, project_id: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/update/${updateValues?.data?.id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onSettled: (data) => {
        if (data.ok) {
          queryClient.invalidateQueries({ queryKey: ["allEntities", project_id, type] });

          createNotification({
            id: crypto.randomUUID(),
            title: getEntityCRUDNotification(type, "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        } else
          createNotification({
            id: crypto.randomUUID(),
            title: "There was an error updating this item.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    },
  );
}
