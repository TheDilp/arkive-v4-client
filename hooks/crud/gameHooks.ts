import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GamePlayerRoleType, GamePlayerType } from "../../types";
import { FetchFunction, getEntityCRUDNotification, getServerUrl, IconEnum, useNotifications } from "../../utils";
import { UpdatePlayerType } from "../../validation";

export function useAddPlayer<InsertType extends { data: Omit<GamePlayerType, "id"> & { role: GamePlayerRoleType } }>() {
  const createNotification = useNotifications();
  const queryClient = useQueryClient();
  return useMutation(
    async (newItemValues: InsertType) => {
      const data = await FetchFunction({
        url: `${getServerUrl()}/games/add/player`,
        body: JSON.stringify(newItemValues),
        method: "POST",
      });

      return data;
    },

    {
      onSuccess: (data) => {
        if (data?.ok) {
          createNotification({
            title: data?.message || getEntityCRUDNotification("players", "create"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
            position: "top-right",
          });
          queryClient.invalidateQueries({ predicate: (q) => q.queryKey.includes("games") });
        }
      },
      onError: (error: { message?: string }) => {
        createNotification({
          title: error?.message || "There was an error creating this entity.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
          position: "top-right",
        });
      },
    }
  );
}

export function useRemovePlayer(id: string) {
  const createNotification = useNotifications();
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const data = await FetchFunction({
        url: `${getServerUrl()}/games/remove/player/${id}`,
        method: "DELETE",
      });

      return data;
    },

    {
      onSuccess: (data) => {
        if (data?.ok) {
          createNotification({
            title: data?.message || getEntityCRUDNotification("players", "delete"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
            position: "top-right",
          });
          queryClient.invalidateQueries({ predicate: (q) => q.queryKey.includes("games") });
        }
      },
      onError: (error: { message?: string }) => {
        createNotification({
          title: error?.message || "There was an error creating this entity.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
          position: "top-right",
        });
      },
    }
  );
}

export function useUpdatePlayer(id: string | undefined) {
  const createNotification = useNotifications();
  const queryClient = useQueryClient();
  return useMutation(
    async (vars: UpdatePlayerType) => {
      const data = await FetchFunction({
        url: `${getServerUrl()}/players/update/${id}`,
        body: JSON.stringify(vars),
        method: "POST",
      });

      return data;
    },

    {
      onSuccess: (data) => {
        if (data?.ok) {
          createNotification({
            title: data?.message || getEntityCRUDNotification("players", "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
            position: "top-right",
          });
          queryClient.invalidateQueries({ predicate: (q) => q.queryKey.includes("games") });
        }
      },
      onError: (error: { message?: string }) => {
        createNotification({
          title: error?.message || "There was an error creating this entity.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
          position: "top-right",
        });
      },
    }
  );
}
