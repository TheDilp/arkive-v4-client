import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import { DocumentType } from "../../../types";
import { baseURLS, FetchFunction } from "../../../utils";
import { DrawerLayout } from "../../Layout";
import { Alert, Skeleton } from "../../Misc";

type Props = {
  data: {
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
    id: string;
  };
};
export function MentionedInDrawer({ data }: Props) {
  const { project_id } = useParams();
  const { data: mentionsData, isFetching } = useQuery<{ data: DocumentType[] }>(
    ["document_mentioned_in", data.id],
    async () =>
      FetchFunction({
        method: "POST",
        body: JSON.stringify({
          data: {
            project_id,
            id: data.id,
          },
        }),
        url: `${baseURLS.baseServer}/documents/mentioned_in`,
      }),
    {
      staleTime: 5 * 60 * 1000,
    },
  );
  return (
    <DrawerLayout>
      <ul className="flex max-h-full flex-col gap-y-1 overflow-y-auto">
        {mentionsData?.data?.map((item) => (
          <li key={item.id} className="flex items-center gap-x-2 border-b border-zinc-700 py-2 last:border-b-0">
            <Link className="transition-all hover:text-blue-400" to={`/projects/${project_id}/documents/${item.id}`}>
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      {mentionsData?.data?.length === 0 && !isFetching ? <Alert label="This document isn't mentioned anywhere." /> : null}
      {isFetching ? <Skeleton type="drawer_form" /> : null}
    </DrawerLayout>
  );
}
