import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { RemirrorJSON } from "remirror";

import {
  AvailableEntityType,
  AvailableSubEntityType,
  ConversationType,
  DocumentType,
  GraphType,
  MapType,
  MessagePlaceContentType,
  UserType,
} from "../../types";
import {
  baseURLS,
  edgesAtom,
  FetchFunction,
  getEntityCRUDNotification,
  getParentEntityType,
  IconEnum,
  MentionableEntites,
  nodesAtom,
  useNotifications,
} from "../../utils";

export function useUpdateEntity<
  InsertType extends { data: { id?: string; parent_id?: string | null }; relations?: { [key: string]: any } },
>(type: AvailableEntityType, project_id: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/update/${updateValues?.data?.id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onMutate: (vars) => {
        if (type !== "projects") {
          const old = queryClient.getQueryData([type, vars.data.id]);
          if (type !== "documents") {
            queryClient.setQueryData<{ data: any }>([type, vars.data.id], (oldData) => {
              if (oldData?.data)
                return {
                  ...oldData,
                  data: {
                    ...oldData.data,
                    ...vars.data,
                    ...Object.values(vars.relations || {}).map((rel) => rel?.data),
                  },
                };
              return oldData;
            });
          }
          return { old };
        }
        return {};
      },

      onError: (_, vars, context) => {
        queryClient.setQueryData([type, vars.data.id], context?.old);

        createNotification({
          title: "There was an error updating this item.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: (data, vars) => {
        if (data.ok) {
          queryClient.invalidateQueries(["allEntities", project_id, type]);

          // Invalidating a document causes the editor to refetch while open
          // if (type !== "documents") queryClient.invalidateQueries([type, vars.data.id]);
          if (type === "documents") {
            queryClient.setQueryData<{ data: DocumentType }>(["documents", vars.data.id, "content"], (old) =>
              //! Omit -> never allow document content to be changed through query client

              {
                return old
                  ? {
                      ...old,
                      data: {
                        ...old.data,
                        ...vars.data,
                        content:
                          "content" in vars.data && vars.data?.content ? (vars.data.content as RemirrorJSON) : old.data.content,
                      },
                    }
                  : old;
              },
            );
          }

          if (vars.data.parent_id) queryClient.invalidateQueries([type, vars.data.parent_id]);
          if (vars.data.id && type !== "documents") queryClient.invalidateQueries([type, vars.data.id]);

          // Invalidate mentions queries if this is a mentionable entity being updated
          if (MentionableEntites.includes(type)) {
            queryClient.invalidateQueries([type, vars.data.id, "mention"]);
          }

          createNotification({
            title: getEntityCRUDNotification(type, "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
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

export function useUpdateMapSubEntity<InsertType extends { data: { id?: string } }>(
  subtype: "map_pins" | "map_layers",
  parent_id: string,
) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${subtype.toLowerCase()}/update/${updateValues?.data?.id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onMutate: (vars) => {
        const old = queryClient.getQueryData(["maps", parent_id]);
        queryClient.setQueryData<{ data: MapType }>(["maps", parent_id], (oldData) => {
          if (oldData?.data)
            return {
              ...oldData,
              data: {
                ...oldData.data,
                [subtype]: (oldData.data[subtype] || []).map((subitem) => {
                  if (subitem.id === vars.data.id) return { ...subitem, ...vars.data };
                  return subitem;
                }),
              },
            };
          return oldData;
        });

        return { old };
      },

      onError: (_, __, context) => {
        queryClient.setQueryData(["maps", parent_id], context?.old);

        createNotification({
          title: "There was an error updating this item.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: () => {
        createNotification({
          title: getEntityCRUDNotification(subtype, "update"),
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
        });
      },
    },
  );
}
export function useUpdateGraphSubEntity<InsertType extends { data: { id?: string } }>(
  subtype: "nodes" | "edges",
  parent_id: string,
) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${subtype.toLowerCase()}/update/${updateValues?.data?.id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onMutate: (vars) => {
        const old = queryClient.getQueryData(["graphs", parent_id]);
        queryClient.setQueryData<{ data: GraphType }>(["graphs", parent_id], (oldData) => {
          if (oldData?.data)
            return {
              ...oldData,
              data: {
                ...oldData.data,
                [subtype]: oldData.data[subtype].map((subitem) => {
                  if (subitem.id === vars.data.id) return { ...subitem, ...vars.data };
                  return subitem;
                }),
              },
            };
          return oldData;
        });

        return { old };
      },

      onError: (_, __, context) => {
        queryClient.setQueryData(["graphs", parent_id], context?.old);

        createNotification({
          title: "There was an error updating this item.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: () => {
        createNotification({
          title: getEntityCRUDNotification(subtype, "update"),
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
        });
      },
    },
  );
}
export function useUpdateMessageSubEntity<
  InsertType extends {
    data: { id: string } & (
      | { type: "character" | "narration"; content: RemirrorJSON }
      | { type: "place"; content: MessagePlaceContentType }
    );
  },
>(parent_id: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/messages/update/${updateValues?.data?.id}`,
        body: JSON.stringify({ data: { id: updateValues.data.id, content: updateValues.data.content } }),
        method: "POST",
      });
    },
    {
      onMutate: (vars) => {
        const old = queryClient.getQueryData(["conversations", parent_id]);
        queryClient.setQueryData<{ data: ConversationType }>(["conversations", parent_id], (oldData) => {
          if (oldData?.data)
            return {
              ...oldData,
              data: {
                ...oldData.data,
                messages: (oldData.data?.messages || []).map((subitem) => {
                  if (subitem.id === vars.data.id) return { ...subitem, ...vars.data };
                  return subitem;
                }),
              },
            };
          return oldData;
        });

        return { old };
      },
      onError: (_, __, context) => {
        queryClient.setQueryData(["conversations", parent_id], context?.old);

        createNotification({
          title: "There was an error updating this item.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: () => {
        createNotification({
          title: getEntityCRUDNotification("messages", "update"),
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
        });
      },
    },
  );
}

export function useUpdateSubEntity(
  type: AvailableSubEntityType,
  project_id: string | undefined,
  parent_id: string | undefined,
) {
  const createNotification = useNotifications();

  const queryClient = useQueryClient();
  return useMutation(
    async (updateItemValues: { [key: string]: any }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type}/update/${updateItemValues.data.id}`,
        body: JSON.stringify(updateItemValues),
        method: "POST",
      });
    },
    {
      onSuccess: (_, vars) => {
        const parentEntityType = getParentEntityType(type);

        if (parentEntityType && parentEntityType !== "documents") {
          if (type === "blueprint_instances" || type === "random_table_options") {
            queryClient.invalidateQueries(["allEntities", project_id, type]);
            queryClient.invalidateQueries([type, vars.data.id]);
          } else {
            queryClient.invalidateQueries(["allEntities", project_id, parent_id]);
            queryClient.invalidateQueries([parentEntityType, parent_id]);
          }
        }
        createNotification({
          title: getEntityCRUDNotification(type, "update"),
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
        });
      },
    },
  );
}
export function useUpdateManySubEntities(type: AvailableSubEntityType, parent_id: string, isNotOptimisticUpdating?: boolean) {
  const queryClient = useQueryClient();
  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);
  return useMutation(
    async (updateItemValues: { data: { data: { id: string; parent_id?: string; [key: string]: any } }[] }) => {
      if (updateItemValues.data.length) {
        return FetchFunction({
          url: `${baseURLS.baseServer}/${type}/update`,
          body: JSON.stringify(updateItemValues),
          method: "POST",
        });
      }
      return null;
    },

    {
      onMutate: (vars) => {
        const parentEntityType = getParentEntityType(type);

        if (parentEntityType === "graphs" && !isNotOptimisticUpdating) {
          const old = queryClient.getQueryData<{ data: GraphType }>([parentEntityType, parent_id]);
          const newData = old
            ? {
                ...old,
                data: {
                  ...old?.data,
                  [type]: (old.data?.[type as "nodes" | "edges"] || []).map((item) => {
                    const idx = vars.data.findIndex((updatedItem) => updatedItem.data.id === item.id);
                    if (idx > -1) {
                      return { ...item, ...vars.data[idx].data };
                    }
                    return item;
                  }),
                },
              }
            : old;
          queryClient.setQueryData<{ data: GraphType }>([parentEntityType, parent_id], newData);
          if (type === "nodes") setNodes((prev) => newData?.data?.nodes || prev);
          if (type === "edges") setEdges((prev) => newData?.data?.edges || prev);
          return { old };
        }
        return { old: {} };
      },
      onError: (_, __, context) => {
        const parentEntityType = getParentEntityType(type);
        if (parentEntityType === "graphs") {
          queryClient.setQueryData([parentEntityType, parent_id], context?.old);
        }
      },
    },
  );
}

export function useAddToEntity<InsertType extends { relations: { [key: string]: { id: string }[] } }>(
  id: string,
  type: AvailableEntityType,
  project_id: string,
) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/add/${id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onSettled: (data) => {
        if (data.ok) {
          queryClient.invalidateQueries(["allEntities", project_id, type]);
          queryClient.invalidateQueries([type, id]);

          createNotification({
            title: data?.message || "Items successfully added.",
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
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
export function useRemoveFromEntity<InsertType extends { relations: { [key: string]: { id: string }[] } }>(
  type: AvailableEntityType,
  id: string,
  project_id: string,
) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/remove/${id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onSettled: (data) => {
        if (data.ok) {
          queryClient.invalidateQueries(["allEntities", project_id, type]);
          queryClient.invalidateQueries([type, id]);

          createNotification({
            title: data?.message || "Item successfully removed.",
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
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

export function useUpdateTags<
  InsertType extends { data: { id?: string; parent_id?: string | null }; relations?: { [key: string]: any } },
>(type: AvailableEntityType | AvailableSubEntityType, project_id: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/update/${updateValues?.data?.id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onError: () => {
        createNotification({
          title: "There was an error updating this item.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: (data, vars) => {
        if (data.ok) {
          queryClient.invalidateQueries(["allEntities", project_id, type]);

          // Invalidating a document causes the editor to refetch while open
          // if (type !== "documents") queryClient.invalidateQueries([type, vars.data.id]);
          if (type === "documents") {
            queryClient.setQueryData<{ data: DocumentType }>(["documents", vars.data.id, "content"], (old) =>
              //! Omit -> never allow document content to be changed through query client

              {
                return old
                  ? {
                      ...old,
                      data: {
                        ...old.data,
                        ...vars.data,
                        content:
                          "content" in vars.data && vars.data?.content ? (vars.data.content as RemirrorJSON) : old.data.content,
                      },
                    }
                  : old;
              },
            );
          }

          if (vars.data.parent_id) queryClient.invalidateQueries([type, vars.data.parent_id]);
          if (vars.data.id && type !== "documents") queryClient.invalidateQueries([type, vars.data.id]);

          // Invalidate mentions queries if this is a mentionable entity being updated
          if (MentionableEntites.includes(type)) {
            queryClient.invalidateQueries([type, vars.data.id, "mention"]);
          }

          createNotification({
            title: getEntityCRUDNotification(type, "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
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

export function useUpdateUser<InsertType extends { data: Pick<UserType, "feature_flags"> }>(id: string, auth_id: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/users/update/${id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onError: () => {
        createNotification({
          title: "There was an error updating this item.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries(["user", auth_id]);
        if (data.ok) {
          createNotification({
            title: data?.message || "User succesfully updated.",
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        } else
          createNotification({
            title: data?.message || "There was an error updating this user.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    },
  );
}
