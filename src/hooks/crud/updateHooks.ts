import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AvailableEntityType, AvailableSubEntityType, GraphType, MapType } from "../../types";
import { RandomTableOptionType } from "../../types/EntityTypes/randomTableTypes";
import { baseURLS, FetchFunction, getEntityCRUDNotification, IconEnum, useNotifications } from "../../utils";

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
        const old = queryClient.getQueryData([type, vars.data.id]);
        if (type !== "documents") {
          queryClient.setQueryData<{ data: any }>([type, vars.data.id], (oldData) => {
            if (oldData?.data)
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  ...vars.data,
                  ...vars.relations,
                },
              };
            return oldData;
          });
        }
        return { old };
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
          if (vars.data.parent_id) queryClient.invalidateQueries([type, vars.data.parent_id]);

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

export function useUpdateRandomTableOption(parent_id: string | undefined, project_id: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: { data: Partial<RandomTableOptionType> }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/random_table_options/update/${updateValues?.data?.id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onSettled: (data) => {
        queryClient.invalidateQueries(["allEntities", project_id, "random_table_options", parent_id]);
        if (data?.ok)
          createNotification({
            title: getEntityCRUDNotification("random_table_options", "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
      },
    },
  );
}

export function useUpdateSubEntity(type: AvailableSubEntityType) {
  return useMutation(async (updateItemValues: { [key: string]: any }) => {
    return FetchFunction({
      url: `${baseURLS.baseServer}/${type}/update/${updateItemValues.data.id}`,
      body: JSON.stringify(updateItemValues),
      method: "POST",
    });
  });
}
export function useUpdateManySubEntities(type: AvailableSubEntityType) {
  return useMutation(async (updateItemValues: { data: { [key: string]: any }[] }) => {
    if (updateItemValues.data.length) {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type}/update`,
        body: JSON.stringify(updateItemValues),
        method: "POST",
      });
    }
    return null;
  });
}

export function useAddToEntity<InsertType extends { data: { id?: string }; relations: { [key: string]: { id: string }[] } }>(
  type: AvailableEntityType,
  project_id: string,
) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/add/${updateValues?.data?.id}`,
        body: JSON.stringify(updateValues),
        method: "POST",
      });
    },
    {
      onSettled: (data, _, vars) => {
        if (data.ok) {
          queryClient.invalidateQueries(["allEntities", project_id, type]);
          queryClient.invalidateQueries([type, vars.data.id]);

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
