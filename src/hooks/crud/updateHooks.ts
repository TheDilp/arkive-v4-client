import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AvailableEntityType, ResponseType } from "../../types";
import { baseURLS, FetchFunction, getEntityCRUDNotification, IconEnum, useNotifications } from "../../utils";

export function useUpdateEntity<InsertType>(type: AvailableEntityType, projectId: string, id: string | undefined) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}${type.toLowerCase()}/update/${id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onError: () => {
        createNotification({
          id: crypto.randomUUID(),
          title: "There was an error updating this item.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: async (res: ResponseType) => {
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["allItems", projectId, type] });

          createNotification({
            id: crypto.randomUUID(),
            title: getEntityCRUDNotification(type, "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        }
      },
    },
  );
}
