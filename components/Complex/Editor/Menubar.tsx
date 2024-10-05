import { ReactFrameworkOutput, Remirror, useActive, useChainedCommands, useRemirrorContext } from "@remirror/react";
import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch, useMemo } from "react";
import { UseReactToPrintFn } from "react-to-print";
import { ActiveFromExtensions, AnyExtension, ChainedFromExtensions } from "remirror";

import { DialogAtomType, DrawerAtomType, DropdownItemType, Size, Variant } from "../../../types";
import {
  AvailableIcons,
  ColorPresets,
  dialogAtom,
  drawerAtom,
  getSavingIcon,
  getSavingTooltip,
  IconEnum,
} from "../../../utils";
import { Button } from "../../Form";
import { Icon } from "../../Misc";
import { Dropdown } from "../../Overlay";

function menuBarItems({
  active,
  chain,
  setDrawer,
  setDialog,
  getContext,
  title,
  id,
  icon,
  isEditorMenubar,
  isTemplate,
  handlePrint,
}: {
  active: ActiveFromExtensions<Remirror.Extensions>;
  chain: ChainedFromExtensions<AnyExtension | Remirror.Extensions>;
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>;
  setDialog: Dispatch<SetStateAction<DialogAtomType>>;
  getContext: ReactFrameworkOutput<Remirror.Extensions>;
  title?: string;
  id?: string;
  icon?: AvailableIcons;
  isEditorMenubar?: boolean;
  isTemplate?: boolean;
  handlePrint: UseReactToPrintFn;
  // createPDF: CreatePDFType;
  // webhooks: WebhookType[];
}) {
  const options: (DropdownItemType & { variant?: Variant; tooltip: string })[] = [
    {
      id: "text_bold",
      icon: IconEnum.text_bold,
      onClick: () => chain?.toggleBold()?.run(),
      variant: active.bold() ? ("info" as Variant) : ("primary" as Variant),
      tooltip: "Bold",
    },
    {
      id: "text_italic",
      icon: IconEnum.text_italic,
      onClick: () => chain?.toggleItalic()?.run(),
      variant: active.italic() ? ("info" as Variant) : ("primary" as Variant),
      tooltip: "Italic",
    },
    {
      id: "text_underline",
      icon: IconEnum.text_underline,
      onClick: () => chain?.toggleUnderline()?.run(),
      variant: active.underline() ? ("info" as Variant) : ("primary" as Variant),
      tooltip: "Underline",
    },
    {
      id: "heading",
      icon: IconEnum.heading,
      onClick: undefined,
      variant: active.heading() ? ("info" as Variant) : ("primary" as Variant),
      tooltip: "Heading",
      subItems: [
        {
          id: "heading_1",
          icon: IconEnum.heading_one,
          onClick: () => chain?.toggleHeading({ level: 1 })?.run(),
          iconThickness: "light" as const,
          iconColor: active.heading({ level: 1 }) ? "#60a5fa" : "#ffffff",
        },
        {
          id: "heading_2",

          icon: IconEnum.heading_two,
          onClick: () => chain?.toggleHeading({ level: 2 })?.run(),
          iconThickness: "light" as const,
          iconColor: active.heading({ level: 2 }) ? "#60a5fa" : "#ffffff",
        },
        {
          id: "heading_3",

          icon: IconEnum.heading_three,
          onClick: () => chain?.toggleHeading({ level: 3 })?.run(),
          iconThickness: "light" as const,
          iconColor: active.heading({ level: 3 }) ? "#60a5fa" : "#ffffff",
        },
        {
          id: "heading_4",
          icon: IconEnum.heading_four,
          onClick: () => chain?.toggleHeading({ level: 4 })?.run(),
          iconThickness: "light" as const,
          iconColor: active.heading({ level: 4 }) ? "#60a5fa" : "#ffffff",
        },
        {
          id: "heading_5",

          icon: IconEnum.heading_five,
          onClick: () => chain?.toggleHeading({ level: 5 })?.run(),
          iconThickness: "light" as const,
          iconColor: active.heading({ level: 5 }) ? "#60a5fa" : "#ffffff",
        },
        {
          id: "heading_6",
          icon: IconEnum.heading_six,
          onClick: () => chain?.toggleHeading({ level: 6 })?.run(),
          iconThickness: "light" as const,
          iconColor: active.heading({ level: 6 }) ? "#60a5fa" : "#ffffff",
        },
      ],
    },
    {
      id: "align_text",
      icon: IconEnum.text_align_justify,
      onClick: undefined,
      title: "Align text",
      tooltip: "Align text",
      subItems: [
        {
          id: "align_text_left",
          icon: IconEnum.text_align_left,
          onClick: () => chain?.leftAlign()?.run(),
          title: "Align left",
          iconThickness: "light" as const,
        },
        {
          id: "align_text_center",
          icon: IconEnum.text_align_center,
          onClick: () => chain?.centerAlign()?.run(),
          title: "Align center",
          iconThickness: "light" as const,
        },
        {
          id: "align_text_right",
          icon: IconEnum.text_align_right,
          onClick: () => chain?.rightAlign()?.run(),
          title: "Align right",
          iconThickness: "light" as const,
        },
        {
          id: "align_text_justify",
          icon: IconEnum.text_align_justify,
          onClick: () => chain?.justifyAlign()?.run(),
          title: "Align justify",
          iconThickness: "light" as const,
        },
      ],
    },
    {
      id: "bullet_list",
      icon: IconEnum.bullet_list,
      onClick: () => chain?.toggleBulletList()?.run(),
      variant: active.bulletList() ? ("info" as Variant) : ("primary" as Variant),
      tooltip: "Insert bullet list",
    },
    {
      id: "numbered_list",
      icon: IconEnum.numbered_list,
      onClick: () => chain?.toggleOrderedList()?.run(),
      variant: active.orderedList() ? ("info" as Variant) : ("primary" as Variant),
      tooltip: "Insert numbered list",
    },
    {
      id: "task_list",
      icon: IconEnum.task_list,
      onClick: () => chain?.toggleTaskList()?.run(),
      variant: active.taskList() ? ("info" as Variant) : ("primary" as Variant),
      tooltip: "Insert task list",
    },
    {
      id: "callout",
      icon: IconEnum.callout,
      onClick: undefined,
      variant: active.callout() ? ("info" as Variant) : ("primary" as Variant),
      subItems: [
        {
          id: "clear_callout",
          icon: IconEnum.callout,
          onClick: () => chain?.toggleCallout()?.run(),
          title: "Clear" as Variant,
        },
        {
          id: "callout_info",
          icon: IconEnum.info_circle,
          onClick: () => chain?.toggleCallout({ type: "info" as Variant })?.run(),
          title: "Info" as Variant,
          iconColor: "#60a5fa",
        },
        {
          id: "callout_error",
          icon: IconEnum.error,
          onClick: () => chain?.toggleCallout({ type: "error" })?.run(),
          title: "Error",
          iconColor: "#b91c1c",
        },
        {
          id: "callout_warning",
          icon: IconEnum.warning,
          onClick: () => chain?.toggleCallout({ type: "warning" })?.run(),
          title: "Warning",
          iconColor: "#fb923c",
        },
        {
          id: "callout_success",
          onClick: () => chain?.toggleCallout({ type: "success" })?.run(),
          icon: IconEnum.check_circle,
          title: "Success",
          iconColor: "#4ade80",
        },
        {
          id: "callout_custom",
          title: "Custom",
          icon: IconEnum.brush,
          allowedPlacements: ["right", "right-end"],
          subItems: ColorPresets.map((color) => ({
            id: color,
            child: (
              <div
                className="m-2 h-5 w-5 rounded-full"
                style={{
                  backgroundColor: color,
                }}
              />
            ),
            onClick: () => chain?.toggleCallout({ type: "custom", customColor: color })?.run(),
          })),
        },
      ],
      tooltip: "Insert callout",
    },
    {
      id: "insert_image",
      icon: IconEnum.image,
      onClick: () =>
        setDialog({
          data: { getContext },
          type: "insert_image",
          isOverlay: true,
          title: "Insert image",
          size: "md",
        }),
      tooltip: "Insert image",
    },
    {
      id: "table",
      icon: IconEnum.table,
      onClick: undefined,
      variant: active.table() ? ("info" as Variant) : ("primary" as Variant),
      tooltip: "Table",

      subItems: [
        {
          id: "create",
          title: "Create",
          icon: IconEnum.create_table,
          onClick: undefined,
          allowedPlacements: ["right-start"],
          subItems: [
            {
              id: "create_basic_table",
              icon: IconEnum.create_table,
              title: "Create table (with headers)",
              onClick: () => chain?.createTable({ rowsCount: 4, columnsCount: 4, withHeaderRow: true })?.run(),
            },
            {
              id: "create_basic_table_no_headers",
              icon: IconEnum.create_table,
              title: "Create table (without headers)",
              onClick: () => chain?.createTable({ rowsCount: 3, columnsCount: 3, withHeaderRow: false })?.run(),
            },
          ],
        },
        {
          id: "add_to_table",
          icon: IconEnum.add,
          title: "Add",
          onClick: undefined,
          allowedPlacements: ["right-start"],
          subItems: [
            {
              id: "add_row_above",
              icon: IconEnum.create_row_before,
              title: "Add row (above)",
              onClick: () => chain?.addTableRowBefore()?.run(),
            },
            {
              id: "add_row_below",
              icon: IconEnum.create_row_after,
              title: "Add row (below)",
              onClick: () => chain?.addTableRowAfter()?.run(),
            },
            {
              id: "add_col_left",
              icon: IconEnum.create_column_before,
              title: "Add column (left)",
              onClick: () => chain?.addTableColumnBefore()?.run(),
            },
            {
              id: "add_col_right",
              icon: IconEnum.create_column_after,
              title: "Add column (right)",
              onClick: () => chain?.addTableColumnAfter()?.run(),
            },
          ],
        },
        {
          id: "delete",
          icon: IconEnum.trash,
          title: "Delete",
          allowedPlacements: ["right-start"],
          subItems: [
            {
              id: "delete_row",
              title: "Delete current row",
              icon: IconEnum.delete_row,
              onClick: () => chain?.deleteTableRow()?.focus()?.run(),
            },
            {
              id: "delete_column",
              title: "Delete current column",
              icon: IconEnum.delete_column,
              onClick: () => chain?.deleteTableColumn()?.focus()?.run(),
            },
            {
              id: "delete_table",
              title: "Delete table",
              icon: IconEnum.delete_table,
              onClick: () => chain?.deleteTable()?.focus()?.run(),
            },
          ],
        },
      ],
    },
    {
      id: "divider",
      icon: IconEnum.divider,
      onClick: () => chain?.insertHorizontalRule()?.run(),
      tooltip: "Divider",
    },
    {
      id: "secret",
      icon: active.secret() ? IconEnum.eye_slash : IconEnum.eye,
      variant: active.secret() ? ("info" as Variant) : ("primary" as Variant),
      onClick: () => chain?.toggleSecret({ secret: true, classNames: "secretBlock" })?.run(),
      tooltip: "Secret block",
    },
    { id: "print", icon: IconEnum.blueprint, onClick: handlePrint, tooltip: "Print page" },
  ];

  if (!IS_GATEWAY) {
    options.push({
      id: "automention",
      // @ts-ignore
      icon: IconEnum.mention,
      onClick: () => {
        if (isEditorMenubar) {
          setDialog((prev) => ({
            ...prev,
            title: "Automention",
            size: "xs",
            type: "automention",
            position: "top",
            data: { getContext, title: title || "", id: id || "" },
          }));
        } else {
          setDrawer((prev) => ({
            ...prev,
            title: "Automention",
            size: "xs",
            type: "autolinker",
            data: { getContext, title: title || "", id: id || "" },
          }));
        }
      },
      tooltip: "Automention",
      variant: "primary",
    });
  }

  if (!isEditorMenubar && !IS_GATEWAY) {
    options.push(
      {
        id: "show_mentioned",
        icon: IconEnum.mentioned_in_document,
        tooltip: "Show entities mentioned in this document",

        onClick: () =>
          setDrawer((prev) => ({
            ...prev,
            title: "Mentioned entities",
            data: { getContext, id: id || "" },
            type: "mentioned_in_document",
            size: "lg",
          })),
      },
      {
        id: "show_connected",
        icon: IconEnum.graph,
        tooltip: "Show where this document is mentioned",

        onClick: () =>
          setDrawer((prev) => ({
            ...prev,
            title: "Document mentioned in",
            data: { id: id || "", title: title || "", icon, isAll: false },
            type: "mentioned_in",
            size: "half" as DrawerAtomType["size"],
          })),
      }
    );
  }
  if (isTemplate) {
    options.push({
      id: "template_maker",
      title: "Create from template",
      icon: IconEnum.document_templates,
      tooltip: "Create documents from this template",
      onClick: () => {
        if (id && title)
          setDrawer((prev) => ({
            ...prev,
            data: { id, title, getContext },
            type: "from_template",
            size: "half",
            title: "Create from template",
          }));
      },
    });
  }

  if (!isTemplate) {
    options.push({
      id: "pdf",
      title: "Print content",
      icon: IconEnum.print,
      onClick: handlePrint,
      tooltip: "Print the content of this document",
    });
  }

  return options;
}

