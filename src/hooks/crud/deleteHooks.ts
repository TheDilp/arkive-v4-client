import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AllAvailableEntities, AvailableEntityType, AvailableSubEntityType } from "../../types";
import { baseURLS, FetchFunction, getEntityCRUDNotification, IconEnum, useNotifications } from "../../utils";

export function useDeleteEntity(type: AvailableEntityType, project_id: string, archive: boolean) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (vars: { data: { id: string; parent_id?: string } }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}${archive ? "/archive" : ""}/${vars.data.id}`,
        method: "DELETE",
      });
    },
    {
      onSettled: (data, _, vars) => {
        if (data?.ok) {
          if (vars?.data?.parent_id) {
            queryClient.invalidateQueries([type, vars.data.parent_id]);
          } else {
            queryClient.invalidateQueries(["allEntities", project_id, type]);
          }

          createNotification({
            title: getEntityCRUDNotification(type, archive ? "archive" : "delete"),
            variant: "success",
            icon: IconEnum.check,
            timer: 5,
          });
        } else
          createNotification({
            title: data?.message || "There was an error updating this item.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    },
  );
}

export function useDeleteSubEntity(type: AvailableSubEntityType) {
  return useMutation(async (vars: { data: { id: string; parent_id?: string } }) => {
    return FetchFunction({
      url: `${baseURLS.baseServer}/${type.toLowerCase()}/${vars.data.id}`,
      method: "DELETE",
    });
  });
}
export function useDeleteMany(type: AllAvailableEntities) {
  return useMutation(async (vars: { data: { id: string }[] }) => {
    return FetchFunction({
      url: `${baseURLS.baseServer}/${type.toLowerCase()}`,
      body: JSON.stringify(vars),
      method: "DELETE",
    });
  });
}
