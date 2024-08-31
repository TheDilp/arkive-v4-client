import { PlaceholderExtension, useHelpers, useKeymap, useRemirrorContext } from "@remirror/react";
import { useAtomValue } from "jotai";
import { Dispatch, SetStateAction, useCallback } from "react";
import { useParams } from "react-router-dom";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { AnyExtension, EditorState, ExtensionPriority, InvalidContentHandlerProps } from "remirror";
import {
  Annotation,
  AnnotationExtension,
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  DropCursorExtension,
  GapCursorExtension,
  HardBreakExtension,
  HeadingExtension,
  HorizontalRuleExtension,
  ItalicExtension,
  LinkExtension,
  MarkdownExtension,
  NodeFormattingExtension,
  OrderedListExtension,
  ParagraphExtension,
  TaskListExtension,
  UnderlineExtension,
} from "remirror/extensions";

import {
  CustomImageExtension,
  CustomMentionExtension,
  CustomTableExtension,
  DiceFormulaExtension,
} from "../../components/Complex/Editor/Extensions";
import CustomCalloutExtension from "../../components/Complex/Editor/Extensions/CustomCalloutExtension";
import SecretExtension from "../../components/Complex/Editor/Extensions/SecretExtension";
import { SpoilerExtension } from "../../components/Complex/Editor/Extensions/SpoilerExtension";
import TableOfContentsExtension from "../../components/Complex/Editor/Extensions/TableOfContentsExtension";
import { useUpdateEntity } from "../../hooks";
import { ConversationType, DocumentType, MessageKindType, NotificationType, slashMenuItem } from "../../types";
import { mentionDropdownAtom } from "../atoms";
import { IconEnum } from "../enums";
import { Dice, DiceRollParser, DiceRollRegex } from "./diceRollerUtils";

export interface CustomAnnotation extends Annotation {
  type: "mention" | "comment";
}

const defaultMatchers = [
  {
    char: "@",
    name: "characters",
    supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
    matchOffset: 1,
  },
  {
    char: "@b:",
    name: "blueprint_instances",

    supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
  },
  {
    char: "@d:",
    name: "documents",
    supportedCharacters: /[\w\d_]+( [\w\d_]+){0,2}/g,
  },
  {
    char: "@m:",
    name: "maps",
    supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
  },
  {
    char: "@mp:",
    name: "map_pins",
    supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
  },
  {
    char: "@g:",
    name: "graphs",
    supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
  },
  {
    char: "@w:",
    name: "words",
    supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
  },
  {
    char: "@e:",
    name: "events",
    supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
  },
];

