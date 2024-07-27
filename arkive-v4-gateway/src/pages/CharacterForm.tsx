import { useParams } from "react-router-dom";
import { useGetGatewayAccess } from "../hooks/gatewayHooks";

export default function CharacterForm() {
  const { access_id, entity_id } = useParams();

  const { data } = useGetGatewayAccess("characters", entity_id, access_id);

  return <div>{entity_id}</div>;
}
