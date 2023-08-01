import { PlaceholderExtension, useHelpers, useKeymap } from "@remirror/react";
import { saveAs } from "file-saver";
import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { AnyExtension, EditorState } from "remirror";
import {
  BlockquoteExtension,
  BoldExtension,
  BulletListExtension,
  CalloutExtension,
  DropCursorExtension,
  GapCursorExtension,
  HardBreakExtension,
  HeadingExtension,
  HorizontalRuleExtension,
  ImageExtension,
  ItalicExtension,
  LinkExtension,
  MarkdownExtension,
  MentionAtomExtension,
  NodeFormattingExtension,
  OrderedListExtension,
  // TableExtension,
  TaskListExtension,
  UnderlineExtension,
} from "remirror/extensions";

import { MentionReactComponent } from "../../components/Complex/Editor/Extensions/Mention";
import { SecretExtension } from "../../components/Complex/Editor/Extensions/SecretExtension";
import { useGetEntity, useUpdateEntity } from "../../hooks";
import { DocumentType } from "../../types";

const CustomMentionExtension = new MentionAtomExtension({
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
      name: "documents",
      supportedCharacters: /[\w\d_]+( [\w\d_]+){0,2}/g,
    },
    {
      char: "#",
      name: "maps",
      supportedCharacters: /[\w\d_]+( [\w\d_]+){0,2}/g,
    },
    {
      char: "$",
      name: "boards",
      supportedCharacters: /[\w\d_]+( [\w\d_]+){0,2}/g,
    },
    {
      char: "%",
      name: "words",
      supportedCharacters: /[\w\d_]+( [\w\d_]+){0,2}/g,
    },
  ],
});
CustomMentionExtension.ReactComponent = MentionReactComponent;

export const DefaultEditorExtensions: AnyExtension[] = [
  new SecretExtension({
    secret: true,
  }),
  new PlaceholderExtension({
    placeholder: "Write something awesome! 📜",
  }),
  CustomMentionExtension,
  new BoldExtension({}),
  new ItalicExtension({}),
  new HeadingExtension({}),
  new UnderlineExtension({}),
  new BlockquoteExtension({}),
  new BulletListExtension({
    enableSpine: false,
  }),
  new TaskListExtension({}),
  new OrderedListExtension({}),
  new LinkExtension({
    autoLink: true,
    defaultTarget: "_blank",
    selectTextOnClick: true,
  }),
  new ImageExtension({
    enableResizing: true,
  }),
  new HorizontalRuleExtension({}),
  new CalloutExtension({}),
  new NodeFormattingExtension({}),
  new HardBreakExtension({}),
  new MarkdownExtension({}),
  CustomMentionExtension,
  new GapCursorExtension({}),
  new DropCursorExtension({}),
  // new TableExtension({ resizable: true }),
];

export const editorHooks = [
  () => {
    const { getJSON, getText, getHTML } = useHelpers();
    const { project_id, item_id } = useParams();
    const { mutate } = useUpdateEntity<{ data: Partial<DocumentType> }>("documents", project_id as string);
    const { data: document } = useGetEntity<DocumentType>(
      item_id as string,
      "documents",
      { data: {} },
      { staleTime: 5 * 60 * 1000 },
    );
    const handleSaveShortcut = useCallback(
      ({ state }: { state: EditorState }) => {
        mutate({
          data: {
            id: item_id as string,
            content: getJSON(state),
          },
        });
        return true; // Prevents any further key handlers from being run.
      },
      [getJSON, item_id],
    );
    const handleExportShortcut = useCallback(() => {
      const htmlString = getHTML();
      saveAs(
        new Blob([htmlString], {
          type: "text/html;charset=utf-8",
        }),
        `${document?.data?.title || `Arkive Document - ${item_id}`}.html`,
      );
      return true; // Prevents any further key handlers from being run.
    }, [getText, item_id]);

    // "Mod" means platform agnostic modifier key - i.e. Ctrl on Windows, or Cmd on MacOS

    useKeymap("Mod-s", handleSaveShortcut);
    useKeymap("Mod-e", handleExportShortcut);
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
