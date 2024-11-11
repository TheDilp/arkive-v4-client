import {
  MutationOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";

import {
  AvailableEntityType,
  AvailableSubEntityType,
  IconCategories,
  MentionStatType,
  NotificationEntityType,
  RequestBodyType,
  SearchableEntities,
  SearchableMentionEntities,
  TagColorStatType,
  TagEntityStatType,
  UserType,
} from "../../types";
import { CreateConfigType, GatewayConfigOptionType } from "../../types/EntityTypes/gatewayTypes";
import { ProjectDashboardType, ProjectType } from "../../types/EntityTypes/projectTypes";
import {
  baseURLS,
  FetchFunction,
  getPluralEntityType,
  getSearchURL,
  getServerUrl,
  getSingularEntityType,
  IconEnum,
  useNotifications,
} from "../../utils";

//#region projects

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
    }
  );
}

export function useGetProjectDashboard(project_id: string, enabledEntities: string[], options?: UseQueryOptions) {
  return useQuery<{ data: ProjectDashboardType }>(
    ["allEntities", "project", "dashboard", enabledEntities, project_id],
    async () =>
      FetchFunction({
        method: "POST",
        url: `${baseURLS.baseServer}/projects/${project_id}/dashboard`,
        body: JSON.stringify({ data: { enabled_entities: enabledEntities } }),
      }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    }
  );
}

export function useGetProjectAPIKey() {
  return useMutation(async () =>
    FetchFunction({
      url: `${baseURLS.baseServer}/projects/api_key`,
      method: "GET",
    })
  );
}
export function useResetProjectAPIKey(options: MutationOptions) {
  return useMutation(
    async () =>
      FetchFunction({
        url: `${baseURLS.baseServer}/projects/api_key/reset`,
        method: "GET",
      }),
    options
  );
}

//#endregion projects
export function useGetUser(
  request: RequestBodyType<UserType> & {
    data: { id: string; project_id?: string | undefined };
  },
  options?: UseQueryOptions
) {
  return useQuery<{ data: UserType }>(
    ["user", request.data.project_id, request.data.id],
    async () =>
      FetchFunction({
        method: "POST",
        body: JSON.stringify(request),
        url: `${baseURLS.baseServer}/users/${request.data.id}`,
      }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    }
  );
}

export function useGetEntity<EntityType>(
  id: string | undefined,
  type: AvailableEntityType | SearchableMentionEntities,
  body: RequestBodyType<EntityType>,
  options?: UseQueryOptions<any> & {
    queryKeyOverwrite?: string[];
    queryKeyConcat?: string[];
  }
) {
  const createNotification = useNotifications();
  let queryKey = [type, id];
  if (options?.queryKeyConcat) {
    queryKey = queryKey.concat(options.queryKeyConcat);
  }
  if (options?.queryKeyOverwrite) {
    queryKey = options.queryKeyOverwrite;
  }
  return useQuery<{ data: EntityType }>(
    queryKey,
    async () => {
      const data = await FetchFunction({
        method: "POST",
        body: JSON.stringify(body),
        url: `${getServerUrl()}/${type.toLowerCase()}/${id}`,
      });
      if (!data?.role_access && !IS_PUBLIC && !IS_GATEWAY) {
        createNotification({
          title: `Your current role in this project does not have permission to view this ${getSingularEntityType(type)}.`,
          timer: 5,
          hasNoTruncate: true,
          variant: "error",
          icon: IconEnum.forbidden,
        });
        return { data: [], message: "NO_ROLE_ACCESS", ok: false };
      }
      return data;
    },
    {
      retry: options?.retry,
      enabled: options?.enabled,
      staleTime: options?.staleTime,
    }
  );
}
export function useGetSubEntity<EntityType>(
  id: string | undefined,
  type: AvailableSubEntityType,
  body: RequestBodyType<EntityType>,
  options?: UseQueryOptions & {
    queryKeyOverwrite?: string[];
    queryKeyConcat?: string[];
  }
) {
  return useQuery<{ data: EntityType }>(
    options?.queryKeyOverwrite ?? [type, id, ...(options?.queryKeyConcat || [])],
    async () =>
      FetchFunction({
        method: "POST",
        body: JSON.stringify(body),
        url: `${IS_PUBLIC ? baseURLS.basePublicServer : baseURLS.baseServer}/${type}/${id}`,
      }),
    {
      enabled: options?.enabled,
      staleTime: options?.staleTime,
      retry: options?.retry ?? 3,
    }
  );
}

