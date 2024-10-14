/* eslint-disable no-control-regex */

import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { findElementAtPosition, FromToProps, ProsemirrorNode } from "remirror";

import { SearchableMentionEntities } from "../../../types";
import {
  AvailableIcons,
  baseURLS,
  createMentions,
  CustomAnnotation,
  drawerAtom,
  FetchFunction,
  getElementPosition,
  getRanges,
  IconEnum,
  MentionEntityOptions,
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
    }
  );

  const [ranges, setRanges] = useState<matchResult[]>([]);
  useLayoutEffect(() => {
    const annotations = ((data.getContext?.helpers?.getAnnotations() as CustomAnnotation[]) || []).filter(
      (a: CustomAnnotation) => a.type !== "mention"
    );

    data.getContext.commands.setAnnotations(annotations);
    setRanges([]);
  }, [selectedEntity]);

  useEffect(() => {
    if (selectedLinks.length) {
      const selectedItemsAnnotations: CustomAnnotation[] = [];
      for (let index = 0; index < selectedLinks.length; index += 1) {
        const selectedIdx = ranges.findIndex((r) => `${r.from}-${r.id}-${r.to}` === selectedLinks[index]);
        if (selectedIdx > -1) {
          const idWithRange = `${ranges[selectedIdx].from}-${ranges[selectedIdx].id}-${ranges[selectedIdx].to}`;
          selectedItemsAnnotations.push({
            id: idWithRange,
            from: ranges[selectedIdx].from,
            to: ranges[selectedIdx].to,
            className: "selectedAnnotation",
            text: "",
            // @ts-ignore
            type: "mention",
          });
        }
      }
      const commentAnnotations = ((data.getContext?.helpers?.getAnnotations() as CustomAnnotation[]) || []).filter(
        (a: CustomAnnotation) => a.type !== "mention"
      );
      data.getContext.commands.setAnnotations(selectedItemsAnnotations.concat(commentAnnotations || []));
    }
  }, [selectedLinks, selectedEntity, ranges]);

  useEffect(() => {
    if (links?.data && selectedEntity) {
      setRanges(getRanges(data.getContext.getState().doc as ProsemirrorNode, links.data, selectedEntity, "automention"));
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
                      (highlight: { id: string }) => !selectedLinks.includes(highlight.id)
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
                          // @ts-ignore
                          type: "mention",
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
                    <Avatar image_id={potentialMatch.image_id} size="xs" />
                  ) : null}
                  <span
                    className="flex items-center justify-between gap-x-2 truncate"
                    onClick={() =>
                      setSelectedLinks((prev) =>
                        prev.includes(idWithRange) ? prev.filter((id) => id !== idWithRange) : prev.concat(idWithRange)
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
                          domN.scrollIntoView({ behavior: "smooth", block: "center", inline: "end" });
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
              links?.data || []
            );

            if (links?.data) {
              setRanges(
                getRanges(data.getContext.getState().doc as ProsemirrorNode, links.data, selectedEntity, "automention")
              );
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
