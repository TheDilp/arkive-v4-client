/* eslint-disable no-control-regex */
/* eslint-disable no-restricted-syntax */

import { Node } from "@remirror/pm/model";
import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { FromToProps } from "remirror";

import { baseURLS, FetchFunction, IconEnum } from "../../../utils";
import { Button, Checkbox } from "../../Form";
import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    id: string;
    title: string;
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
  };
};
type matchItem = { id: string; title: string; project_id: string };
type matchResult = FromToProps & matchItem;
function gatherFindResults(doc: Node, matchWords: string, potentialMatches: matchItem[]): matchResult[] {
  if (!matchWords) {
    return [];
  }

  const re = new RegExp(`\\b(${matchWords})\\b`, "gim");
  const ranges: matchResult[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) {
      return true;
    }

    const start = pos + 1;

    for (const match of node.textContent.matchAll(re)) {
      const from = start + (match.index ?? 0);
      const to = from + match[0].length;

      const matchedItem = potentialMatches.find((item) => item.title.toLowerCase() === match[0]);
      if (matchedItem)
        ranges.push({ from, to, id: matchedItem.id, title: matchedItem.title, project_id: matchedItem.project_id });
    }

    return false;
  });

  return ranges;
}

function createMentions(matchedItems: matchItem[], getContext: ReactFrameworkOutput<Remirror.Extensions>) {
  const matchWords = matchedItems.flatMap((res) => res.title.split(" ")).join("|");

  const initialRanges = gatherFindResults(getContext.getState().doc, matchWords, matchedItems);
  const initialRangesCount = initialRanges.length;
  let count = initialRangesCount;

  while (count > 0) {
    if (count > 0) count -= 1;
    const range = initialRanges[count];
    getContext.commands.createMentionAtom(
      {
        name: "documents",
        range: {
          from: range.from,
          cursor: range.to,
          to: range.to,
        },
      },
      {
        id: range.id,
        label: range.title,
        name: "documents",
        projectId: range.project_id,
      },
    );
    // initialRanges = gatherFindResults(getContext.getState().doc, matchWords, matchedItems);
  }
}

export function AutolinkerDrawer({ data }: Props) {
  const { project_id } = useParams();
  const text = data?.getContext.helpers.getText();
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const { data: links } = useQuery<{ data: matchItem[] }>(
    ["autolinker", data.id],
    async () => {
      let formattedText = text.replaceAll(/[\n]/g, "");
      formattedText = text.replaceAll(/\u0000/g, "");
      return FetchFunction({
        method: "POST",
        body: JSON.stringify({
          data: {
            project_id,
            text: formattedText,
            ignore: data.title,
          },
        }),
        url: `${baseURLS.baseServer}/documents/autolink`,
      });
    },
    {
      enabled: text.length > 0,
    },
  );

  return (
    <DrawerLayout>
      {links?.data?.length
        ? links.data.map((link) => (
            <div key={link.id} className="flex flex-nowrap items-center gap-x-2">
              <Checkbox
                name={link.id}
                onChange={({ value }) =>
                  setSelectedLinks((prev) => (value ? prev.concat(link.id) : prev.filter((id) => id !== link.id)))
                }
                value={selectedLinks.includes(link.id)}
              />

              {link.title}
            </div>
          ))
        : null}
      <div>
        <Button
          icon={IconEnum.link}
          isDisabled={!links?.data?.length}
          label="Create mentions"
          onClick={() => createMentions(links?.data?.filter((link) => selectedLinks.includes(link.id)) || [], data.getContext)}
          variant="info"
        />
      </div>
    </DrawerLayout>
  );
}
