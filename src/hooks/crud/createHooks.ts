import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AvailableEntityType, AvailableSubEntityType } from "../../types";
import {
  baseURLS,
  FetchFunction,
  getEntityCRUDNotification,
  getParentEntityType,
  IconEnum,
  useNotifications,
} from "../../utils";

export function useCreateProject<InsertType>() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (newItemValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/projects/create`,
        body: JSON.stringify({
          data: newItemValues,
        }),
        method: "POST",
      });
    },
    {
      onError: () =>
        createNotification({
          title: "There was an error creating this project.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        }),

      // "error", "There was an error creating this project."),
      onSuccess: () => {
        queryClient.invalidateQueries(["allEntities", "project"]);
        createNotification({
          title: "Project successfully created!",
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
          position: "top-right",
        });
      },
    },
  );
}

export function useCreateEntity<
  InsertType extends { data: { parent_id?: string | null; project_id: string }; relations?: { [key: string]: any } },
>(type: AvailableEntityType, isTemplate?: boolean) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (newItemValues: InsertType) =>
      FetchFunction({
        url: isTemplate ? `${baseURLS.baseServer}/createfromtemplate` : `${baseURLS.baseServer}/${type}/create`,
        body: JSON.stringify(newItemValues),
        method: "POST",
      }),

    {
      onSettled: (data, _, vars) => {
        if (data?.ok) {
          if (vars?.data?.parent_id) {
            queryClient.invalidateQueries([type, vars.data.parent_id]);
          } else {
            queryClient.invalidateQueries(["allEntities", vars.data.project_id, type]);
          }
          createNotification({
            title: data?.message || getEntityCRUDNotification(type, "create"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
            position: "top-right",
          });
        } else {
          createNotification({
            title: "There was an error creating this entity.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
            position: "top-right",
          });
        }
      },
    },
  );
}

export function useCreateSubEntity<InsertType extends { data: { parent_id: string } }>(
  type: AvailableSubEntityType,
  project_id: string | undefined,
) {
  const queryClient = useQueryClient();
  return useMutation(
    async (updateItemValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/create`,
        body: JSON.stringify(updateItemValues),
        method: "POST",
      });
    },

    {
      onSuccess: (_, vars) => {
        const parentEntityType = getParentEntityType(type);
        if (parentEntityType && parentEntityType !== "documents") {
          queryClient.invalidateQueries(["allEntities", project_id, vars.data.parent_id]);
          queryClient.invalidateQueries([parentEntityType, vars.data.parent_id]);
        }
      },
    },
  );
}

export function useCreateEntities<InsertType extends { data: { [key: string]: any }[]; relations?: { [key: string]: any } }>(
  type: AvailableEntityType,
  project_id: string,
) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (newItemValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type}/create`,
        body: JSON.stringify(newItemValues),
        method: "POST",
      });
    },
    {
      onError: () => {},
      onSettled: (data) => {
        if (data.ok) {
          queryClient.invalidateQueries({ queryKey: ["allEntities", project_id, type] });

          createNotification({
            title: data?.message || getEntityCRUDNotification(type, "create"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
            position: "top-right",
          });
        } else {
          createNotification({
            title: data?.message || "There was an error creating these items.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
            position: "top-right",
          });
        }
      },
    },
  );
}

export function useCreateSubEntities<InsertType extends { data: { data: { parent_id: string } }[] }>(
  type: AvailableSubEntityType,
) {
  return useMutation(async (updateItemValues: InsertType) => {
    return FetchFunction({
      url: `${baseURLS.baseServer}/${type.toLowerCase()}/create`,
      body: JSON.stringify(updateItemValues),
      method: "POST",
    });
  });
}
