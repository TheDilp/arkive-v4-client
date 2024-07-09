import { useMutation, useQueryClient } from "@tanstack/react-query";
import cloneDeep from "lodash.clonedeep";
import set from "lodash.set";

import { AllAvailableEntities, AvailableEntityType, AvailableSubEntityType, ConversationType, MessageType } from "../../types";
import {
  baseURLS,
  FetchFunction,
  getEntityCRUDNotification,
  getSingularEntityType,
  IconEnum,
  useNotifications,
} from "../../utils";

export function useDeleteEntity(type: AvailableEntityType, project_id: string, arkive: boolean) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (vars: { data: { id: string; parent_id?: string } }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}${arkive ? "/arkive" : ""}/${vars.data.id}`,
        method: "DELETE",
        body: JSON.stringify({}),
      });
    },
    {
      onSuccess: (data, vars) => {
        if (data?.ok) {
          queryClient.invalidateQueries([type, vars.data.parent_id]);
          queryClient.invalidateQueries(["allEntities", project_id, type]);

          createNotification({
            title: getEntityCRUDNotification(type, arkive ? "arkive" : "delete"),
            variant: "success",
            icon: IconEnum.check,
            timer: 5,
          });
        } else if (!data?.role_access) {
          createNotification({
            title: `You do not have permission to delete this ${getSingularEntityType(type).toLowerCase()}.`,
            timer: 5,
            hasNoTruncate: true,
            variant: "error",
            icon: IconEnum.forbidden,
          });
        } else
          createNotification({
            title: data?.message || "There was an error deleting this item.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    }
  );
}

export function useDeleteSubEntity(type: AvailableSubEntityType, project_id: string, parent_id?: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (vars: { data: { id: string; parent_id: string } }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/${vars.data.id}`,
        method: "DELETE",
        body: JSON.stringify({}),
      });
    },
    {
      onMutate: (vars) => {
        if (type === "messages") {
          const old = queryClient.getQueryData<ConversationType>(["conversations", vars.data.parent_id]);
          queryClient.setQueryData<{ data: ConversationType }>(["conversations", vars.data.parent_id], (oldData) => {
            if (oldData) {
              const temp = cloneDeep(oldData);
              set(
                temp,
                `data.${type}`,
                ((temp?.data?.[type] as MessageType[]) || [])?.filter((item) => item?.id !== vars.data.id)
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
        if (type === "events") {
          queryClient.invalidateQueries(["allEntities", project_id, parent_id]);
        }
        if (type === "map_pins") {
          queryClient.invalidateQueries(["maps"]);
        }

        queryClient.invalidateQueries(["allEntities", project_id, type]);

        createNotification({
          title: data?.message || getEntityCRUDNotification(type, "delete"),
          variant: "success",
          icon: IconEnum.check,
          timer: 5,
        });
      },
      onError: (error: Error, vars, context) => {
        queryClient.setQueryData(["dictionaries", vars.data.parent_id], context?.old);
        createNotification({
          title: error.message,
          variant: "error",
          icon: IconEnum.error,
          timer: 5,
        });
      },
    }
  );
}
export function useDeleteMany(
  type: AllAvailableEntities,
  arkive: boolean,
  project_id?: string | undefined,
  parent_id?: string | undefined
) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (vars: { data: { ids: string[] } }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/bulk/${arkive ? "arkive" : "delete"}/${type.toLowerCase()}`,
        body: JSON.stringify(type === "images" ? { data: { ids: vars.data.ids, project_id } } : vars),
        method: "DELETE",
      });
    },

    {
      onSuccess: (data) => {
        if (data?.ok) {
          if (parent_id) {
            queryClient.invalidateQueries([type, parent_id]);
          } else {
            queryClient.invalidateQueries(["allEntities", project_id, type]);
          }

          createNotification({
            title: getEntityCRUDNotification(type, arkive ? "arkive" : "delete", true),
            variant: "success",
            icon: IconEnum.check,
            timer: 5,
          });
        } else
          createNotification({
            title: data?.message || "There was an error deleting this item.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    }
  );
}

export function useKickMember() {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (vars: { data: { user_id: string; project_id: string } }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/users/kick`,
        method: "POST",
        body: JSON.stringify(vars),
      });
    },
    {
      onSuccess: (data) => {
        if (data?.ok) {
          queryClient.invalidateQueries(["projects"]);

          createNotification({
            title: "User removed from project.",
            variant: "success",
            icon: IconEnum.check,
            timer: 5,
          });
        } else
          createNotification({
            title: "There was an error removing this user from this project.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    }
  );
}
