/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useQuery } from "@tanstack/react-query";
import groupBy from "lodash.groupby";
import { useParams } from "react-router-dom";
import { findChildren, findElementAtPosition } from "remirror";

import { baseURLS, FetchFunction, getImageURL, getSingularEntityType, IconEnum } from "../../../utils";
import { Button } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Alert, Avatar } from "../../Misc";

type Props = {
  data: {
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
  };
};

type MatchedMentionItem = {
  id: string;
  title: string;
  image_id?: string;
};

export function MentionedInDocumentDrawer({ data }: Props) {
  const { project_id } = useParams();
  const { doc } = data.getContext.getState();
  const mentions = findChildren({ node: doc, predicate: (child) => child.node.type.name === "mentionAtom", descend: true });
  const formattedMentions = mentions.map((mention) => ({
    id: mention.node.attrs.id,
    idWithPosition: `${mention.pos}-${mention.node.attrs.id}`,
    label: mention.node.attrs.label,
    type: mention.node.attrs.name,
    from: mention.pos,
    // Mentions take up only one character space
    to: mention.pos + 1,
  }));
  const groupedMentions = groupBy(formattedMentions, "type");
  const { data: mentionsData, isFetching } = useQuery<{ data: MatchedMentionItem[] }>(
    ["mentions_in_document"],
    async () =>
      FetchFunction({
        method: "POST",
        body: JSON.stringify({
          data: {
            mentions: groupedMentions,
          },
        }),
        url: `${baseURLS.baseServer}/documents/mentions_in_document`,
      }),
    {
      staleTime: 5 * 60 * 1000,
    },
  );
  if ((!mentionsData?.data && !isFetching) || mentionsData?.data?.length === 0)
    return <Alert label="No mentions found." variant="info" />;
  return (
    <DrawerLayout>
      <ul className="flex max-h-full flex-col gap-y-1 overflow-y-auto">
        {formattedMentions.map((mention) => {
          const matchIdx = mentionsData?.data?.findIndex((item) => item.id === mention.id);
          if (matchIdx === -1 || matchIdx === undefined) return null;
          const matchedData = mentionsData?.data?.[matchIdx];

          return (
            <li
              key={mention.idWithPosition}
              className="flex items-center gap-x-2 border-b border-zinc-700 py-2 last:border-b-0"
              onMouseOut={() => {
                data.getContext.commands.setAnnotations([]);
              }}
              onMouseOver={() => {
                data.getContext.commands.setAnnotations([
                  {
                    id: mention.idWithPosition,
                    from: mention.from,
                    to: mention.to,
                    className: "selectedAnnotation",
                  },
                ]);
              }}>
              {matchedData?.image_id ? (
                <Avatar image={getImageURL(project_id as string, "images", matchedData.image_id)} size="sm" />
              ) : null}
              {mention.label}
              <span className="text-sm text-zinc-400">(Type: {getSingularEntityType(mention.type)})</span>
              <div className="ml-auto">
                <Button
                  hasNoBackground
                  icon={IconEnum.eye}
                  onClick={() => {
                    // mention.from is equal to the mentions pos
                    const domN = findElementAtPosition(mention.from, data.getContext.view);
                    if (domN) {
                      domN.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                    }
                  }}
                  tooltip="Go to mention"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </DrawerLayout>
  );
}
