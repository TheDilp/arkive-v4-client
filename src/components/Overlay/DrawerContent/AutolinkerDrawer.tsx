/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable no-control-regex */
/* eslint-disable no-restricted-syntax */

import { Node } from "@remirror/pm/model";
import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FromToProps } from "remirror";

import { SearchableMentionEntities } from "../../../types";
import { baseURLS, FetchFunction, getImageURL, IconEnum } from "../../../utils";
import { Button, Checkbox, Select } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Alert, Avatar } from "../../Misc";

type Props = {
  data: {
    id: string;
    title: string;
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
  };
};
type matchItem = { id: string; title: string; image_id?: string };
type matchResult = FromToProps & matchItem;

function gatherFindResults(
  doc: Node,
  matchWords: string,
  potentialMatches: matchItem[],
  selectedEntity: SearchableMentionEntities | null,
): matchResult[] {
  if (!matchWords || !selectedEntity) {
    return [];
  }

  const re = new RegExp(`\\b(${matchWords})\\b`, "gui");
  const ranges: matchResult[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) {
      return true;
    }
    let tc = "";

    node.content.forEach((child) => {
      if (child.type.name === "mentionAtom") {
        const textContent = child.attrs.label;
        if (textContent) {
          // Must use as replacement for mentions as they
          // take up space in text (in order to get correct pos of text)
          tc += " ";
        }
      } else {
        tc = tc.concat(child.textContent);
      }
    });
    const start = pos + 1;
    for (const match of tc.matchAll(re)) {
      const from = start + (match.index ?? 0);
      const to = from + match[0].length;

      const matchedItem = potentialMatches.find((item) =>
        selectedEntity === "characters"
          ? item.title.toLowerCase().includes(match[0].toLowerCase())
          : item.title.toLowerCase() === match[0].toLowerCase(),
      );
      if (matchedItem) ranges.push({ from, to, id: matchedItem.id, title: matchedItem.title, image_id: matchedItem?.image_id });
    }

    return false;
  });

  return ranges;
}

function createMentions(
  initialRanges: matchResult[],
  getContext: ReactFrameworkOutput<Remirror.Extensions>,
  selectedEntity: SearchableMentionEntities | null,
  project_id: string,
) {
  if (!selectedEntity) return;

  const initialRangesCount = initialRanges.length;
  let count = initialRangesCount;

  while (count > 0) {
    if (count > 0) count -= 1;
    const range = initialRanges[count];
    getContext.commands.createMentionAtom(
      {
        name: selectedEntity,
        range: {
          from: range.from,
          cursor: range.to,
          to: range.to,
        },
      },
      {
        id: range.id,
        label: range.title,
        name: selectedEntity,
        projectId: project_id,
      },
    );
    // initialRanges = gatherFindResults(getContext.getState().doc, matchWords, matchedItems);
  }
}

const MentionEntityOptions: { label: string; value: SearchableMentionEntities; icon: string }[] = [
  {
    label: "Documents",
    value: "documents",
    icon: IconEnum.document,
  },
  {
    label: "Characters",
    value: "characters",
    icon: IconEnum.character,
  },
];

