/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable no-control-regex */
/* eslint-disable no-restricted-syntax */

import { Node } from "@remirror/pm/model";
import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { findElementAtPosition, FromToProps } from "remirror";

import { SearchableMentionEntities } from "../../../types";
import {
  AvailableIcons,
  baseURLS,
  drawerAtom,
  FetchFunction,
  getElementPosition,
  getImageURL,
  IconEnum,
  mentionPositionAtom,
} from "../../../utils";
import { Button, Checkbox, Select } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Alert, Avatar, Icon } from "../../Misc";

type Props = {
  data: {
    id: string;
    title: string;
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
  };
};
type matchItem = { id: string; title: string; blueprint_title?: string; image_id?: string; icon?: string; parent_id?: string };
type matchResult = FromToProps & matchItem;

function getRanges(doc: Node, potentialMatches: matchItem[], selectedEntity: SearchableMentionEntities | null): matchResult[] {
  const matchWords = potentialMatches.flatMap((res) => res.title.trim()).join("|");
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
      } else if (child.type.name === "image") {
        tc += " ";
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
      if (matchedItem)
        ranges.push({
          from,
          to,
          id: matchedItem.id,
          title: matchedItem.title,
          icon: matchedItem.icon,
          blueprint_title: matchedItem?.blueprint_title,
          image_id: matchedItem?.image_id,
        });
    }

    return false;
  });

  return selectedEntity === "blueprint_instances"
    ? ranges.sort((a, b) => {
        if (a.blueprint_title && b.blueprint_title) {
          if (a.blueprint_title < b.blueprint_title) return -1;
          if (a.blueprint_title > b.blueprint_title) return 1;
          return 0;
        }
        return 0;
      })
    : ranges;
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
        icon: range.icon,
        projectId: project_id,
        parent_id: range.parent_id,
      },
    );
  }
}

const MentionEntityOptions: { label: string; value: SearchableMentionEntities; icon: AvailableIcons }[] = [
  {
    label: "Characters",
    value: "characters",
    icon: IconEnum.character,
  },
  {
    label: "Blueprints",
    value: "blueprint_instances",
    icon: IconEnum.blueprint,
  },
  {
    label: "Documents",
    value: "documents",
    icon: IconEnum.document,
  },
  {
    label: "Maps",
    value: "maps",
    icon: IconEnum.map,
  },
  {
    label: "Map pins",
    value: "map_pins",
    icon: IconEnum.map_pin,
  },
  {
    label: "Graph",
    value: "graphs",
    icon: IconEnum.graph,
  },
  {
    label: "Words",
    value: "words",
    icon: IconEnum.word,
  },
];

export function AutomentionDrawer({ data }: Props) {
  const { project_id } = useParams();
  const resetAtomDrawer = useResetAtom(drawerAtom);
  const setMentionPosition = useSetAtom(mentionPositionAtom);
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
        url: `${baseURLS.baseServer}/documents/automention`,
      });
    },
    {
      enabled: text.length > 0 && !!selectedEntity,
    },
  );

  const [ranges, setRanges] = useState<matchResult[]>([]);

  useLayoutEffect(() => {
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
            className: "selectedAnnotation",
          });
        }
      }
      data.getContext.commands.setAnnotations(selectedItemsAnnotations);
    }
  }, [selectedLinks, selectedEntity, ranges]);

  useEffect(() => {
    if (links?.data && selectedEntity) {
      setRanges(getRanges(data.getContext.getState().doc, links.data, selectedEntity));
    }
  }, [links?.data, selectedEntity]);
  return (
    <DrawerLayout>
      <Select
        hasSearch
        isLoading={isFetching}
        name="selectedEntity"
        onChange={({ value }) => setSelectedEntity(value as SearchableMentionEntities)}
        options={MentionEntityOptions}
        value={selectedEntity}
      />
      <ul className="flex max-h-full flex-col gap-y-2 overflow-y-auto">
        {ranges?.length
          ? ranges.map((potentialMatch) => {
              const idWithRange = `${potentialMatch.from}-${potentialMatch.id}-${potentialMatch.to}`;
              return (
                <li
                  key={idWithRange}
                  className="flex cursor-pointer flex-nowrap items-center gap-x-2 hover:text-blue-300"
                  onMouseOut={() => {
                    const highlighted = data.getContext.helpers.getAnnotations();
                    const notSelected = highlighted.filter(
                      (highlight: { id: string }) => !selectedLinks.includes(highlight.id),
                    );
                    const notSelectedIds = notSelected.map((s: { id: string }) => s.id);
                    if (!selectedLinks.includes(idWithRange))
                      data.getContext.commands.removeAnnotations([...notSelectedIds, idWithRange]);

                    setMentionPosition(null);
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
                    const domN = findElementAtPosition(potentialMatch.from, data.getContext.view);
                    if (domN) {
                      const position = getElementPosition(domN);
                      setMentionPosition(position);
                    }
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
                    className="flex items-center justify-between gap-x-2 truncate"
                    onClick={() =>
                      setSelectedLinks((prev) =>
                        prev.includes(idWithRange) ? prev.filter((id) => id !== idWithRange) : prev.concat(idWithRange),
                      )
                    }>
                    <span className="flex items-center gap-x-2">
                      {potentialMatch?.icon ? <Icon icon={potentialMatch?.icon as AvailableIcons} /> : null}
                      {potentialMatch.title}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {potentialMatch?.blueprint_title ? `(${potentialMatch?.blueprint_title})` : ""}
                    </span>
                  </span>
                  <div className="ml-auto">
                    <Button
                      hasNoBackground
                      icon={IconEnum.eye}
                      onClick={() => {
                        // mention.from is equal to the mentions pos
                        const domN = findElementAtPosition(potentialMatch.from, data.getContext.view);
                        if (domN) {
                          domN.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                          setMentionPosition(null);
                        }
                      }}
                      tooltip="Go to mention"
                    />
                  </div>
                </li>
              );
            })
          : null}
      </ul>

      {links?.data && !links?.data?.length ? <Alert label="No matches found." variant="info" /> : null}
      <div className="flex flex-col gap-2 lg:flex-row lg:flex-nowrap">
        <Button
          icon={IconEnum.close}
          label="Close"
          onClick={() => {
            const activeAnnotations = data.getContext.helpers.getAnnotations();
            if (activeAnnotations.length)
              data.getContext.commands.removeAnnotations(activeAnnotations.map((a: { id: string }) => a.id));
            resetAtomDrawer();
          }}
        />
        <Button
          icon={IconEnum.mention}
          isDisabled={!links?.data?.length || !selectedEntity || !text.length}
          label="Create mentions"
          onClick={() => {
            createMentions(
              ranges?.filter((link) => selectedLinks.includes(`${link.from}-${link.id}-${link.to}`)) || [],
              data.getContext,
              selectedEntity,
              project_id as string,
            );

            if (links?.data) {
              setRanges(getRanges(data.getContext.getState().doc, links.data, selectedEntity));
              setSelectedLinks([]);
            }

            const activeAnnotations = data.getContext.helpers.getAnnotations();
            if (activeAnnotations.length)
              data.getContext.commands.removeAnnotations(activeAnnotations.map((a: { id: string }) => a.id));
          }}
          variant="info"
        />
      </div>
    </DrawerLayout>
  );
}