const matchers = IS_GATEWAY ? defaultMatchers.filter((m) => m.name !== "words") : defaultMatchers;
export function DefaultEditorExtensions(
  createNotification?: (notification: Omit<NotificationType, "id">) => void,
  customPlaceholder?: string
): AnyExtension[] {
  const CME = new CustomMentionExtension({
    matchers,
  });

  const DiceRollerExtension = new DiceFormulaExtension({
    extraAttributes: {
      class: () => "dice-roll",
    },
    autoLinkRegex: DiceRollRegex,
    autoLink: true,
    selectTextOnClick: false,
  });

  // @ts-ignore
  DiceRollerExtension.addHandler("onClick", async (...props) => {
    const parsedNotation = DiceRollParser.parseNotation(props[1].text);
    const res = await Dice.roll(parsedNotation);
    const rollData = DiceRollParser.parseFinalResults(res);
    if (rollData?.valid) {
      if (createNotification)
        createNotification({
          timer: 2,
          title: "Dice roll",
          variant: "info",
          position: "top",
          data: rollData,
          type: "dice_roll",
        });
    } else if (createNotification)
      createNotification({
        timer: 2,
        title: "The dice roll notation is not valid.",
        icon: IconEnum.warning,
        variant: "error",
        position: "top",
      });

    return true;
  });
  return [
    new ParagraphExtension({
      priority: ExtensionPriority.Highest,
    }),
    new MarkdownExtension({}),
    new AnnotationExtension<CustomAnnotation>({}),
    new SecretExtension({
      secret: true,
    }),
    new PlaceholderExtension({
      placeholder: customPlaceholder ?? "Write something awesome! 📜",
    }),
    // @ts-ignore
    CME,
    new SpoilerExtension({ priority: ExtensionPriority.Lowest }),
    new CustomCalloutExtension({
      type: "info",
    }),
    new BoldExtension({}),
    new ItalicExtension({}),
    new HeadingExtension({
      extraAttributes: {
        id: () => crypto.randomUUID(),
      },
    }),
    new UnderlineExtension({}),
    new BlockquoteExtension({}),
    new BulletListExtension({
      enableSpine: false,
    }),
    new TaskListExtension({}),
    new OrderedListExtension({}),
    new LinkExtension({
      defaultTarget: "_blank",
      priority: 0,
      autoLink: true,
    }),
    DiceRollerExtension,
    new CustomImageExtension({
      enableResizing: true,
      extraAttributes: {
        id: {
          default: "",
          validate: () => true,
          toDOM: () => ["data-id"],
        },
      },
      nodeOverride: {
        selectable: true,
      },
    }),
    new HorizontalRuleExtension({}),
    new NodeFormattingExtension({}),
    new HardBreakExtension({}),
    new GapCursorExtension({}),
    new DropCursorExtension({}),
    new TableOfContentsExtension({}),

    new CustomTableExtension({
      tabKeyboardShortcuts: true,
      priority: 0,
      resizable: false,
      resizeableOptions: {
        cellMinWidth: 500,
      },
    }),
  ];
}
export function onError({ json, invalidContent, transformers }: InvalidContentHandlerProps) {
  // Automatically remove all invalid nodes and marks.
  return transformers.remove(json, invalidContent);
}
export function documentEditorHooks(changedData: any, resetChanges: () => void, refetch: () => void) {
  return [
    () => {
      const { getJSON } = useHelpers();
      const { project_id, item_id } = useParams();
      const { mutate } = useUpdateEntity<{ data: Partial<DocumentType> }>("documents", project_id as string);

      const handleSaveShortcut = useCallback(
        ({ state }: { state: EditorState }) => {
          mutate(
            {
              data: {
                id: item_id as string,
                content: getJSON(state),
              },
            },
            {
              onSuccess: resetChanges,
            }
          );
          return true; // Prevents any further key handlers from being run.
        },
        [getJSON, item_id]
      );
      const handleCancelSaveShortcut = useCallback(() => {
        if (changedData) {
          resetChanges();
          refetch();
        }
        return true;
      }, [changedData]);

      // "Mod" means platform agnostic modifier key - i.e. Ctrl on Windows, or Cmd on MacOS

      useKeymap("Mod-s", handleSaveShortcut);
      useKeymap("Mod-k", handleCancelSaveShortcut);
    },
  ];
}
export function messageEditorHooks(
  id: string,
  selectedCharacter: string | undefined,
  characters: ConversationType["characters"],
  selectedType: MessageKindType,
  sendJsonMessage: SendJsonMessage,
  conversation: Partial<ConversationType> | undefined,
  canSend: boolean,
  setMessageLength: Dispatch<SetStateAction<number>>
) {
  return [
    () => {
      const { getJSON } = useHelpers();
      const getContext = useRemirrorContext();
      const { project_id } = useParams();

      const isMentionDropdownOpen = useAtomValue(mentionDropdownAtom);

      const handleSendMessage = useCallback(() => {
        if (!isMentionDropdownOpen && canSend && (selectedType === "character" || selectedType === "narration")) {
          const jsonContent = getJSON();

          const character = selectedType === "character" ? characters.find((char) => char.id === selectedCharacter) : null;
          const messageData = {
            id: crypto.randomUUID(),
            parent_id: id,
            content: jsonContent,
            type: selectedType,
            sender_id: selectedCharacter,
            full_name: character?.full_name || null,
            portrait_id: character?.portrait_id || null,
          };

          sendJsonMessage({
            data: messageData,
            project_id,
            conversation,
          });

          getContext.clearContent();
          setMessageLength(0);
          return true;
        }
        return false;
      }, [selectedCharacter, selectedType, isMentionDropdownOpen, canSend]);

      useKeymap("Enter", handleSendMessage);
    },
  ];
}
export const defaultSlashItems: slashMenuItem[] = [
  {
    name: "Heading 1",
    type: "heading",
    level: 1,
    icon: IconEnum.heading_one,
  },
  {
    name: "Heading 2",
    type: "heading",
    level: 2,
    icon: IconEnum.heading_two,
  },
  {
    name: "Heading 3",
    type: "heading",
    level: 3,
    icon: IconEnum.heading_three,
  },
  {
    name: "Heading 4",
    type: "heading",
    level: 4,
    icon: IconEnum.heading_four,
  },
  {
    name: "Heading 5",
    type: "heading",
    level: 5,
    icon: IconEnum.heading_five,
  },
  {
    name: "Heading 6",
    type: "heading",
    level: 6,
    icon: IconEnum.heading_six,
  },
  { name: "Bullet List", type: "list", icon: IconEnum.bullet_list },
  { name: "Ordered List", type: "list", icon: IconEnum.numbered_list },
  {
    name: "Task List",
    type: "list",
    icon: IconEnum.check_double,
  },
  { name: "Quote", type: "quote", icon: IconEnum.quote },
  {
    name: "Callout Info",
    type: "callout",
    callout_type: "info",
    icon: IconEnum.callout,
    color: "lightskyblue",
  },
  {
    name: "Callout Erro",
    type: "callout",
    callout_type: "error",
    icon: IconEnum.error,
    color: "#f00",
  },
  {
    name: "Callout Warning",
    type: "callout",
    callout_type: "warning",
    icon: IconEnum.warning,
    color: "#ff0",
  },
  {
    name: "Callout Success",
    type: "callout",
    callout_type: "success",
    icon: IconEnum.check_circle,
    color: "#0f0",
  },
  { name: "Image", type: "image", icon: IconEnum.image },
  { name: "Divider", type: "divider", icon: IconEnum.divider },
  { name: "Secret", type: "secret", icon: IconEnum.eye },
  { name: "Table", type: "table", icon: IconEnum.table },
];
