import { useInfiniteQuery, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

import { AvailableEntityType, AvailableSubEntityType, RequestBodyType, SearchableEntities } from "../../types";
import { ProjectType } from "../../types/EntityTypes/projectTypes";
import { baseURLS, FetchFunction, getSearchURL } from "../../utils";

export function useGetEntity<EntityType>(
  id: string | undefined,
  type: AvailableEntityType,
  body: RequestBodyType,
  options?: UseQueryOptions<any> & { queryKeyOverwrite?: string[]; queryKeyConcat?: string[] },
) {
  let queryKey = [type, id];
  if (options?.queryKeyConcat) {
    queryKey = queryKey.concat(options.queryKeyConcat);
  }
  if (options?.queryKeyOverwrite) {
    queryKey = options.queryKeyOverwrite;
  }
  return useQuery<{ data: EntityType }>(
    queryKey,
    async () =>
      FetchFunction({ method: "POST", body: JSON.stringify(body), url: `${baseURLS.baseServer}/${type.toLowerCase()}/${id}` }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    },
  );
}
export function useGetSubEntity<EntityType>(
  id: string | undefined,
  type: AvailableSubEntityType,
  body: RequestBodyType,
  options?: UseQueryOptions,
) {
  return useQuery<{ data: EntityType }>(
    [type, id],
    async () => FetchFunction({ method: "POST", body: JSON.stringify(body), url: `${baseURLS.baseServer}/${type}/${id}` }),
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

export function useGetEntities<ReturnType>(
  request: RequestBodyType,
  type: AvailableEntityType | AvailableSubEntityType,
  options?: UseQueryOptions<any> & { prefetch?: boolean; queryKeyOverwrite?: string[]; queryKeyConcat?: string[] },
) {
  let baseQueryKey = [
    "allEntities",
    request.data.project_id,
    type,
    request.data?.item_id || request.data?.parent_id,
    request?.filters,
    request?.relationFilters,
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
  if (typeof request?.pagination?.page === "number") {
    baseQueryKey = baseQueryKey.concat(request?.pagination);
  }

  if (options?.queryKeyConcat) {
    baseQueryKey = baseQueryKey.concat(options.queryKeyOverwrite);
  }

  if (options?.queryKeyOverwrite) {
    baseQueryKey = options.queryKeyOverwrite;
  }

  return useQuery<{ data: ReturnType[] }, unknown>(baseQueryKey, async () => queryFn(request), {
    ...configuredOptions,
    ...options,
  });
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
      const formattedRequest = { ...request, pagination: { limit: request?.pagination?.limit || 10, page: pageParam } };
      return queryFn(formattedRequest);
    },
    {
      ...configuredOptions,
      ...options,
    },
  );
}

export function useSearch<ReturnType>(
  request: { data: { search_term: string } | { tag_ids: string[]; match: "all" | "any" }; limit: number },
  type: SearchableEntities,
  project_id: string,
  options?: UseQueryOptions<any> & { queryKeyConcat?: string[] },
) {
  return useQuery<{ data: ReturnType }, unknown>(
    ["search", type].concat(options?.queryKeyConcat || []),
    async () =>
      FetchFunction({
        url: `${baseURLS.baseServer}/search/${project_id}${getSearchURL(type)}`,
        method: "POST",
        body: JSON.stringify(request),
      }),
    options,
  );
}

export function useGetCharacterFamily(character_id: string | undefined, options?: UseQueryOptions) {
  return useQuery(
    ["family", character_id],
    async () => FetchFunction({ method: "GET", url: `${baseURLS.baseServer}/characters/family/${character_id}` }),
    {
      enabled: options?.enabled && !!character_id,
      staleTime: options?.staleTime,
    },
  );
}
