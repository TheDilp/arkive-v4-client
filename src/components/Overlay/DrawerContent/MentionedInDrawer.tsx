import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useQuery } from "@tanstack/react-query";

import { DocumentType } from "../../../types";
import { baseURLS, FetchFunction } from "../../../utils";
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
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
    id: string;
    title: string;
    icon?: string;
  };
};
export function MentionedInDrawer({ data }: Props) {
  const { data: mentionsData, isFetching } = useQuery<{ data: Pick<DocumentType, "id" | "title" | "icon">[] }>(
    ["document_mentioned_in", data.id],
    async () =>
      FetchFunction({
        method: "GET",
        url: `${baseURLS.baseServer}/documents/mentioned_in/${data.id}`,
      }),
    {
      staleTime: 5 * 60 * 1000,
    },
  );
  const nodes: any[] = (mentionsData?.data || []).map(docToNode);
  const edges = (mentionsData?.data || []).map((doc) => ({
    id: `${data.id}-${doc.id}`,
    source_id: data.id,
    target_id: doc.id,
    label: "Mentioned in",
    font_size: 8,
    target_arrow_shape: "triangle" as const,
  }));

  return (
    <DrawerLayout>
      {!isFetching ? (
        <Graph
          data={{
            nodes: [
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
                x: 0,
                y: 0,
                is_locked: true,
              },
              ...nodes,
            ],
            edges,
          }}
          isViewOnly
          layoutOptions={{
            name: "concentric",
          }}
        />
      ) : null}

      {mentionsData?.data?.length === 0 && !isFetching ? <Alert label="This document isn't mentioned anywhere." /> : null}
      {isFetching ? <Skeleton type="drawer_form" /> : null}
    </DrawerLayout>
  );
}
