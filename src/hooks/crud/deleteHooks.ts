import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AvailableEntityType, ResponseType } from "../../types";
import { baseURLS, FetchFunction, getEntityCRUDNotification, IconEnum, useNotifications } from "../../utils";

export function useDeleteEntity(type: AvailableEntityType, projectId: string, archive: boolean) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (data: { id: string }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}${type.toLowerCase()}${archive ? "/archive" : ""}/${data.id}`,
        method: "DELETE",
      });
    },
    {
      onError: (error: { message: string; ok: boolean }, __, context) => {
        createNotification({
          id: crypto.randomUUID(),
          title: error?.message || "There was an error updating this item.",
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
            title: getEntityCRUDNotification(type, archive ? "archive" : "delete"),
            variant: "success",
            icon: IconEnum.check,
            timer: 5,
          });
        }
      },
    },
  );
}
