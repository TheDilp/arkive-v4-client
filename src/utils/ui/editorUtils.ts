import { PlaceholderExtension, useHelpers, useKeymap, useRemirrorContext } from "@remirror/react";
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters, useQueryClient } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import { useAtomValue } from "jotai";
import { Dispatch, SetStateAction, useCallback } from "react";
import { useParams } from "react-router-dom";
import { SendJsonMessage } from "react-use-websocket/dist/lib/types";
import { AnyExtension, EditorState, InvalidContentHandlerProps } from "remirror";
import {
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
  MentionAtomExtension,
  NodeFormattingExtension,
  OrderedListExtension,
  TaskListExtension,
  UnderlineExtension,
} from "remirror/extensions";

import { CustomCalloutExtension } from "../../components/Complex/Editor/Extensions/CustomCalloutExtension";
import { CustomImageExtension } from "../../components/Complex/Editor/Extensions/CustomImageExtension";
import { CustomTableExtension } from "../../components/Complex/Editor/Extensions/CustomTableExtension";
import { DiceFormulaExtension } from "../../components/Complex/Editor/Extensions/DiceFormulaExtension";
import { MentionReactComponent } from "../../components/Complex/Editor/Extensions/Mention";
import { SecretExtension } from "../../components/Complex/Editor/Extensions/SecretExtension";
import { TableOfContentsExtension } from "../../components/Complex/Editor/Extensions/TableOfContentsExtension";
import { useUpdateEntity } from "../../hooks";
import { ConversationType, DocumentType, MessageKindType, NotificationType } from "../../types";
import { mentionDropdownAtom } from "../atoms";
import { IconEnum } from "../enums";
import { Dice, DiceRollParser, DiceRollRegex } from "./diceRollerUtils";

export const DefaultEditorExtensions: (
  createNotification?: (notification: Omit<NotificationType, "id">) => void,
  customPlaceholder?: string,
) => AnyExtension[] = (createNotification, customPlaceholder) => {
  const CustomMentionExtension = new MentionAtomExtension({
    priority: 10,
    extraAttributes: {
      alterId: {
        default: null,
        parseDOM: (dom) => dom.getAttribute("data-alterId"),
        toDOM: () => ["data-alterId"],
      },
      projectId: {
        default: null,
        parseDOM: (dom) => dom.getAttribute("data-projectId"),
        toDOM: () => ["data-projectId"],
      },
    },

    matchers: [
      {
        char: "@",
        name: "characters",
        supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
      },
      {
        char: "#",
        name: "documents",
        supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
      },
      {
        char: "$",
        name: "maps",
        supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
      },
      {
        char: "%",
        name: "boards",
        supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
      },
      {
        char: "^",
        name: "words",
        supportedCharacters: /[\w\d_]+( [\w\d_]+){0}/g,
      },
    ],
  });
  CustomMentionExtension.ReactComponent = MentionReactComponent;

  const DiceRollerExtension = new DiceFormulaExtension({
    extraAttributes: {
      class: () => "dice-roll",
    },
    autoLinkRegex: DiceRollRegex,
    autoLink: true,
    selectTextOnClick: false,
    priority: 10,
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
    new MarkdownExtension({}),
    new SecretExtension({
      secret: true,
    }),
    new PlaceholderExtension({
      placeholder: customPlaceholder ?? "Write something awesome! 📜",
    }),
    CustomMentionExtension,
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
    }),
    DiceRollerExtension,
    new CustomImageExtension({
      enableResizing: true,
    }),
    new HorizontalRuleExtension({}),

    new NodeFormattingExtension({}),
    new HardBreakExtension({}),
    new GapCursorExtension({}),
    new DropCursorExtension({}),
    new TableOfContentsExtension({}),
    new CustomTableExtension({
      priority: 0,
      resizable: false,
      resizeableOptions: {
        cellMinWidth: 500,
      },
    }),
  ];
};
export function onError({ json, invalidContent, transformers }: InvalidContentHandlerProps) {
  // Automatically remove all invalid nodes and marks.
  return transformers.remove(json, invalidContent);
}
export const documentEditorHooks = (
  changedData: any,
  resetChanges: () => void,
  refetch: (options?: (RefetchOptions & RefetchQueryFilters<unknown>) | undefined) => Promise<
    QueryObserverResult<
      {
        data: DocumentType;
      },
      unknown
    >
  >,
  title: string,
) => [
  () => {
    const { getJSON, getText, getHTML } = useHelpers();
    const { project_id, item_id } = useParams();
    const { mutate } = useUpdateEntity<{ data: Partial<DocumentType> }>("documents", project_id as string);

    const handleSaveShortcut = useCallback(
      ({ state }: { state: EditorState }) => {
        mutate(
          {
            data: {
              id: item_id as string,
              content: JSON.stringify(getJSON(state)),
            },
          },
          {
            onSuccess: resetChanges,
          },
        );
        return true; // Prevents any further key handlers from being run.
      },
      [getJSON, item_id],
    );
    const handleCancelSaveShortcut = useCallback(() => {
      if (changedData) {
        resetChanges();
        refetch();
      }
      return true;
    }, [changedData]);
    const handleExportShortcut = useCallback(() => {
      const htmlString = getHTML();
      saveAs(
        new Blob([htmlString], {
          type: "text/html;charset=utf-8",
        }),
        `${title || `Arkive Document - ${item_id}`}.html`,
      );
      return true; // Prevents any further key handlers from being run.
    }, [getText, item_id]);

    // "Mod" means platform agnostic modifier key - i.e. Ctrl on Windows, or Cmd on MacOS

    useKeymap("Mod-s", handleSaveShortcut);
    useKeymap("Mod-k", handleCancelSaveShortcut);
    useKeymap("Mod-e", handleExportShortcut);
  },
];

