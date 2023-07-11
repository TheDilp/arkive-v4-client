import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

import {
  AvailableEntityType,
  AvailableSubEntityType,
  RequestBodyType,
} from "../../types";
import { ProjectType } from "../../types/EntityTypes/projectTypes";
import { baseURLS, FetchFunction } from "../../utils";

export function useGetAllProjects(
  request: RequestBodyType,
  options?: UseQueryOptions
) {
  return useQuery<{ data: ProjectType[] }>(
    ["allItems", "project"],
    async () =>
      FetchFunction({
        method: "POST",
        body: JSON.stringify(request),
        url: `${baseURLS.baseServer}/projects`,
      }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    }
  );
}

export function useGetAllEntities<ReturnType>(
  request: RequestBodyType,
  type: AvailableEntityType | AvailableSubEntityType,
  options?: UseQueryOptions<any> & { prefetch?: boolean }
) {
  const baseQueryKey = [
    "allItems",
    request.data.projectId,
    type,
    request?.archived,
    request?.orderBy,
    request?.filters,
  ];

  async function queryFn(finalRequest: RequestBodyType) {
    return FetchFunction({
      method: "POST",
      body: JSON.stringify(finalRequest),
      url: `${baseURLS.baseServer}/${type.toLowerCase()}/${
        request.data.projectId
      }${request.archived ? "" : ""}`,
    });
  }
  const configuredOptions = {
    enabled: !!request.data.projectId && (options?.enabled ?? true),
    staleTime: options?.staleTime,
    select: options?.select,
  };
  const queryClient = useQueryClient();
  if (options?.prefetch) {
    queryClient.prefetchQuery({
      queryKey:
        typeof request?.pagination?.page === "number"
          ? baseQueryKey.concat({
              ...request.pagination,
              page: request.pagination.page + 1,
            })
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

  return useQuery<{ data: ReturnType[] }, unknown>(
    typeof request?.pagination?.page === "number"
      ? baseQueryKey.concat(request?.pagination)
      : baseQueryKey,
    async () => queryFn(request),
    configuredOptions
  );
}
export function useGetSubEntities<ReturnType>(
  request: { data: { projectId: string; parentId: string } },
  type: AvailableEntityType | AvailableSubEntityType,
  options?: UseQueryOptions<any> & { prefetch?: boolean }
) {
  const baseQueryKey = [
    "allSubEntities",
    request.data.projectId,
    type,
    request.data.parentId,
  ];

  const configuredOptions = {
    enabled: !!request.data.projectId && (options?.enabled ?? true),
    staleTime: options?.staleTime,
    select: options?.select,
  };

  return useQuery<{ data: ReturnType[] }, unknown>(
    baseQueryKey,
    async () =>
      FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/${
          request.data.projectId
        }/${request.data.parentId}`,
        method: "GET",
      }),
    configuredOptions
  );
}
