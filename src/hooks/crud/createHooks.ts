import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";

import {
  AvailableEntityType,
  AvailableSubEntityType,
  EdgeType,
  GraphType,
  MapLayerType,
  MapPinType,
  MapType,
  NodeType,
} from "../../types";
import {
  baseURLS,
  edgesAtom,
  FetchFunction,
  getEntityCRUDNotification,
  getParentEntityType,
  IconEnum,
  nodesAtom,
  useNotifications,
} from "../../utils";

export function useCreateProject<InsertType>() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (newItemValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/projects/create`,
        body: JSON.stringify(newItemValues),
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
      onSuccess: (data, vars) => {
        if (data?.ok) {
          if (vars?.data?.parent_id) {
            queryClient.invalidateQueries([type, vars.data.parent_id]);
          } else if (type === "character_relationship_types") {
            queryClient.invalidateQueries(["projects", vars.data.project_id]);
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
    },
  );
}

export function useCreateSubEntity<InsertType extends { data: { parent_id: string } }>(
  type: AvailableSubEntityType,
  project_id: string | undefined,
) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);
  return useMutation(
    async (updateItemValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/create`,
        body: JSON.stringify(updateItemValues),
        method: "POST",
      });
    },

    {
      onMutate: (vars) => {
        const parentEntityType = getParentEntityType(type);

        if (parentEntityType === "maps") {
          if ("character_id" in vars.data && !vars.data.character_id) {
            const old = queryClient.getQueryData([parentEntityType, vars.data.parent_id]);
            queryClient.setQueryData<{ data: MapType }>([parentEntityType, vars.data.parent_id], (oldData) =>
              oldData
                ? {
                    ...oldData,
                    data: {
                      ...oldData?.data,
                      [type]: (oldData.data?.[type as "map_pins" | "map_layers"] || []).concat(
                        vars.data as MapPinType | MapLayerType,
                      ),
                    },
                  }
                : oldData,
            );

            return { old };
          }
        }

        if (parentEntityType === "graphs") {
          const old = queryClient.getQueryData([parentEntityType, vars.data.parent_id]);
          queryClient.setQueryData<{ data: GraphType }>([parentEntityType, vars.data.parent_id], (oldData) =>
            oldData
              ? {
                  ...oldData,
                  data: {
                    ...oldData?.data,
                    [type]: (oldData.data?.[type as "nodes" | "edges"] || []).concat(vars.data as NodeType | EdgeType),
                  },
                }
              : oldData,
          );
          if (type === "nodes") setNodes((prev) => [...(prev || []), vars.data as NodeType]);
          if (type === "edges") setEdges((prev) => [...(prev || []), vars.data as EdgeType]);
          return { old };
        }

        return { old: {} };
      },
      onError: (_, vars, context) => {
        const parentEntityType = getParentEntityType(type);
        if (parentEntityType === "graphs") {
          queryClient.setQueryData([parentEntityType, vars.data.parent_id], context?.old);
        }
      },
      onSuccess: (data, vars) => {
        const parentEntityType = getParentEntityType(type);
        if (
          parentEntityType &&
          parentEntityType !== "documents" &&
          parentEntityType !== "maps" &&
          parentEntityType !== "graphs"
        ) {
          queryClient.invalidateQueries(["allEntities", project_id, vars.data.parent_id]);
          queryClient.invalidateQueries([parentEntityType, vars.data.parent_id]);
        }
        if (type === "blueprint_instances") {
          queryClient.invalidateQueries(["allEntities", project_id, type]);
        }
        createNotification({
          title: data?.message || getEntityCRUDNotification(type, "create"),
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
          position: "top-right",
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

// #region misc
export function useGenerateGraph<
  InsertType extends { data: { project_id: string }; relations: { nodes: any[]; edges: any[] } },
>() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  const navigate = useNavigate();

  return useMutation(
    async (newGraph: InsertType) =>
      FetchFunction({
        url: `${baseURLS.baseServer}/graphs/generate`,
        body: JSON.stringify(newGraph),
        method: "POST",
      }),

    {
      onSuccess: (data: { data: { id: string } }, vars) => {
        queryClient.invalidateQueries(["allEntities", vars.data.project_id, "graphs"]);
        navigate(`/projects/${vars.data.project_id}/graphs/${data.data.id}`);
      },
      onError: () => {
        createNotification({
          title: "There was an error creating this graph.",
          variant: "error",
          timer: 3,
          icon: IconEnum.error,
        });
      },
    },
  );
}
export function useGenerateDocument<
  InsertType extends { data: { title: string; project_id: string; parent_id?: string; content?: string } },
>(type: "conversations" | "documents") {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  const navigate = useNavigate();
  return useMutation(
    async (newGraph: InsertType) =>
      FetchFunction({
        url: `${baseURLS.baseServer}/documents/generate/${type}`,
        body: JSON.stringify(newGraph),
        method: "POST",
      }),

    {
      onSuccess: (data: { data: { id: string } }, vars) => {
        queryClient.invalidateQueries(["allEntities", vars.data.project_id, "documents"]);
        navigate(`/projects/${vars.data.project_id}/documents/${data.data.id}`);
      },
      onError: () => {
        createNotification({
          title: "There was an error creating this document.",
          variant: "error",
          timer: 3,
          icon: IconEnum.error,
        });
      },
    },
  );
}
export function useInviteUserToProject() {
  const createNotification = useNotifications();

  return useMutation(
    async (newGraph: { data: { project_id: string; email: string } }) =>
      FetchFunction({
        url: `${baseURLS.baseServer}/users/invite`,
        body: JSON.stringify(newGraph),
        method: "POST",
      }),

    {
      onSuccess: () => {
        createNotification({
          title: "Invitation sent.",
          variant: "success",
          timer: 3,
          icon: IconEnum.send,
        });
      },
      onError: (error: { message: string }) => {
        createNotification({
          title: error?.message || "There was an error sending this invite.",
          variant: "error",
          timer: 3,
          icon: IconEnum.error,
        });
      },
    },
  );
}
export function useCreateWebhook() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (newItemValues: { data: { title: string; url: string; user_id: string } }) =>
      FetchFunction({
        url: `${baseURLS.baseServer}/webhooks/create`,
        body: JSON.stringify(newItemValues),
        method: "POST",
      }),

    {
      onSuccess: (data) => {
        if (data?.ok) {
          queryClient.invalidateQueries(["allEntities", undefined, "webhooks"]);
          queryClient.invalidateQueries(["user"]);

          createNotification({
            title: data?.message || getEntityCRUDNotification("webhooks", "create"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
            position: "top-right",
          });
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
    },
  );
}
// #endregion misc
