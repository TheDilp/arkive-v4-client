import { MutationOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { RemirrorJSON } from "remirror";

import {
  AvailableEntityType,
  AvailableSubEntityType,
  ConversationType,
  DocumentType,
  EntityPermissionType,
  GraphType,
  MapType,
  MessagePlaceContentType,
  UserType,
} from "../../types";
import {
  baseURLS,
  FetchFunction,
  getEntityCRUDNotification,
  getParentEntityType,
  getSingularEntityType,
  IconEnum,
  MentionableEntites,
  useNotifications,
} from "../../utils";

export function useUpdateEntity<
  InsertType extends {
    data: { id?: string; parent_id?: string | null };
    relations?: { [key: string]: any };
  },
>(type: AvailableEntityType, project_id: string, options?: MutationOptions) {
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
      mutationKey: options?.mutationKey,
      onMutate: (vars) => {
        if (type !== "projects" && type !== "questionnaires" && type !== "documents") {
          const old = queryClient.getQueryData([type, vars.data.id]);

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
              }
            );
          }

          if (vars.data.parent_id) queryClient.invalidateQueries([type, vars.data.parent_id]);
          if (vars.data.id && type !== "documents" && type !== "maps") queryClient.invalidateQueries([type, vars.data.id]);

          // Invalidate mentions queries if this is a mentionable entity being updated
          if (MentionableEntites.includes(type)) {
            queryClient.invalidateQueries([type, vars.data.id, "mention"]);
          }
          if (type !== "documents") {
            createNotification({
              title: getEntityCRUDNotification(type, "update"),
              variant: "success",
              icon: IconEnum.check,
              timer: 2,
            });
          }
        } else if (!data?.role_access) {
          createNotification({
            title: `You do not have permission to edit this ${getSingularEntityType(type).toLowerCase()}.`,
            timer: 5,
            hasNoTruncate: true,
            variant: "error",
            icon: IconEnum.forbidden,
          });
        } else {
          createNotification({
            title: data?.message || "There was an error updating this item.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
        }
      },
    }
  );
}

export function useUpdateMapSubEntity<InsertType extends { data: { id?: string } }>(
  subtype: "map_pins" | "map_layers",
  parent_id: string
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
    }
  );
}
export function useUpdateGraphSubEntity<InsertType extends { data: { id?: string } }>(
  subtype: "nodes" | "edges",
  parent_id: string
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
    }
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
        body: JSON.stringify({
          data: {
            id: updateValues.data.id,
            content: updateValues.data.content,
          },
        }),
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
    }
  );
}

export function useUpdateSubEntity(
  type: AvailableSubEntityType,
  project_id: string | undefined,
  parent_id: string | undefined
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
    }
  );
}
export function useUpdateManySubEntities(type: AvailableSubEntityType) {
  return useMutation(async (updateItemValues: { data: { data: { [key: string]: any } }[] }) => {
    if (updateItemValues.data.length) {
      return FetchFunction({
        url: `${baseURLS.baseServer}/bulk/update/${type}`,
        body: JSON.stringify(updateItemValues),
        method: "POST",
      });
    }
    return null;
  });
}

export function useAddToEntity<
  InsertType extends { relations: { [key: string]: { id: string }[] } } | { data: { [key: string]: string[] } },
