import { useMutation } from "@tanstack/react-query";

import { FetchFunction, getServerUrl, IconEnum, useNotifications } from "../../../utils";

export function useAddCharacterToGame() {
  // const queryClient = useQueryClient();
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
      onSuccess: (data) => {
        createNotification({
          title: data?.message || "Character added successfully.",
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
          position: "top-right",
        });
      },
      onError: (error: { message?: string }) => {
        createNotification({
          title: error?.message || "There was an error with your request.",
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
          position: "top-right",
        });
      },
    }
  );
}
