import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FetchFunction, getServerUrl, IconEnum, useNotifications } from "../../../utils";

export function useAddCharacterToGame() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (newItemValues: { game_id: string; related_id: string }) => {
      const data = await FetchFunction({
        url: `${getServerUrl()}/games/add/character`,
        body: JSON.stringify({ data: newItemValues }),
        method: "POST",
      });

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey.includes("characters") });
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
