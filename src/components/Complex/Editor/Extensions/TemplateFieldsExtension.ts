/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  composeTransactionSteps,
  CreateExtensionPlugin,
  EditorState,
  extension,
  ExtensionPriority,
  ExtensionTag,
  findMatches,
  FromToProps,
  getChangedRanges,
  GetMarkRange,
  getMarkRange,
  getMatchString,
  Handler,
  isAllSelection,
  isMarkActive,
  isSelectionEmpty,
  isTextSelection,
  MarkExtension,
  MarkExtensionSpec,
  MarkSpecOverride,
  NodeWithPosition,
  ProsemirrorAttributes,
  ProsemirrorNode,
  removeMark,
  Static,
  updateMark,
} from "@remirror/core";
import { undoDepth } from "@remirror/pm/history";
import { MarkPasteRule } from "@remirror/pm/paste-rules";
import { Selection } from "@remirror/pm/state";
import { ReplaceAroundStep, ReplaceStep } from "@remirror/pm/transform";
import { CreateEventHandlers } from "remirror/extensions";

import { DocumentTemplateFieldRegex } from "../../../../utils";

const DEFAULT_AUTO_LINK_REGEX = DocumentTemplateFieldRegex;

export interface FoundTemplateField {
  /** link text */
  text: string;
  /** offset of matched text */
  start: number;
  /** index of next char after match end */
  end: number;
}
export type TemplateFieldAttributes = ProsemirrorAttributes<{
  /**
   * True when this was an automatically generated link. False when the link was
   * added specifically by the user.
   *
   * @defaultValue false
   */
  auto?: boolean;
}>;
export interface LinkClickData extends GetMarkRange, TemplateFieldAttributes {}

interface LinkWithProperties extends Omit<FoundTemplateField, "href"> {
  range: FromToProps;
  attrs: TemplateFieldAttributes;
}

interface EventMeta {
  selection: Selection;
  range: FromToProps | undefined;
  doc: ProsemirrorNode;
  attrs: TemplateFieldAttributes;
}

interface ShortcutHandlerActiveLink extends FromToProps {
  attrs: TemplateFieldAttributes;
}

export interface ShortcutHandlerProps extends FromToProps {
  selectedText: string;
  activeLink: ShortcutHandlerActiveLink | undefined;
}

export interface TemplateFieldOptions {
  /**
   * Whether to select the text of the full active link when clicked.
   *
   * @defaultValue false
   */
  selectTextOnClick?: boolean;

  /**
   * Listen to click events for links.
   */
  onClick?: Handler<(event: MouseEvent, data: LinkClickData) => boolean>;

  /**
   * Whether automatic links should be created.
   *
   * @defaultValue false
   */
  autoLink?: boolean;

  /**
   * The regex matcher for matching against the RegExp. The matcher must capture
   * the URL part of the string as it's first match. Take a look at the default
   * value.
   *
   */
  autoLinkRegex?: Static<RegExp>;
}

@extension<TemplateFieldOptions>({
  defaultOptions: {
    autoLink: true,
    selectTextOnClick: false,
    autoLinkRegex: DEFAULT_AUTO_LINK_REGEX,
  },
  staticKeys: ["autoLinkRegex"],
  handlerKeyOptions: { onClick: { earlyReturnValue: true } },
  handlerKeys: ["onClick"],
  customHandlerKeys: [],
  defaultPriority: ExtensionPriority.Medium,
})
export class TemplateFieldExtension extends MarkExtension<TemplateFieldOptions> {
  get name() {
    return "template_field" as const;
  }

  private _autoLinkRegexNonGlobal: RegExp | undefined = undefined;
  createTags() {
    return [ExtensionTag.FormattingMark, ExtensionTag.FontStyle];
  }

  private isValidTemplateField(text: string): boolean {
    return !!this._autoLinkRegexNonGlobal?.test(text);
  }

