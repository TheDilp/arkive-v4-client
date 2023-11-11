import { useMutation, useQueryClient } from "@tanstack/react-query";
import cloneDeep from "lodash.clonedeep";
import set from "lodash.set";

import {
  AllAvailableEntities,
  AvailableEntityType,
  AvailableSubEntityType,
  ConversationType,
  DictionaryType,
  MapLayers,
  MapPinType,
  MapType,
  MessageType,
  WordType,
} from "../../types";
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
      onSuccess: (data, vars) => {
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

export function useDeleteSubEntity(type: AvailableSubEntityType, project_id: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (vars: { data: { id: string; parent_id: string } }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/${vars.data.id}`,
        method: "DELETE",
      });
    },
    {
      onMutate: (vars) => {
        if (type === "map_pins" || type === "map_layers") {
          const old = queryClient.getQueryData<MapType>(["maps", vars.data.parent_id]);
          queryClient.setQueryData<{ data: MapType }>(["maps", vars.data.parent_id], (oldData) => {
            if (oldData) {
              const temp = cloneDeep(oldData);
              set(
                temp,
                `data.${type}`,
                ((temp?.data?.[type] as (MapLayers | MapPinType)[]) || [])?.filter((item) => item?.id !== vars.data.id),
              );
              return temp;
            }
            return oldData;
          });
          return { old };
        }
        if (type === "messages") {
          const old = queryClient.getQueryData<ConversationType>(["conversations", vars.data.parent_id]);
          queryClient.setQueryData<{ data: ConversationType }>(["conversations", vars.data.parent_id], (oldData) => {
            if (oldData) {
              const temp = cloneDeep(oldData);
              set(
                temp,
                `data.${type}`,
                ((temp?.data?.[type] as MessageType[]) || [])?.filter((item) => item?.id !== vars.data.id),
              );
              return temp;
            }
            return oldData;
          });
          return { old };
        }
        if (type === "words") {
          const old = queryClient.getQueryData<DictionaryType>(["dictionaries", vars.data.parent_id]);
          queryClient.setQueryData<{ data: DictionaryType }>(["dictionaries", vars.data.parent_id], (oldData) => {
            if (oldData) {
              const temp = cloneDeep(oldData);
              set(
                temp,
                `data.${type}`,
                ((temp?.data?.[type] as WordType[]) || [])?.filter((item) => item?.id !== vars.data.id),
              );
              return temp;
            }
            return oldData;
          });
          return { old };
        }
        return { old: {} };
      },
      onSuccess: (data) => {
        createNotification({
          title: data?.message || getEntityCRUDNotification(type, "delete"),
          variant: "success",
          icon: IconEnum.check,
          timer: 5,
        });
        queryClient.invalidateQueries({ queryKey: ["allEntities", project_id, type] });
      },
      onError: (_, vars, context) => {
        queryClient.setQueryData(["dictionaries", vars.data.parent_id], context?.old);
      },
    },
  );
}
export function useDeleteMany(type: AllAvailableEntities) {
  return useMutation(async (vars: { data: { ids: string[] } }) => {
    return FetchFunction({
      url: `${baseURLS.baseServer}/bulk/delete/${type.toLowerCase()}`,
      body: JSON.stringify(vars),
      method: "DELETE",
    });
  });
}
