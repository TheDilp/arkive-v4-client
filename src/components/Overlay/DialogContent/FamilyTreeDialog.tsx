import { useGetCharacterFamily } from "../../../hooks";
import { Graph } from "../..";
import Alert from "../../Misc/Alert";

export function FamilyTreeDialog({ data }: { data: { id: string } }) {
  const { data: characterFamilyData, isFetching } = useGetCharacterFamily(data?.id);
  if (isFetching) return "LOADING...";

  const { nodes, edges } = characterFamilyData.data;

  if (!nodes.length) return <Alert label="There are no related characters." variant="info" />;

  return (
    <Graph
      center_on={data.id}
      data={{
        title: "Family tree",
        default_edge_color: "#595959",
        default_node_color: "#595959",
        default_node_shape: "rectangle",
        nodes,
        edges,
      }}
      isViewOnly
    />
  );
}
