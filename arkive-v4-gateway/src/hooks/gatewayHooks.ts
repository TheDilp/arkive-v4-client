import { useQuery } from "@tanstack/react-query";
import { FetchFunction } from "../../../utils/crud/FetchFunction";
import { baseURLS } from "../../../utils/enums/ServerEnum";
export function useGetGatewayAccess(
  type: "characters" | "blueprint_instances",
  entity_id: string | undefined,
  access_id: string | undefined
) {
  return useQuery([type, access_id, entity_id], async () =>
    FetchFunction({ url: `${baseURLS.baseServer.replace("/api/v1", "")}/gateway/access/${type}/${access_id}`, method: "GET" })
  );
}
