import { useInfiniteQuery, useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { useResetAtom } from "jotai/utils";

import { AssetType, RequestBodyType } from "../../types";
import { ImageType } from "../../types/EntityTypes/imageTypes";
import { baseURLS, dialogAtom, FetchFunction, getEntityCRUDNotification, IconEnum, useNotifications } from "../../utils";

export function useUploadAsset(type: AssetType, project_id: string) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();
  const resetDialogAtom = useResetAtom(dialogAtom);
  return useMutation(
    async (images: File[]) => {
      const formData = new FormData();

      for (let index = 0; index < images.length; index += 1) {
        formData.append(images[index].name, images[index]);
      }

      return FetchFunction({
        url: `${baseURLS.baseServer}/assets/upload/${project_id}/${type}`,
        body: formData,
        method: "POST",
      });
    },
    {
      onSettled: (data) => {
        if (data?.ok)
          createNotification({
            title: data?.message || `${type === "images" ? "Images" : "Maps"} uploaded successfully.`,
            variant: "success",
            icon: IconEnum.check_circle,
            timer: 5,
          });
        queryClient.invalidateQueries([project_id, type]);
        resetDialogAtom();
      },
    },
  );
}

export function useGetImages(
  project_id: string,
  type: AssetType,
  body: RequestBodyType,
  options?: UseQueryOptions<{ data: ImageType[] }, any, { data: ImageType[] }>,
) {
  return useQuery<{ data: ImageType[] }, any, { data: ImageType[] }>(
    ["allEntities", project_id, type, body?.filters, body?.pagination, body?.orderBy],
    async () =>
      FetchFunction({ method: "POST", body: JSON.stringify(body), url: `${baseURLS.baseServer}/assets/${project_id}/${type}` }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
      select: options?.select,
    },
  );
}

export function useUpdateImage<InsertType extends { data: { title: string } }>(
  id: string,
  project_id: string | undefined,
  type: AssetType,
) {
  const queryClient = useQueryClient();
  const createNotification = useNotifications();

  return useMutation(
    async (updateValues: InsertType) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/assets/update/${id}`,
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
    },
  );
}
export function useDownloadImage(project_id: string | undefined, type: AssetType) {
  return useMutation(
    async ({ data: { id } }: { data: { id: string; title: string } }) => {
      return FetchFunction({
        url: `${baseURLS.baseServer}/assets/download/${project_id}/${type}/${id}`,
        method: "GET",
      });
    },
    {
      onSuccess: (data: { data: string }, vars) => {
        const bytesFromBase64 = atob(data.data);
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
            },
          ),
          `${vars.data.title}.webp`,
        );
      },
    },
  );
}
export function useGetInfiniteAssets<ReturnType>(
  request: RequestBodyType,
  type: AssetType,
  project_id: string | undefined,
  options?: UseQueryOptions<any> & { prefetch?: boolean },
) {
  const baseQueryKey = ["allEntities", "infinite", project_id, type, request.data?.item_id, request?.filters];
  async function queryFn(finalRequest: RequestBodyType) {
    return FetchFunction({
      method: "POST",
      body: JSON.stringify(finalRequest),
      url: `${baseURLS.baseServer}/assets/${project_id}/${type.toLowerCase()}`,
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
    },
  );
}
