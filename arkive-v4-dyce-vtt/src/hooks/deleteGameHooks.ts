import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FetchFunction, getServerUrl, IconEnum, useNotifications } from "../../../utils";

export function useRemoveCharacterFromGame() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (id: string) => {
      const data = await FetchFunction({
        url: `${getServerUrl()}/games/remove/character/${id}`,
        method: "DELETE",
      });

      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey.includes("characters") });

        createNotification({
          title: data?.message || "Character removed successfully.",
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
          position: "top-right",
        });
      },
      onError: (error: { message?: string }) => {
        createNotification({
          title: error?.message || "There was an error with your request.",
          variant: "error",
          icon: IconEnum.error,
          timer: 2,
          position: "top-right",
        });
      },
    }
  );
}