export function useGetEntities<ReturnType>(
  request: RequestBodyType<ReturnType>,
  type: AvailableEntityType | AvailableSubEntityType,
  options?: UseQueryOptions<any> & {
    prefetch?: boolean;
    queryKeyOverwrite?: (string | number | Record<any, any>)[];
    queryKeyConcat?: (string | number | Record<any, any>)[];
  }
) {
  const createNotification = useNotifications();
  const baseQueryKey = [
    "allEntities",
    request.data?.project_id,
    type,
    request.data?.item_id || request.data?.parent_id,
    request?.filters,
    request?.relationFilters,
    request?.orderBy,
    request?.arkived,
  ];
  let mainRequestQueryKey = [...baseQueryKey];
  async function queryFn(finalRequest: RequestBodyType<ReturnType>) {
    const data: {
      data: any;
      message: string;
      ok: boolean;
      role_access?: boolean;
    } = await FetchFunction({
      method: "POST",
      body: JSON.stringify(finalRequest),
      url: `${getServerUrl()}/${type.toLowerCase()}`,
    });
    if (!data?.role_access && !IS_PUBLIC) {
      createNotification({
        title: `Your current role in this project does not have permission to view ${getPluralEntityType(type)}.`,
        timer: 5,
        hasNoTruncate: true,
        variant: "error",
        icon: IconEnum.forbidden,
      });
      return { data: [], message: "NO_ROLE_ACCESS", ok: true };
    }
    return data;
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

  if (
    options?.prefetch &&
    configuredOptions?.enabled &&
    res.data?.data.length === request.pagination?.limit &&
    !res.isFetching
  ) {
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
export function useGetInfiniteEntities<ReturnType>(
  request: RequestBodyType<ReturnType>,
  type: AvailableEntityType | AvailableSubEntityType,
  options?: UseQueryOptions<any> & {
    prefetch?: boolean;
    queryKeyOverwrite?: (string | number | Record<any, any>)[];
    queryKeyConcat?: (string | number | Record<any, any>)[];
  }
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
      url: `${getServerUrl()}/${type.toLowerCase()}`,
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
      const formattedRequest = {
        ...request,
        pagination: {
          limit: request?.pagination?.limit || 10,
          page: pageParam,
        },
      };
      return queryFn(formattedRequest);
    },
    {
      ...configuredOptions,
      ...options,
    }
  );
}

// #region misc
export function useSearch<ReturnType>(
  request: {
    data:
      | { search_term: string; project_id: string | null; user_id: string | null; parent_id?: string }
      | { tag_ids: string[]; match: "all" | "any" };
    limit: number;
  },
  type: SearchableEntities | null,
  project_id: string,
  isGlobal?: boolean,
  options?: UseQueryOptions<any> & {
    queryKeyConcat?: string[];
    isFolders?: boolean;
  }
) {
  return useQuery<{ data: ReturnType }, unknown>(
    ["search", type].concat(options?.queryKeyConcat || []),
    async () => {
      if (type) {
        return FetchFunction({
          url: `${getServerUrl()}/search/${getSearchURL(type, !!isGlobal, project_id, !!options?.isFolders, type || "")}`,
          method: "POST",
          body: JSON.stringify(request),
        });
      }
      return { data: [], ok: false, role_access: true };
    },
    { ...options, enabled: !!type && !!options?.enabled && !!type }
  );
}
export function useGetCharacterFamily(
  character_id: string | undefined,
  relationship_type_id: string,
  count?: string,
  options?: UseQueryOptions
) {
  return useQuery(
    ["family", character_id, relationship_type_id, count || "5"],
    async () =>
      FetchFunction({
        method: "GET",
        url: `${
          IS_PUBLIC ? baseURLS.basePublicServer : baseURLS.baseServer
        }/characters/family/${relationship_type_id}/${character_id}/${count || "5"}`,
      }),
    {
      enabled: options?.enabled && !!character_id,
      staleTime: options?.staleTime,
    }
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
      if (type === "line-md") {
        const icons = Object.values(data?.categories || {}).flatMap((cat) => cat);
        return { uncategorized: icons, total: icons.length };
      }
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
    }
  );
}
export function useGetStats(project_id: string | undefined, user_id: string | undefined, options?: UseQueryOptions<any>) {
  return useQuery<{
    data: Record<string, number> & { tag_colors: TagColorStatType } & {
      tag_entities: TagEntityStatType;
    } & {
      mentions: MentionStatType;
    };
  }>(
    ["stats", project_id],
    async () =>
      FetchFunction({
        url: `${baseURLS.baseServer}/stats/${project_id}/${user_id}`,
        method: "GET",
      }),

    {
      enabled: (options?.enabled && !!project_id && !!user_id) || false,
    }
  );
}
export function useGetNotifications(
  project_id: string | undefined,
  user_id: string | undefined,
  options?: UseQueryOptions<any>
) {
  return useQuery<{
    data: NotificationEntityType[];
  }>(
    ["notifications", project_id],
    async () =>
      FetchFunction({
        url: `${baseURLS.baseServer}/notifications/${project_id}/${user_id}`,
        method: "GET",
      }),

    {
      enabled: options?.enabled ?? true,
    }
  );
}

export function useGetGatewayOptions(
  request: {
    data: { access_id: string; entity_type: "characters" | "blueprint_instances" };
  },
  type: "characters" | "blueprint_instances",
  options?: UseQueryOptions<any> & {
    queryKeyConcat?: string[];
  }
) {
  return useQuery<{
    data: {
      create_config: CreateConfigType | undefined;
      project_id: string;
      entities: GatewayConfigOptionType[];
    };
  }>(["gateway", "options", type].concat(options?.queryKeyConcat || []), async () => {
    if (type) {
      return FetchFunction({
        url: `${getServerUrl()}/options/${type}`,
        method: "POST",
        body: JSON.stringify(request),
      });
    }
    return { data: [], ok: false, role_access: true };
  });
}
// #endregion misc