export function Menubar({
  size,
  title,
  id,
  icon,
  isEditorMenubar,
  isTemplate,
  isMutating,
  hasChanges,
  handlePrint,
}: {
  size: Size;
  title?: string;
  id?: string;
  icon?: AvailableIcons;
  isTemplate: boolean;
  isMutating: boolean;
  isEditorMenubar?: boolean;
  hasChanges?: boolean;
  handlePrint: UseReactToPrintFn;
}) {
  const chain = useChainedCommands();
  const getContext = useRemirrorContext();
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const active = useActive();

  // const { mutate: createPDF } = useCreatePDF();

  const items = useMemo(
    () =>
      menuBarItems({
        active,
        chain,
        setDrawer,
        setDialog,
        getContext,
        title,
        id,
        icon,
        isEditorMenubar,
        isTemplate,
        handlePrint,
      }),
    [chain, isEditorMenubar, id, title]
  );

  return (
    <ul
      className={`sticky top-0 z-30 mb-1 flex ${
        size === "md" ? "h-10 min-h-[2.5rem]" : "h-6 min-h-[1.25rem]"
      } w-full flex-nowrap items-center gap-x-4 overflow-auto bg-zinc-900 px-3`}>
      {items.map((item) => (
        <div key={item.icon}>
          {item?.subItems?.length ? (
            <Dropdown allowedPlacements={["top", "bottom", "right"]} items={item?.subItems}>
              <div className="flex items-center">
                <Button
                  hasNoBackground
                  icon={item.icon}
                  iconSize={size === "md" ? 20 : 16}
                  onClick={undefined}
                  tooltip={item?.tooltip}
                  variant={item?.variant || ("primary" as Variant)}
                />
                <Icon icon={IconEnum.chevron_down} />
              </div>
            </Dropdown>
          ) : (
            <Button
              hasNoBackground
              icon={item.icon}
              iconSize={size === "md" ? 20 : 16}
              onClick={item.onClick}
              tooltip={item?.tooltip}
              variant={item?.variant || ("primary" as Variant)}
            />
          )}
        </div>
      ))}
      {isEditorMenubar ? null : (
        <li className="relative ml-auto">
          <Button
            hasNoBackground
            icon={getSavingIcon(isMutating, hasChanges)}
            isIconOnly
            isLoading={hasChanges && isMutating}
            onClick={undefined}
            tooltip={getSavingTooltip(isMutating, hasChanges)}
            variant={hasChanges ? "warning" : "success"}
          />
        </li>
      )}
    </ul>
  );
}
