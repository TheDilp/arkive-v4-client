import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AvailableEntityType } from "../../types";
import { baseURLS, FetchFunction, getEntityCRUDNotification, IconEnum, useNotifications } from "../../utils";

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
          id: crypto.randomUUID(),
          title: "There was an error creating this project.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        }),

      // "error", "There was an error creating this project."),
      onSuccess: () => {
        queryClient.invalidateQueries(["allEntities", "project"]);
        createNotification({
          id: crypto.randomUUID(),
          title: "Project successfully created!",
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
        });
      },
    },
  );
}

export function useCreateEntity<InsertType extends { data: { project_id: string }; relations?: { [key: string]: any } }>(
  type: AvailableEntityType,
  isTemplate?: boolean,
) {
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
        console.log(data);
        if (data?.ok) {
          queryClient.invalidateQueries(["allEntities", vars.data.project_id, type]);
          createNotification({
            id: crypto.randomUUID(),
            title: data?.message || getEntityCRUDNotification(type, "create"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        } else {
          createNotification({
            id: crypto.randomUUID(),
            title: data?.message || "There was an error creating this entity.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
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
            id: crypto.randomUUID(),
            title: data?.message || getEntityCRUDNotification(type, "create"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        } else {
          createNotification({
            id: crypto.randomUUID(),
            title: data?.message || "There was an error creating these items.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
        }
      },
    },
  );
}

export function useCreateAdditionalFieldTemplate<InsertType extends { project_id: string }>() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (newItemValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/character_fields_templates/create`,
        body: JSON.stringify({
          data: newItemValues,
        }),
        method: "POST",
      });
    },
    {
      onError: () =>
        createNotification({
          id: crypto.randomUUID(),
          title: "There was an error creating this template.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        }),
      onSuccess: async (_, vars) => {
        queryClient.invalidateQueries({ queryKey: ["allEntities", vars.project_id, "character_fields_templates"] });
        createNotification({
          id: crypto.randomUUID(),
          title: getEntityCRUDNotification("character_fields_templates", "create"),
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
        });
      },
    },
  );
}
