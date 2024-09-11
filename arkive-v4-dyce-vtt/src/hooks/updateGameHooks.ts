import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GamePermissionType } from "../../../types";
import { FetchFunction, getServerUrl, IconEnum, useNotifications } from "../../../utils";

export function useUpdateGameCharacterPermission() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (newItemValues: { data: { player_id: string; permission: GamePermissionType; related_id: string } }) => {
      const data = await FetchFunction({
        url: `${getServerUrl()}/games/update/character/permissions`,
        body: JSON.stringify(newItemValues),
        method: "POST",
      });

      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ predicate: (q) => q.queryKey.includes("characters") });
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
          variant: "error",
          icon: IconEnum.error,
          timer: 2,
          position: "top-right",
        });
      },
    }
  );
}