  createMarkSpec(extra: ApplySchemaAttributes, override: MarkSpecOverride): MarkExtensionSpec {
    return {
      inclusive: false,
      excludes: "_",
      ...override,
      attrs: extra.defaults(),
      parseDOM: [
        {
          tag: "span",
          getAttrs: extra.parse,
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        return ["span", { ...extra.dom(node), class: "document-template-field" }, 0];
      },
    };
  }

  /**
   * Create the paste rules that can transform a pasted link in the document.
   */
  createPasteRules(): MarkPasteRule[] {
    return [
      {
        type: "mark",
        regexp: this.options.autoLinkRegex,
        markType: this.type,
        getAttributes: (isReplacement) => ({
          auto: !isReplacement,
        }),
        transformMatch: (match) => {
          const text = getMatchString(match);
          if (!this.isValidTemplateField(text)) {
            return false;
          }
          if (!text) {
            return false;
          }

          return text;
        },
      },
    ];
  }

  onCreate(): void {
    const { autoLinkRegex } = this.options;
    // Remove the global flag from autoLinkRegex, and wrap in start (^) and end ($) terminator to test for exact match
    this._autoLinkRegexNonGlobal = new RegExp(`^${autoLinkRegex.source}$`, autoLinkRegex.flags.replace("g", ""));
  }

  @command()
  updateTemplateField(attrs: TemplateFieldAttributes, range?: FromToProps): CommandFunction {
    return (props) => {
      const { tr } = props;
      const selectionIsValid =
        (isTextSelection(tr.selection) && !isSelectionEmpty(tr.selection)) ||
        isAllSelection(tr.selection) ||
        isMarkActive({ trState: tr, type: this.type });

      if (!selectionIsValid && !range) {
        return false;
      }

      tr.setMeta(this.name, { command: "updateTemplateField", attrs, range });

      return updateMark({ type: this.type, attrs, range })(props);
    };
  }

  @command()
  removeTemplateField(range?: FromToProps): CommandFunction {
    return (props) => {
      const { tr } = props;

      if (!isMarkActive({ trState: tr, type: this.type, ...range })) {
        return false;
      }

      return removeMark({ type: this.type, expand: true, range })(props);
    };
  }

  createPlugin(): CreateExtensionPlugin {
    return {
      appendTransaction: (transactions, prevState, state: EditorState) => {
        if (!this.options.autoLink) {
          return null;
        }

        const isUndo = undoDepth(prevState) - undoDepth(state) === 1;

        if (isUndo) {
          return null; // Don't execute auto link logic if an undo was performed.
        }

        const docChanged = transactions.some((tr) => tr.docChanged);

        if (!docChanged) {
          return null; // Don't execute auto link logic if nothing has changed.
        }

        // Create a single transaction, by combining all transactions
        const composedTransaction = composeTransactionSteps(transactions, prevState);

        const changes = getChangedRanges(composedTransaction, [ReplaceAroundStep, ReplaceStep]);
        const { mapping } = composedTransaction;
        const { tr, doc } = state;

        changes.forEach(({ prevFrom, prevTo, from, to }) => {
          // Store all the callbacks we need to make
          const onUpdateCallbacks: Array<Pick<EventMeta, "range" | "attrs"> & { text: string }> = [];

          // Check if node was split into two by `Enter` key press
          const isNodeSeparated = to - from === 2;

          // Get previous links
          const prevMarks = this.getLinkMarksInRange(prevState.doc, prevFrom, prevTo, true)
            .filter((item) => item.mark.type === this.type)
            .map(({ from: f, to: t, text }) => ({
              mappedFrom: mapping.map(f),
              mappedTo: mapping.map(t),
              text,
              from: f,
              to: t,
            }));

          const { updateTemplateField } = this.store.chain(tr);

          // Check if links need to be removed or updated.
          prevMarks.forEach(({ mappedFrom: newFrom, mappedTo: newTo, from: prevMarkFrom, to: prevMarkTo }, i) =>
            this.getLinkMarksInRange(doc, newFrom, newTo, true)
              .filter((item) => item.mark.type === this.type)
              .forEach((newMark) => {
                const prevLinkText = prevState.doc.textBetween(prevMarkFrom, prevMarkTo, undefined, " ");
                const newLinkText = doc.textBetween(newMark.from, newMark.to + 1, undefined, " ").trim();

                const wasLink = this.isValidTemplateField(prevLinkText);
                const isLink = this.isValidTemplateField(newLinkText);

                if (isLink) {
                  return;
                }

                if (wasLink) {
                  this.removeTemplateField({ from: newMark.from, to: newMark.to });

                  prevMarks.splice(i, 1);
                }

                if (isNodeSeparated) {
                  return;
                }

                // If link characters have been deleted
                if (from === to)
                  // Check newLinkText for a remaining valid link
                  this.findTemplateFields(newLinkText)
                    .map((link) =>
                      this.addLinkProperties({
                        ...link,
                        from: newFrom + link.start,
                        to: newFrom + link.end,
                      }),
                    )
                    .forEach(({ attrs, range, text }) => {
                      updateTemplateField(attrs, range).tr();

                      onUpdateCallbacks.push({ attrs, range, text });
                    });
              }),
          );

          // Find text that can be auto linked
          this.findTextBlocksInRange(doc, { from, to }).forEach(({ text, positionStart }) => {
            // Match links in text node
            this.findTemplateFields(text)
              .map((link) =>
                this.addLinkProperties({
                  ...link,
                  // Calculate link position.
                  from: positionStart + link.start + 1,
                  to: positionStart + link.end + 1,
                }),
              )
              // Check if link is within the changed range.
              .filter(({ range }) => {
                const fromIsInRange = from >= range.from && from <= range.to;
                const toIsInRange = to >= range.from && to <= range.to;

                return fromIsInRange || toIsInRange || isNodeSeparated;
              })
              // Avoid overwriting manually created links.
              .filter(({ range }) => this.getLinkMarksInRange(tr.doc, range.from, range.to, false).length === 0)
              // Prevent updating existing auto links
              .filter(
                ({ range: { from: f }, text: txt }) =>
                  !prevMarks.some(({ text: prevMarkText, mappedFrom }) => mappedFrom === f && prevMarkText === txt),
              )
              .forEach(({ attrs, text: txt, range }) => {
                updateTemplateField(attrs, range).tr();

                onUpdateCallbacks.push({ attrs, range, text: txt });
              });
          });

          window.requestAnimationFrame(() => {
            onUpdateCallbacks.forEach(({ attrs, range }) => {
              this.updateTemplateField(attrs, range);
            });
          });
        });

        if (tr.steps.length === 0) {
          return null;
        }

        return tr;
      },
    };
  }

  private getLinkMarksInRange(doc: ProsemirrorNode, from: number, to: number, isAutoLink: boolean): GetMarkRange[] {
    const linkMarks: GetMarkRange[] = [];

    if (from === to) {
      const resolveFrom = Math.max(from - 1, 0);

      const $pos = doc.resolve(resolveFrom);
      const range = getMarkRange($pos, this.type);

      if (range?.mark.attrs.auto === isAutoLink) {
        linkMarks.push(range);
      }
    } else {
      doc.nodesBetween(from, to, (node, pos) => {
        const marks = node.marks ?? [];
        const linkMark = marks.find(({ type, attrs }) => type === this.type && attrs.auto === isAutoLink);

        if (linkMark) {
          linkMarks.push({
            from: pos,
            to: pos + node.nodeSize,
            mark: linkMark,
            text: node.textContent,
          });
        }
      });
    }

    return linkMarks;
  }

  private findTextBlocksInRange(node: ProsemirrorNode, range: FromToProps): Array<{ text: string; positionStart: number }> {
    const nodesWithPos: NodeWithPosition[] = [];

    // define a placeholder for leaf nodes to calculate link position
    node.nodesBetween(range.from, range.to, (n, pos) => {
      if (!n.isTextblock || !n.type.allowsMarkType(this.type)) {
        return;
      }

      nodesWithPos.push({
        node: n,
        pos,
      });
    });

    return nodesWithPos.map((textBlock) => ({
      text: node.textBetween(textBlock.pos, textBlock.pos + textBlock.node.nodeSize, undefined, " "),
      positionStart: textBlock.pos,
    }));
  }

  private addLinkProperties({ from, to, ...link }: FoundTemplateField & FromToProps): LinkWithProperties {
    return {
      ...link,
      range: { from, to },
      attrs: { auto: true },
    };
  }

  private findTemplateFields(str: string): FoundTemplateField[] {
    const toAutoLink: FoundTemplateField[] = [];

    for (const match of findMatches(str, this.options.autoLinkRegex)) {
      const text = getMatchString(match);

      if (!text) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!this.isValidTemplateField(text)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      toAutoLink.push({
        text,
        start: match.index,
        end: match.index + text.length,
      });
    }

    return toAutoLink;
  }

  createEventHandlers(): CreateEventHandlers {
    return {
      clickMark: (event, clickState) => {
        const markRange = clickState.getMark(this.type);

        if (!markRange) {
          return;
        }

        const attrs = markRange.mark.attrs as TemplateFieldAttributes;
        const data: LinkClickData = { ...attrs, ...markRange };

        // If one of the handlers returns `true` then return early.
        if (this.options.onClick(event, data)) {
          return;
        }

        // If editable is false, the openLinkOnClick handler or the selectTextOnClick handler should
        // not be triggered or it will conflict with the default browser event
        if (!this.store.view.editable) {
          return;
        }

        if (this.options.selectTextOnClick) {
          this.store.commands.selectText(markRange);
        }
      },
    };
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      template_fields: TemplateFieldExtension;
    }
  }
}