export const messageEditorHooks = (
  id: string,
  selectedCharacter: string | undefined,
  selectedType: MessageKindType,
  sendJsonMessage: SendJsonMessage,
  conversation: Partial<ConversationType> | undefined,
  canSend: boolean,
  setMessageLength: Dispatch<SetStateAction<number>>,
) => [
  () => {
    const queryClient = useQueryClient();
    const { getJSON } = useHelpers();
    const getContext = useRemirrorContext();
    const { project_id } = useParams();

    const isMentionDropdownOpen = useAtomValue(mentionDropdownAtom);

    const handleSendMessage = useCallback(() => {
      if (!isMentionDropdownOpen && canSend) {
        const jsonContent = getJSON();
        const messageData = {
          id: crypto.randomUUID(),
          parent_id: id,
          content: JSON.stringify(jsonContent),
          type: selectedType,
          sender_id: selectedCharacter,
        };
        queryClient.setQueryData<{ data: ConversationType }>(["conversations", id], (old) => {
          if (old)
            return {
              ...old,
              data: {
                ...old?.data,
                messages: [...(old?.data?.messages || []), { ...messageData, content: jsonContent }],
              },
            };
          return old;
        });
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

// export const defaultSlashItems: slashMenuItem[] = [
//   {
//     name: "Heading 1",
//     type: "heading",
//     level: 1,
//     icon: "mdi:format-header-1",
//   },
//   {
//     name: "Heading 2",
//     type: "heading",
//     level: 2,
//     icon: "mdi:format-header-2",
//   },
//   {
//     name: "Heading 3",
//     type: "heading",
//     level: 3,
//     icon: "mdi:format-header-3",
//   },
//   {
//     name: "Heading 4",
//     type: "heading",
//     level: 4,
//     icon: "mdi:format-header-4",
//   },
//   {
//     name: "Heading 5",
//     type: "heading",
//     level: 5,
//     icon: "mdi:format-header-5",
//   },
//   {
//     name: "Heading 6",
//     type: "heading",
//     level: 6,
//     icon: "mdi:format-header-6",
//   },
//   { name: "Bullet List", type: "list", icon: "mdi:format-list-bulleted" },
//   { name: "Ordered List", type: "list", icon: "mdi:format-list-numbered" },
//   {
//     name: "Task List",
//     type: "list",
//     icon: "mdi:checkbox-marked-circle-outline",
//   },
//   { name: "Quote", type: "quote", icon: "mdi:comment-quote-outline" },
//   {
//     name: "Callout Info",
//     type: "callout",
//     callout_type: "info",
//     icon: "mdi:information-outline",
//     color: "lightskyblue",
//   },
//   {
//     name: "Callout Error",
//     type: "callout",
//     callout_type: "error",
//     icon: "mdi:alpha-x-circle-outline",
//     color: "#f00",
//   },
//   {
//     name: "Callout Warning",
//     type: "callout",
//     callout_type: "warning",
//     icon: "mdi:alert",
//     color: "#ff0",
//   },
//   {
//     name: "Callout Success",
//     type: "callout",
//     callout_type: "success",
//     icon: "mdi:check-outline",
//     color: "#0f0",
//   },
//   { name: "Image", type: "image", icon: "mdi:image" },
//   { name: "Divider", type: "divider", icon: "mdi:minus" },
//   { name: "Secret", type: "secret", icon: "mdi:eye-off-outline" },
// ];
