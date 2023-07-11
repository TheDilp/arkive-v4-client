import { UseQueryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AssetType, ResponseType, SelectOptionType } from "../../types";
import { baseURLS, dialogAtom, FetchFunction, IconEnum, useNotifications, useResetAtom } from "../../utils";
import { ImageType } from "../../types/EntityTypes/imageTypes";

export function useUploadAsset(type: AssetType, projectId: string) {
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
        url: `${baseURLS.baseServer}assets/upload/${projectId}/${type}`,
        body: formData,
        method: "POST",
      });
    },
    {
      onSuccess: (res: ResponseType<ImageType>) => {
        const { data } = res;
        createNotification({
          id: crypto.randomUUID(),
          title: `${type === "images" ? "Images" : "Maps"} uploaded successfully.`,
          variant: "success",
          icon: IconEnum.check_circle,
          timer: 5,
        });
        queryClient.invalidateQueries([]);
        resetDialogAtom();
      },
    },
  );
}

export function useGetImages(
  projectId: string,
  type: AssetType,
  options?: UseQueryOptions<{ data: ImageType[] }, any, SelectOptionType[]>,
) {
  return useQuery<{ data: ImageType[] }, any, SelectOptionType[]>(
    [projectId, type],
    async () => FetchFunction({ method: "GET", url: `${baseURLS.baseServer}assets/${projectId}/${type}` }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
      select: options?.select,
    },
  );
}