export function AutolinkerDrawer({ data }: Props) {
  const { project_id } = useParams();
  const text = data?.getContext.helpers.getText();
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<SearchableMentionEntities | null>(null);
  const { data: links, isFetching } = useQuery<{ data: matchItem[] }>(
    ["autolinker", selectedEntity, data.id],
    async () => {
      let formattedText = text.replaceAll(/(\\n)+/g, "");
      formattedText = text
        .replaceAll(/\u0000/g, "")
        .replaceAll(".", "")
        .replaceAll(/(\r\n|\n|\r)/giu, "  ")
        .trim();
      return FetchFunction({
        method: "POST",
        body: JSON.stringify({
          data: {
            project_id,
            text: formattedText,
            ignore: selectedEntity === "documents" ? data.title : "",
            type: selectedEntity,
          },
        }),
        url: `${baseURLS.baseServer}/documents/autolink`,
      });
    },
    {
      enabled: text.length > 0 && !!selectedEntity,
    },
  );
  const [ranges, setRanges] = useState<matchResult[]>([]);

  useEffect(() => {
    data.getContext.commands.setAnnotations([]);
    setRanges([]);
  }, [selectedEntity]);

  useEffect(() => {
    if (selectedLinks.length) {
      const selectedItemsAnnotations = [];
      for (let index = 0; index < selectedLinks.length; index += 1) {
        const selectedIdx = ranges.findIndex((r) => `${r.from}-${r.id}-${r.to}` === selectedLinks[index]);
        if (selectedIdx > -1) {
          const idWithRange = `${ranges[selectedIdx].from}-${ranges[selectedIdx].id}-${ranges[selectedIdx].to}`;
          selectedItemsAnnotations.push({
            id: idWithRange,
            from: ranges[selectedIdx].from,
            to: ranges[selectedIdx].to,
            className: "annotation",
          });
        }
      }
      data.getContext.commands.setAnnotations(selectedItemsAnnotations);
    }
  }, [selectedLinks]);

  useEffect(() => {
    if (links?.data && selectedEntity) {
      const matchWords = links.data.flatMap((res) => res.title).join("|");
      setRanges(gatherFindResults(data.getContext.getState().doc, matchWords, links.data, selectedEntity));
    }
  }, [links?.data, selectedEntity]);
  return (
    <DrawerLayout>
      <Select
        isLoading={isFetching}
        name="selectedEntity"
        onChange={({ value }) => setSelectedEntity(value as SearchableMentionEntities)}
        options={MentionEntityOptions}
        value={selectedEntity}
      />
      <ul className="flex flex-col gap-y-2">
        {ranges?.length
          ? ranges.map((potentialMatch) => {
              const idWithRange = `${potentialMatch.from}-${potentialMatch.id}-${potentialMatch.to}`;
              return (
                <li
                  key={idWithRange}
                  className="flex cursor-pointer flex-nowrap items-center gap-x-2 hover:text-blue-300"
                  onMouseOut={() => {
                    if (!selectedLinks.includes(idWithRange)) data.getContext.commands.removeAnnotations([idWithRange]);
                  }}
                  onMouseOver={() => {
                    if (!selectedLinks.includes(idWithRange))
                      data.getContext.commands.setAnnotations([
                        ...(data.getContext.helpers.getAnnotations() || []),
                        {
                          id: idWithRange,
                          from: potentialMatch.from,
                          to: potentialMatch.to,
                          className: "annotation",
                        },
                      ]);
                  }}>
                  <Checkbox
                    name={potentialMatch.id}
                    onChange={({ value }) =>
                      setSelectedLinks((prev) => (value ? prev.concat(idWithRange) : prev.filter((id) => id !== idWithRange)))
                    }
                    value={selectedLinks.includes(idWithRange)}
                  />
                  {selectedEntity === "characters" && potentialMatch.image_id ? (
                    <Avatar image={getImageURL(project_id as string, "images", potentialMatch.image_id)} size="xs" />
                  ) : null}
                  <span
                    onClick={() =>
                      setSelectedLinks((prev) =>
                        prev.includes(idWithRange) ? prev.filter((id) => id !== idWithRange) : prev.concat(idWithRange),
                      )
                    }>
                    {potentialMatch.title}
                  </span>
                </li>
              );
            })
          : null}
      </ul>

      {links?.data && !links?.data?.length ? <Alert label="No matches found." variant="info" /> : null}
      <div>
        <Button
          icon={IconEnum.mention}
          isDisabled={!links?.data?.length || !selectedEntity || !text.length}
          label="Create mentions"
          onClick={() =>
            createMentions(
              ranges?.filter((link) => selectedLinks.includes(`${link.from}-${link.id}-${link.to}`)) || [],
              data.getContext,
              selectedEntity,
              project_id as string,
            )
          }
          variant="info"
        />
      </div>
    </DrawerLayout>
  );
}