>(id: string, type: AvailableEntityType, project_id: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/resource/add/${id}`,
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
    }
  );
}

export function useRemoveFromEntity<
  InsertType extends { relations: { [key: string]: { id: string }[] } } | { data: { [key: string]: string[] } },
>(type: AvailableEntityType, id: string, project_id: string) {
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
    }
  );
}

export function useUpdateTags<
  InsertType extends {
    data: { id?: string; parent_id?: string | null };
    relations?: { [key: string]: any };
  },
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
              }
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
    }
  );
}

export function useUpdateManyPublic<InsertType extends { data: { ids: string[]; is_public: boolean } }>(
  type: AvailableEntityType | AvailableSubEntityType,
  project_id: string
) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/bulk/update/public/${type.toLowerCase()}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onError: () => {
        createNotification({
          title: "There was an error updating these items.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: (data) => {
        if (data.ok) {
          queryClient.invalidateQueries(["allEntities", project_id, type]);

          createNotification({
            title: getEntityCRUDNotification(type, "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        } else
          createNotification({
            title: data?.message || "There was an error updating these items.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    }
  );
}

// #region misc
export function useBulkUpdateTags(type: AvailableEntityType | AvailableSubEntityType, project_id: string, parent_id?: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (updateValues: {
      data: {
        add: { A: string; B: string }[];
        remove: { A: string; B: string }[];
      };
    }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/bulk/tags/${type.toLowerCase()}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onError: () => {
        createNotification({
          title: "There was an error updating these items.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: (data) => {
        if (data.ok) {
          const parentEntityType = getParentEntityType(type as AvailableSubEntityType);
          if (parentEntityType) {
            queryClient.invalidateQueries([parentEntityType, parent_id]);
          }
          queryClient.invalidateQueries(["allEntities", project_id, type]);

          createNotification({
            title: getEntityCRUDNotification(type, "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        } else
          createNotification({
            title: data?.message || "There was an error updating these items.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    }
  );
}
export function useBulkUpdate(project_id: string, type: AvailableEntityType | "blueprint_instances") {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (updateItemValues: {
      data: {
        data: { id: string; parent_id?: string | null; [key: string]: any };
      }[];
    }) => {
      if (updateItemValues.data.length) {
        return FetchFunction({
          url: `${baseURLS.baseServer}/bulk/update/${type}`,
          body: JSON.stringify(updateItemValues),
          method: "POST",
        });
      }
      return null;
    },
    {
      onSuccess: (data) => {
        if (data.ok) {
          queryClient.invalidateQueries(["allEntities", project_id, type]);

          createNotification({
            title: getEntityCRUDNotification(type, "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        } else
          createNotification({
            title: data?.message || "There was an error updating these items.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    }
  );
}
export function useBulkUpdateAccess(project_id: string | undefined, type: AvailableEntityType | AvailableSubEntityType) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (updateItemValues: {
      data: {
        permissions: (
          | Omit<EntityPermissionType, "code">
          | {
              related_id: string;
              permission_id: null;
              user_id: null;
              role_id: null;
            }
        )[];
      };
    }) => {
      if (updateItemValues.data.permissions.length) {
        const res = await FetchFunction({
          url: `${baseURLS.baseServer}/bulk/update/access/${type}`,
          body: JSON.stringify(updateItemValues),
          method: "POST",
        });
        if (!res?.role_access) {
          createNotification({
            title: "Only project owners or entity owners can update permissions.",
            timer: 5,
            hasNoTruncate: true,
            variant: "error",
            icon: IconEnum.forbidden,
          });
          return { data: [], message: "NO_ROLE_ACCESS", ok: false };
        }
        return res;
      }
      return { ok: false, message: "No entities selected." };
    },
    {
      onSuccess: (data) => {
        if (data.ok) {
          queryClient.invalidateQueries(["allEntities", project_id, type]);

          createNotification({
            title: getEntityCRUDNotification(type, "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        } else
          createNotification({
            title: data?.message || "There was an error updating these items.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    }
  );
}
export function useUpdateUser<
  InsertType extends {
    data?: Partial<Pick<UserType, "feature_flags">>;
    relations?: {
      feature_flags?: {
        project_id: string;
        feature_flags: UserType["feature_flags"];
      };
    };
  },
>(id: string, auth_id: string) {
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
    }
  );
}
export function useAssignRole<InsertType extends { data: { user_id: string; role_id: string } }>() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/users/assign_role`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onError: () => {
        createNotification({
          title: "There was an error assigning this role for this user.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries(["user"]);
        if (data.ok) {
          createNotification({
            title: data?.message || "Role succesfully assigned to user.",
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        } else
          createNotification({
            title: data?.message || "There was an error assigning this role for this user.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    }
  );
}
export function useReadNotification(project_id: string, isReadAll: boolean) {
  const queryClient = useQueryClient();

  return useMutation(
    async (updateValues: { data: { user_id: string; notification_id: string } }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/notifications/read${isReadAll ? `/${project_id}/${updateValues.data.user_id}` : ""}`,
        body: isReadAll ? "{}" : JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["notifications"]);
      },
    }
  );
}

// #endregion misc
