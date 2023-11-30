import { useInfiniteQuery, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";

import {
  AvailableEntityType,
  AvailableSubEntityType,
  IconCategories,
  RequestBodyType,
  SearchableEntities,
  UserType,
} from "../../types";
import { ProjectType } from "../../types/EntityTypes/projectTypes";
import { baseURLS, FetchFunction, getSearchURL } from "../../utils";

export function useGetAllProjects(request: RequestBodyType<ProjectType>, options?: UseQueryOptions) {
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

export function useGetUser(request: RequestBodyType<UserType> & { data: { auth_id?: string } }, options?: UseQueryOptions) {
  return useQuery<{ data: UserType }>(
    ["user", request.data.auth_id],
    async () =>
      FetchFunction({
        method: "POST",
        body: JSON.stringify(request),
        url: `${baseURLS.baseServer}/users/${request.data.auth_id}`,
      }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    },
  );
}

export function useGetEntity<EntityType>(
  id: string | undefined,
  type: AvailableEntityType,
  body: RequestBodyType<EntityType>,
  options?: UseQueryOptions<any> & { queryKeyOverwrite?: string[]; queryKeyConcat?: string[]; isPublic?: boolean },
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
      FetchFunction({
        method: "POST",
        body: JSON.stringify(body),
        url: `${options?.isPublic ? baseURLS.basePublicServer : baseURLS.baseServer}/${type.toLowerCase()}/${id}`,
        isPublic: options?.isPublic,
      }),
    {
      retry: options?.retry,
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    },
  );
}
export function useGetSubEntity<EntityType>(
  id: string | undefined,
  type: AvailableSubEntityType,
  body: RequestBodyType<EntityType>,
  options?: UseQueryOptions & { queryKeyOverwrite?: string[]; queryKeyConcat?: string[] },
) {
  return useQuery<{ data: EntityType }>(
    options?.queryKeyOverwrite ?? [type, id, ...(options?.queryKeyConcat || [])],
    async () => FetchFunction({ method: "POST", body: JSON.stringify(body), url: `${baseURLS.baseServer}/${type}/${id}` }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    },
  );
}

export function useGetEntities<ReturnType>(
  request: RequestBodyType<ReturnType>,
  type: AvailableEntityType | AvailableSubEntityType,
  options?: UseQueryOptions<any> & {
    prefetch?: boolean;
    queryKeyOverwrite?: (string | number | Record<any, any>)[];
    queryKeyConcat?: (string | number | Record<any, any>)[];
  },
) {
  const baseQueryKey = [
    "allEntities",
    request.data?.project_id,
    type,
    request.data?.item_id || request.data?.parent_id,
    request?.filters,
    request?.relationFilters,
    request?.orderBy,
  ];
  let mainRequestQueryKey = [...baseQueryKey];
  async function queryFn(finalRequest: RequestBodyType<ReturnType>) {
    return FetchFunction({
      method: "POST",
      body: JSON.stringify(finalRequest),
      url: `${baseURLS.baseServer}/${type.toLowerCase()}`,
    });
  }
  const configuredOptions = {
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime,
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

  const res = useQuery<{ data: ReturnType[] }, unknown>(mainRequestQueryKey, async () => queryFn(request), {
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
            : request,
        ),
      ...configuredOptions,
    });
  }

  return res;
}
export function useGetInfiniteEntities<ReturnType>(
  request: RequestBodyType<ReturnType>,
  type: AvailableEntityType | AvailableSubEntityType,
  options?: UseQueryOptions<any> & {
    prefetch?: boolean;
    queryKeyOverwrite?: (string | number | Record<any, any>)[];
    queryKeyConcat?: (string | number | Record<any, any>)[];
  },
) {
  let baseQueryKey = [
    "allEntities",
    request.data?.project_id,
    type,
    request.data?.item_id || request.data?.parent_id,
    request?.filters,
    request?.relationFilters,
    request?.orderBy,
    "infinite",
  ];

  if (options?.queryKeyConcat) {
    baseQueryKey = baseQueryKey.concat(options.queryKeyOverwrite);
  }

  if (options?.queryKeyOverwrite) {
    baseQueryKey = options.queryKeyOverwrite;
  }

  async function queryFn(finalRequest: RequestBodyType<ReturnType>) {
    return FetchFunction({
      method: "POST",
      body: JSON.stringify(finalRequest),
      url: `${baseURLS.baseServer}/${type.toLowerCase()}`,
    });
  }
  const configuredOptions = {
    enabled: !!request.data?.project_id && (options?.enabled ?? true),
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

// #region misc
export function useSearch<ReturnType>(
  request: { data: { search_term: string; project_id: string } | { tag_ids: string[]; match: "all" | "any" }; limit: number },
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
export function useGetCharacterFamily(
  character_id: string | undefined,
  relationship_type_id: string,
  count?: string,
  options?: UseQueryOptions,
) {
  return useQuery(
    ["family", character_id, relationship_type_id, count || "5"],
    async () =>
      FetchFunction({
        method: "GET",
        url: `${baseURLS.baseServer}/characters/family/${relationship_type_id}/${character_id}/${count || "5"}`,
      }),
    {
      enabled: options?.enabled && !!character_id,
      staleTime: options?.staleTime,
    },
  );
}
export function useGetIcons(type: IconCategories | null) {
  return useQuery(
    ["icons", type],
    async () => {
      const res = await fetch(`https://api.iconify.design/collection?prefix=${type}`, {
        method: "GET",
      });

      const data = await res.json();
      if (!data) {
        throw new Error("There was an error with your request.");
      }
      return data;
    },

    {
      enabled: !!type,
      staleTime: Infinity,
      select: (data: { total: number; uncategorized: string[] }) => {
        return data;
      },
    },
  );
}
// #endregion misc
