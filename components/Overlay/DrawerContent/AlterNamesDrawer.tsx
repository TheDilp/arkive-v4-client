/* eslint-disable no-control-regex */

import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { useSetAtom } from "jotai";
import { useResetAtom } from "jotai/utils";
import groupBy from "lodash.groupby";
import { useEffect, useLayoutEffect, useState } from "react";
import { findChildren, findElementAtPosition, NodeWithPosition } from "remirror";

import { SearchableMentionEntities } from "../../../types";
import {
  CustomAnnotation,
  drawerAtom,
  getElementPosition,
  IconEnum,
  MentionEntityOptions,
  mentionPositionAtom,
} from "../../../utils";
import { Button, Input, Select, Title } from "../../Form";
import { Toggle } from "../../Form/Toggle";
import { DrawerLayout } from "../../Layout";
import { Alert } from "../../Misc";

type Props = {
  data: {
    id: string;
    title: string;
    getContext: ReactFrameworkOutput<Remirror.Extensions>;
  };
};

function AlterNameEdit({
  node,
  getContext,
  groupEdit,
  groupNodePositions,
}: {
  node: NodeWithPosition;
  getContext: Props["data"]["getContext"];
  groupEdit: boolean;
  groupNodePositions: number[];
}) {
  const [alterName, setAlterName] = useState(node.node.attrs.alterName || "");
  return (
    <div className="flex items-end justify-between gap-x-2">
      <Input label="Alternative name" name="alterName" onChange={(e) => setAlterName(e?.value as string)} value={alterName} />
      <div className="mb-1 h-8 w-8">
        <Button
          icon={IconEnum.save}
          isDisabled={!alterName}
          onClick={() => {
            const state = getContext.getState();
            const { tr } = state;
            if (groupEdit) {
              for (let index = 0; index < groupNodePositions.length; index++) {
                tr.setNodeAttribute(groupNodePositions[index], "alterName", alterName);
              }
            } else {
              tr.setNodeAttribute(node.pos, "alterName", alterName);
            }

            if (tr.docChanged) {
              getContext.view.dispatch(tr);
            }
          }}
          variant="success"
        />
      </div>
    </div>
  );
}

export function AlterNamesDrawer({ data }: Props) {
  const resetAtomDrawer = useResetAtom(drawerAtom);
  const setMentionPosition = useSetAtom(mentionPositionAtom);
  const text = data?.getContext.helpers.getText();
  const [selectedEntity, setSelectedEntity] = useState<SearchableMentionEntities | null>(null);
  const [groupEdit, setGroupEdit] = useState(false);
  const [mentions, setMentions] = useState<NodeWithPosition[]>([]);

  const groupedMentions = groupEdit ? groupBy(mentions, (node) => node.node.attrs.id) : {};

  useEffect(() => {
    if (selectedEntity) {
      const temp = findChildren({
        node: data.getContext.getState().doc,
        predicate: (child) =>
          child.node.isAtom && child.node.type.name === "mentionAtom" && child.node.attrs.name === selectedEntity,
      });
      setMentions(temp);
    }
  }, [selectedEntity]);

  useLayoutEffect(() => {
    const annotations = (data.getContext?.helpers?.getAnnotations() as CustomAnnotation[]) || [];

    data.getContext.commands.setAnnotations(annotations);
  }, [selectedEntity]);
  return (
    <DrawerLayout>
      <Select
        hasSearch
        isLoading={false}
        name="selectedEntity"
        onChange={({ value }) => setSelectedEntity(value as SearchableMentionEntities)}
        options={MentionEntityOptions.filter((ent) => ent.hasAlterNames)}
        value={selectedEntity}
      />

      <div className="flex items-center justify-between">
        <span>Group edit mentions</span>
        <Toggle name="groupEdit" onChange={() => setGroupEdit(!groupEdit)} value={groupEdit} />
      </div>

      <ul className="flex max-h-full flex-col gap-y-2 overflow-y-auto">
        {mentions?.length && !groupEdit
          ? mentions.map((mention, idx) => {
              const localMentionId = `${mention.node.attrs.id}-${idx}`;
              return (
                <li
                  // idx won't be changing
                  key={localMentionId}
                  className="flex cursor-pointer flex-col gap-y-2 hover:text-blue-300"
                  onMouseOut={() => {
                    setMentionPosition(null);
                    data.getContext.commands.setAnnotations([]);
                  }}
                  onMouseOver={() => {
                    data.getContext.commands.setAnnotations([
                      ...(data.getContext.helpers.getAnnotations() || []),
                      {
                        id: localMentionId,
                        from: mention.pos,
                        // Mentions only take up one space
                        to: mention.pos + 1,
                        className: "annotation",
                        // @ts-ignore
                        type: "mention",
                      },
                    ]);
                    const domN = findElementAtPosition(mention.pos, data.getContext.view);
                    if (domN) {
                      const position = getElementPosition(domN);
                      setMentionPosition(position);
                    }
                  }}>
                  <Title isDrawerTitle label={mention.node.attrs.label} />
                  <AlterNameEdit getContext={data.getContext} groupEdit={false} groupNodePositions={[]} node={mention} />
                </li>
              );
            })
          : null}

        {groupEdit
          ? Object.entries(groupedMentions).map(([id, mentionsInGroup]) => {
              return (
                <li
                  // idx won't be changing
                  key={id}
                  className="flex cursor-pointer flex-col gap-y-2 hover:text-blue-300"
                  onMouseOut={() => {
                    data.getContext.commands.setAnnotations([]);
                  }}
                  onMouseOver={() => {
                    data.getContext.commands.setAnnotations(
                      mentionsInGroup.map((mentionItem, index) => ({
                        id: `${id}-${index}`,
                        from: mentionItem.pos,
                        // Mentions only take up one space
                        to: mentionItem.pos + 1,
                        className: "annotation",
                        // @ts-ignore
                        type: "mention",
                      }))
                    );
                  }}>
                  <Title isDrawerTitle label={mentionsInGroup?.[0].node.attrs.label} />
                  <AlterNameEdit
                    getContext={data.getContext}
                    groupEdit
                    groupNodePositions={mentionsInGroup.map((m) => m.pos)}
                    node={mentionsInGroup?.[0]}
                  />
                </li>
              );
            })
          : null}
      </ul>

      {mentions && !mentions?.length ? <Alert label="No matches found." variant="info" /> : null}
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
          isDisabled={!mentions?.length || !selectedEntity || !text.length}
          label="Create mentions"
          onClick={() => {}}
          variant="info"
        />
      </div>
    </DrawerLayout>
  );
}
