import { useInfiniteQuery, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

import { AvailableEntityType, AvailableSubEntityType, RequestBodyType, SearchableEntities } from "../../types";
import { ProjectType } from "../../types/EntityTypes/projectTypes";
import { baseURLS, FetchFunction } from "../../utils";

export function useGetItem<EntityType>(
  id: string | undefined,
  type: AvailableEntityType,
  body: RequestBodyType,
  options?: UseQueryOptions,
) {
  return useQuery<{ data: EntityType }>(
    [type, id],
    async () =>
      FetchFunction({ method: "POST", body: JSON.stringify(body), url: `${baseURLS.baseServer}/${type.toLowerCase()}/${id}` }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    },
  );
}

export function useGetAllProjects(request: RequestBodyType, options?: UseQueryOptions) {
  return useQuery<{ data: ProjectType[] }>(
    ["allEntities", "project"],
    async () =>
      FetchFunction({
        method: "POST",
        body: JSON.stringify(request),
        url: `${baseURLS.baseServer}/projects`,
      }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    },
  );
}

export function useGetAllEntities<ReturnType>(
  request: RequestBodyType,
  type: AvailableEntityType | AvailableSubEntityType,
  options?: UseQueryOptions<any> & { prefetch?: boolean },
) {
  const baseQueryKey = [
    "allEntities",
    request.data.project_id,
    type,
    request.data?.item_id,
    request?.filters,
    request?.orderBy,
  ];
  async function queryFn(finalRequest: RequestBodyType) {
    return FetchFunction({
      method: "POST",
      body: JSON.stringify(finalRequest),
      url: `${baseURLS.baseServer}/${type.toLowerCase()}`,
    });
  }
  const configuredOptions = {
    enabled: !!request.data.project_id && (options?.enabled ?? true),
    staleTime: options?.staleTime,
    select: options?.select,
  };
  const queryClient = useQueryClient();
  if (options?.prefetch && configuredOptions?.enabled) {
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
            : request,
        ),
      ...configuredOptions,
    });
  }

  return useQuery<{ data: ReturnType[] }, unknown>(
    typeof request?.pagination?.page === "number" ? baseQueryKey.concat(request?.pagination) : baseQueryKey,
    async () => queryFn(request),
    { ...configuredOptions, ...options },
  );
}
export function useGetSubEntities<ReturnType>(
  request: { data: { project_id: string; parentId: string } },
  type: AvailableEntityType | AvailableSubEntityType,
  options?: UseQueryOptions<any> & { prefetch?: boolean },
) {
  const baseQueryKey = ["allSubEntities", request.data.project_id, type, request.data.parentId];

  const configuredOptions = {
    enabled: !!request.data.project_id && (options?.enabled ?? true),
    staleTime: options?.staleTime,
    select: options?.select,
  };

  return useQuery<{ data: ReturnType[] }, unknown>(
    baseQueryKey,
    async () =>
      FetchFunction({
        url: `${baseURLS.baseServer}/${type.toLowerCase()}/${request.data.project_id}/${request.data.parentId}`,
        method: "GET",
      }),
    configuredOptions,
  );
}

export function useGetInfiniteEntities<ReturnType>(
  request: RequestBodyType,
  type: AvailableEntityType | AvailableSubEntityType,
  options?: UseQueryOptions<any> & { prefetch?: boolean },
) {
  const baseQueryKey = ["allEntities", "infinite", request.data.project_id, type, request.data?.item_id, request?.filters];
  async function queryFn(finalRequest: RequestBodyType) {
    return FetchFunction({
      method: "POST",
      body: JSON.stringify(finalRequest),
      url: `${baseURLS.baseServer}/${type.toLowerCase()}`,
    });
  }
  const configuredOptions = {
    enabled: !!request.data.project_id && (options?.enabled ?? true),
    staleTime: options?.staleTime,
    select: options?.select,
    keepPreviousData: options?.keepPreviousData,
  };

  return useInfiniteQuery<{ data: ReturnType[] }, unknown>(
    baseQueryKey,
    async ({ pageParam = 0 }) => {
      const formattedRequest = { ...request, pagination: { limit: 10, page: pageParam } };
      return queryFn(formattedRequest);
    },
    {
      ...configuredOptions,
      ...options,
    },
  );
}

export function useSearch<ReturnType>(
  request: { data: { search_term: string } },
  type: SearchableEntities,
  project_id: string,
  options?: UseQueryOptions<any>,
) {
  return useQuery<{ data: ReturnType[] }, unknown>(
    ["search"],
    async () =>
      FetchFunction({
        url: `${baseURLS.baseServer}/search/${project_id}/${type}`,
        method: "POST",
        body: JSON.stringify(request),
      }),
    options,
  );
}
