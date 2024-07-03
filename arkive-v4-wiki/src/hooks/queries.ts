import { useQuery } from "@tanstack/react-query";
import { AvailableEntityType } from "../../../types";

export function useListPublicEntities<T>(project_id: string, type: AvailableEntityType) {
  return useQuery({
    queryKey: [type, project_id, "list"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_PUBLIC_SERVER}/${project_id}/${type}`);

      const data = (await res.json()) as T[];
      return data;
    },
  });
}

