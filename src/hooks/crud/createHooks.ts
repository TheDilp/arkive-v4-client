import { QueryErrorResetBoundary, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FetchFunction,
  IconEnum,
  ResponseErrorMessageEnum,
  baseURLS,
  getEntityCRUDNotification,
  useNotifications,
} from "../../utils";
import { AvailableEntityType, ResponseErrorType } from "../../types";

export function useCreateProject<InsertType>() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (newItemValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}projects/create`,
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
        queryClient.invalidateQueries(["allItems", "project"]);
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
    async (newItemValues: InsertType) => {
      return FetchFunction({
        url: isTemplate ? `${baseURLS.baseServer}createfromtemplate` : `${baseURLS.baseServer}${type}/create`,
        body: JSON.stringify(newItemValues),
        method: "POST",
      });
    },
    {
      onError: () =>
        createNotification({
          id: crypto.randomUUID(),
          title: "There was an error creating this item.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        }),
      onSuccess: (_, vars) => {
        queryClient.invalidateQueries({ queryKey: ["allItems", vars.data.project_id, type] });

        createNotification({
          id: crypto.randomUUID(),
          title: getEntityCRUDNotification(type, "create"),
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
        });
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
        url: `${baseURLS.baseServer}${type}/create`,
        body: JSON.stringify(newItemValues),
        method: "POST",
      });
    },
    {
      onError: (error: string) => {
        createNotification({
          id: crypto.randomUUID(),
          title: "There was an error creating these items.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["allItems", project_id, type] });

        createNotification({
          id: crypto.randomUUID(),
          title: getEntityCRUDNotification(type, "create"),
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
        });
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
        url: `${baseURLS.baseServer}characterfieldstemplates/create`,
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
        queryClient.invalidateQueries({ queryKey: ["allItems", vars.project_id, "characterFieldsTemplates"] });
        createNotification({
          id: crypto.randomUUID(),
          title: getEntityCRUDNotification("characterFieldsTemplates", "create"),
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
        });
      },
    },
  );
}
