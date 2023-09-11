import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";

import { AssetType, SelectOptionType } from "../../types";
import { ImageType } from "../../types/EntityTypes/imageTypes";
import { baseURLS, dialogAtom, FetchFunction, IconEnum, useNotifications } from "../../utils";

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
  options?: UseQueryOptions<{ data: ImageType[] }, any, SelectOptionType[]>,
) {
  return useQuery<{ data: ImageType[] }, any, SelectOptionType[]>(
    [project_id, type],
    async () => FetchFunction({ method: "GET", url: `${baseURLS.baseServer}/assets/${project_id}/${type}` }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
      select: options?.select,
    },
  );
}
