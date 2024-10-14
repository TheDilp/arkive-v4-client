import { Node } from "@remirror/pm/model";
import { ReactFrameworkOutput, Remirror } from "@remirror/react";
import { FromToProps, ProsemirrorNode } from "remirror";

import { DocumentType, SearchableMentionEntities, Variant } from "../../types";
import { DiceRollRegex } from "./diceRollerUtils";

type matchItem = { id: string; title: string; blueprint_title?: string; image_id?: string; icon?: string; parent_id?: string };
type matchResult = FromToProps & matchItem;
type matchType = "automention" | "dice_roll" | "alter_names";

export const DocumentTemplateFieldRegex = /%\{([^%{}]*)\}%/g;

export function getRegex(type: matchType, matchWords: string) {
  if (type === "automention") return new RegExp(`\\b(${matchWords})\\b`, "gui");
  if (type === "dice_roll") return DiceRollRegex;
  return /%{([^%{}]*)}%/g;
}

export function getRanges(
  doc: Node,
  potentialMatches: matchItem[],
  selectedEntity: SearchableMentionEntities | null,
  type: matchType
): matchResult[] {
  const matchWords = potentialMatches.flatMap((res) => res.title.trim()).join("|");
  if (!matchWords || !selectedEntity) {
    return [];
  }

  const re = getRegex(type, matchWords);
  const ranges: matchResult[] = [];
  doc?.descendants((node, pos) => {
    if (!node.isTextblock) {
      return true;
    }
    let tc = "";
    node.content.forEach((child) => {
      if (type === "alter_names") {
        if (child.type.name === "mentionAtom") {
          const textContent = child.attrs.label;
          if (textContent) {
            // take up space in text (in order to get correct pos of text)
            tc += ` ${textContent}`;
          }
        }
      } else {
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
      }
    });
    const start = pos + 1;
    for (const match of tc.matchAll(re)) {
      const from = start + (match.index ?? 0);
      const to = from + match[0].length;

      const matchedItem = potentialMatches.find((item) =>
        selectedEntity === "characters"
          ? item.title.toLowerCase().includes(match[0].toLowerCase())
          : item.title.toLowerCase() === match[0].toLowerCase()
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

  if (type === "dice_roll") return ranges;

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

export function createMentions(
  initialRanges: matchResult[],
  getContext: ReactFrameworkOutput<Remirror.Extensions>,
  selectedEntity: SearchableMentionEntities | null,
  project_id: string,
  links: matchItem[]
) {
  if (!selectedEntity) return;

  const initialRangesCount = initialRanges.length;
  let newRanges;

  let count = initialRangesCount;

  while (count > 0) {
    if (count > 0) count -= 1;
    const range = (newRanges || initialRanges)[count];
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
      }
    );
    newRanges = getRanges(getContext.getState().doc as ProsemirrorNode, links, selectedEntity, "automention");
  }
}

export function getMatchFieldVariant(field: DocumentType["template_fields"][number]): Variant {
  if (!field.entity_type) return "error";

  if (field.is_randomized) {
    if (!field.random_count) return "error";
    return "primary";
  }

  if (field.entity_type === "custom" && !field.value) return "error";
  if (field.entity_type === "dice_roll" && !field.formula) return "error";
  if (field.entity_type === "derived" && (!field.derive_formula || !field.derive_from)) return "error";
  if (field.entity_type === "blueprint_instances" && !field.blueprint_id) return "error";
  if (field.entity_type === "map_pins" && !field.map_id) return "error";
  if (field.entity_type === "events" && !field.calendar_id) return "error";
  if (field.entity_type === "words" && !field.dictionary_id) return "error";

  if (
    field.entity_type !== "custom" &&
    field.entity_type !== "derived" &&
    field.entity_type !== "dice_roll" &&
    !field.related?.length
  ) {
    return "error";
  }

  return "primary";
}
