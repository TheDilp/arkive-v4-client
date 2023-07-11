import { useQuery, UseQueryOptions } from "@tanstack/react-query";

import { AvailableEntityType, RequestBodyType } from "../../types";
import { baseURLS, FetchFunction } from "../../utils";

export function useGetItem<EntityType>(
  id: string | undefined,
  type: AvailableEntityType,
  body: RequestBodyType,
  options?: UseQueryOptions,
) {
  return useQuery<{ data: EntityType }>(
    [type, id],
    async () => FetchFunction({ method: "POST", url: `${baseURLS.baseServer}/${type.toLowerCase()}/${id}` }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    },
  );
}

// export function useGetManyItems<ReturnType>(
//   data: {
//     project_id: string;
//     parentId?: string;
//   },
//   type: AvailableEntityType,
//   options?: UseQueryOptions<ReturnType>,
// ) {
//   return useQuery<ReturnType[]>(
//     ["allEntities", data.project_id, type],
//     async () => FetchFunction({ method: "POST", body: JSON.stringify(data), url: `${baseURLS.baseServer}api/v4/${type}/` }),
//     {
//       enabled: !!data.project_id && (options?.enabled ?? true),
//       staleTime: options?.staleTime,
//     },
//   );
// }
