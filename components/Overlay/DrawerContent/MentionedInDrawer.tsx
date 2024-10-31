import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { DocumentType, EdgeType } from "../../../types";
import { AvailableIcons, baseURLS, FetchFunction } from "../../../utils";
import { Graph } from "../../DataDisplay";
import { DrawerLayout } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";

function docToNode(doc: Pick<DocumentType, "id" | "title" | "icon">) {
  return {
    id: doc.id,
    label: doc.title,
    icon: doc?.icon,
    type: "round-rectangle",
    width: 50,
    height: 50,
    font_size: 16,
    font_color: "#ffffff",
    font_family: "Lato",
    text_h_align: "center",
    text_v_align: doc?.icon ? "top" : "center",
    background_color: doc?.icon ? "#27272a" : "#595959",
  };
}

type Props = {
  data: {
    id: string;
    title: string;
    icon?: AvailableIcons;
    isAll?: boolean;
  };
};
export function MentionedInDrawer({ data }: Props) {
  const { project_id } = useParams();
  const { data: mentionsData, isFetching } = useQuery<{
    data: { nodes: Pick<DocumentType, "id" | "title" | "icon">[]; edges: Pick<EdgeType, "source_id" | "target_id">[] };
  }>(
    ["documents", data.id, "document_mentioned_in"],
    async () =>
      FetchFunction({
        method: "GET",
        url: `${baseURLS.baseServer}/documents/mentioned_in/${data.id}`,
      }),
    {
      enabled: !data?.isAll,
      staleTime: 5 * 60 * 1000,
    }
  );

  const { data: allMentionsData } = useQuery<{
    data: { nodes: Pick<DocumentType, "id" | "title">[]; edges: { source_id: string; target_id: string }[] };
  }>(
    ["documents", "document_mentioned_in"],
    async () =>
      FetchFunction({
        method: "GET",
        url: `${baseURLS.baseServer}/documents/mentions/${project_id}`,
      }),
    {
      enabled: !!data?.isAll,
      staleTime: 5 * 60 * 1000,
    }
  );
  const nodes: any[] = (mentionsData?.data?.nodes || allMentionsData?.data?.nodes || []).map(docToNode).concat(
    data?.isAll
      ? []
      : [
          {
            id: data.id,
            label: data.title,
            icon: data?.icon,
            type: "round-rectangle",
            width: 50,
            height: 50,
            font_size: 16,
            font_color: "#ffffff",
            font_family: "Lato",
            text_h_align: "center",
            text_v_align: data?.icon ? "top" : "center",
            background_color: data?.icon ? "#27272a" : "#595959",
          },
        ]
  );
  const edges = (mentionsData?.data?.edges || allMentionsData?.data?.edges || []).map((doc) => ({
    id: `${data.id}-${doc.target_id}`,
    source_id: doc.source_id,
    target_id: doc.target_id,
    label: "Mentioned in",
    font_size: 8,
    target_arrow_shape: "triangle" as const,
  }));
  if (allMentionsData?.data?.nodes?.length === 0 && !isFetching)
    return <Alert label="This document isn't mentioned anywhere." />;

  return (
    <DrawerLayout>
      {!isFetching ? (
        <Graph
          data={{
            nodes,
            edges,
          }}
          isReadOnly
          layoutOptions={{
            name: "concentric",
            minNodeSpacing: 150,
          }}
        />
      ) : null}

      {isFetching ? <Skeleton type="drawer_form" /> : null}
    </DrawerLayout>
  );
}
