import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AvailableEntityType, GraphType } from "../../types";
import { baseURLS, FetchFunction, getEntityCRUDNotification, IconEnum, useNotifications } from "../../utils";

export function useUpdateEntity<InsertType extends { data: { id?: string } }>(type: AvailableEntityType, project_id: string) {
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
      onSettled: (data) => {
        if (data.ok) {
          queryClient.invalidateQueries({ queryKey: ["allEntities", project_id, type] });

          createNotification({
            id: crypto.randomUUID(),
            title: getEntityCRUDNotification(type, "update"),
            variant: "success",
            icon: IconEnum.check,
            timer: 2,
          });
        } else
          createNotification({
            id: crypto.randomUUID(),
            title: "There was an error updating this item.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
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
          id: crypto.randomUUID(),
          title: "There was an error updating this item.",
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
      onSuccess: () => {
        createNotification({
          id: crypto.randomUUID(),
          title: getEntityCRUDNotification(subtype, "update"),
          variant: "success",
          icon: IconEnum.check,
          timer: 2,
        });
      },
    },
  );
}

export function useUpdateManyNodesPosition(item_id: string) {
  const queryClient = useQueryClient();
  return useMutation(
    async (updateItemValues: { id: string; x: number; y: number }[]) => {
      if (updateItemValues.length) {
        return FetchFunction({
          url: `${baseURLS.baseServer}/nodes/update/many/position`,
          body: JSON.stringify({ data: { nodes: updateItemValues } }),
          method: "POST",
        });
      }
      return null;
    },
    {
      onMutate: async (variables) => {
        const old = queryClient.getQueryData(["allEntities", "graphs", item_id]);
        queryClient.setQueryData(["allEntities", "graphs", item_id], (oldData: GraphType | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              nodes: oldData.nodes.map((subItem) => {
                const idx = variables.findIndex((varNode) => varNode.id === subItem.id);
                if (idx > -1) {
                  return { ...subItem, ...variables[idx] };
                }
                return subItem;
              }),
            };
          }
          return oldData;
        });
        return { old };
      },
      onError: (_, __, context) => {
        // toaster("error", "There was an error updating these items.");
        queryClient.setQueryData(["allEntities", "graphs", item_id], context?.old);
      },
    },
  );
}
