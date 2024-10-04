import { useInfiniteQuery, useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { saveAs } from "file-saver";

import { AssetType, EntityPermissionType, RequestBodyType } from "../../types";
import { ImageType } from "../../types/EntityTypes/imageTypes";
import { baseURLS, FetchFunction, getEntityCRUDNotification, getServerUrl, IconEnum, useNotifications } from "../../utils";

export function useUploadAsset(type: AssetType, project_id: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (images: File[]) => {
      const formData = new FormData();

      for (let index = 0; index < images.length; index += 1) {
        formData.append(images[index].name, images[index], images[index].name);
      }

      return FetchFunction({
        url: `${baseURLS.baseAssetServer}/upload/${project_id}/${type}`,
        body: formData,
        method: "POST",
      });
    },
    {
      onSettled: (data) => {
        if (data?.ok) {
          createNotification({
            title: data?.message || `${type === "images" ? "Images" : "Maps"} uploaded successfully.`,
            variant: "success",
            icon: IconEnum.check_circle,
            timer: 5,
          });
          queryClient.invalidateQueries(["allEntities", project_id, type]);
        } else {
          createNotification({
            title: "There was an error uploading the image(s).",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
        }
      },
    }
  );
}

export function useUploadAvatar(id: string, isAvatarUpload?: boolean, project_id?: string) {
  const createNotification = useNotifications();
  const queryClient = useQueryClient();
  return useMutation(
    async (images: File[]) => {
      const formData = new FormData();

      for (let index = 0; index < images.length; index += 1) {
        formData.append(images[index].name, images[index], images[index].name);
      }

      return FetchFunction({
        url: `${baseURLS.baseAssetServer}/upload/${isAvatarUpload ? "users/avatar" : `gateway/${project_id}/${id}`}`,
        body: formData,
        method: "POST",
      });
    },
    {
      onSettled: (data) => {
        if (data?.ok) {
          if (IS_GATEWAY) {
            queryClient.invalidateQueries(["characters"]);
          }

          createNotification({
            title: data?.message || "Images uploaded successfully.",
            variant: "success",
            icon: IconEnum.check_circle,
            timer: 5,
          });
        } else {
          createNotification({
            title: "There was an error uploading the image(s).",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
        }
      },
    }
  );
}

export function useGetImages<InsertType>(
  project_id: string,
  type: AssetType,
  request: RequestBodyType<InsertType>,
  options?: UseQueryOptions<{ data: ImageType[] }, any, { data: ImageType[] }> & {
    prefetch?: boolean;
    queryKeyConcat?: string[];
    queryKeyOverwrite?: string[];
  }
) {
  const baseQueryKey = [
    "allEntities",
    project_id,
    type,
    request.data?.item_id || request.data?.parent_id,
    request?.filters,
    request?.relationFilters,
    request?.orderBy,
  ];
  let mainRequestQueryKey = [...baseQueryKey];
  async function queryFn(finalRequest: RequestBodyType<InsertType>) {
    return FetchFunction({
      method: "POST",
      body: JSON.stringify(finalRequest),
      url: IS_GATEWAY
        ? `${getServerUrl()}/assets/${request?.data?.entity_type}/${request?.data?.access_id}`
        : `${getServerUrl()}/assets/${type}`,
    });
  }
  const configuredOptions = {
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime || 5 * 1000,
    select: options?.select,
  };
  const queryClient = useQueryClient();

  if (typeof request?.pagination?.page === "number") {
    mainRequestQueryKey = mainRequestQueryKey.concat(request?.pagination);
  }

  if (options?.queryKeyConcat) {
    mainRequestQueryKey = mainRequestQueryKey.concat(options.queryKeyOverwrite);
  }

  if (options?.queryKeyOverwrite) {
    mainRequestQueryKey = options.queryKeyOverwrite;
  }

  const res = useQuery<{ data: ImageType[] }, unknown>(mainRequestQueryKey, async () => queryFn(request), {
    ...configuredOptions,
    ...options,
  });

  if (options?.prefetch && configuredOptions?.enabled && res.data?.data.length === request.pagination?.limit) {
    queryClient.prefetchQuery({
      queryKey:
        typeof request?.pagination?.page === "number"
          ? [
              ...baseQueryKey,
              {
                ...request.pagination,
                page: request.pagination.page + 1,
              },
            ]
          : baseQueryKey,
      queryFn: async () =>
        queryFn(
          typeof request?.pagination?.page === "number"
            ? {
                ...request,
                pagination: {
                  ...request.pagination,
                  page: request.pagination.page + 1,
                },
              }
            : request
        ),
      ...configuredOptions,
    });
  }

  return res;
}
export function useGetImage(
  id: string,
  project_id: string,
  type: AssetType,
  request: RequestBodyType<ImageType>,
  options?: UseQueryOptions<{ data: ImageType }, any, { data: ImageType }> & {
    queryKeyConcat?: string[];
    queryKeyOverwrite?: string[];
  }
) {
  return useQuery<{ data: ImageType }, unknown>(
    [type, id, project_id],
    async () =>
      FetchFunction({
        method: "POST",
        body: JSON.stringify(request),
        url: `${IS_PUBLIC ? baseURLS.basePublicServer : baseURLS.baseServer}/assets/${type}/${id}`,
      }),
    {
      enabled: options?.enabled,
    }
  );
}
export function useUpdateImage<
  InsertType extends {
    data: { title: string; owner_id?: string; file?: File };
    relations: { tags: { id: string }[] };
    permissions?: EntityPermissionType[];
  },
>(id: string, project_id: string | undefined, type: AssetType) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      const formData = new FormData();

      if (updateValues?.data?.title) {
        formData.append("title", updateValues.data.title);
      }

      if (updateValues?.data?.owner_id) {
        formData.append("owner_id", updateValues.data.owner_id);
      }

      if (updateValues?.data?.file) {
        formData.append("file", updateValues?.data?.file, updateValues?.data?.file?.name);
      }

      if (updateValues?.permissions) {
        formData.append("permissions", JSON.stringify(updateValues.permissions));
      }

      return FetchFunction({
        url: `${baseURLS.baseAssetServer}/assets/update/${id}`,
        body: formData,
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
            title: data?.message || "There was an error updating this item.",
            variant: "error",
            icon: IconEnum.error,
            timer: 5,
          });
      },
    }
  );
}
export function useDownloadImages(project_id: string | undefined, type: AssetType) {
  return useMutation(
    async (images: { data: { id: string; title: string }[] }) => {
      return FetchFunction({
        url: `${baseURLS.baseAssetServer}/assets/download/${project_id}/${type}`,
        method: "POST",
        body: JSON.stringify(images),
      });
    },
    {
      onSuccess: (data: { data: (string | null)[] }, vars) => {
        for (let index = 0; index < data.data.length; index++) {
          const title = vars.data[index];

          if (title && data.data[index]) {
            const bytesFromBase64 = atob(data.data[index] as string);
            const nums = new Array(bytesFromBase64.length);
            for (let i = 0; i < bytesFromBase64.length; i += 1) {
              nums[i] = bytesFromBase64.charCodeAt(i);
            }
            const byteArray = new Uint8Array(nums);
            saveAs(
              new Blob(
                [byteArray],

                {
                  type: "image/webp",
                }
              ),
              `${vars.data[index].title}.webp`
            );
          }
        }
      },
    }
  );
}
export function useGetInfiniteAssets<ReturnType>(
  request: RequestBodyType<ReturnType>,
  type: AssetType,
  project_id: string | undefined,
  options?: UseQueryOptions<any> & { prefetch?: boolean }
) {
  const baseQueryKey = ["allEntities", "infinite", project_id, type, request.data?.item_id, request?.filters];
  async function queryFn(finalRequest: RequestBodyType<ReturnType>) {
    return FetchFunction({
      method: "POST",
      body: JSON.stringify(finalRequest),
      url: `${getServerUrl()}/assets/${type.toLowerCase()}`,
    });
  }
  const configuredOptions = {
    enabled: !!project_id && (options?.enabled ?? true),
    staleTime: options?.staleTime,
    select: options?.select,
    keepPreviousData: options?.keepPreviousData,
  };

  return useInfiniteQuery<{ data: ReturnType[] }, unknown>(
    baseQueryKey,
    async ({ pageParam = 0 }) => {
      const formattedRequest = { ...request, pagination: { limit: request?.pagination?.limit || 10, page: pageParam } };
      return queryFn(formattedRequest);
    },
    {
      ...configuredOptions,
      ...options,
    }
  );
}
export function useDeleteAsset<InsertType extends { data: { id: string } }>(project_id: string | undefined, type: AssetType) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  return useMutation(
    async (vars: InsertType) =>
      FetchFunction({ method: "DELETE", url: `${baseURLS.baseAssetServer}/assets/${project_id}/${type}/${vars.data.id}` }),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["allEntities", project_id, "images"]);
        createNotification({
          title: data?.message || `${type === "images" ? "Image" : "Map"} deleted successfully.`,
          timer: 3,
          variant: "success",
          icon: IconEnum.check_circle,
        });
      },
      onError: () => {
        createNotification({
          title: `There was an error deleting this ${type === "images" ? "image" : "maps"}.`,
          timer: 3,
          variant: "error",
          icon: IconEnum.error,
        });
      },
    }
  );
}
