import { Remirror, useChainedCommands } from "@remirror/react";
import { useMemo } from "react";
import { AnyExtension, ChainedFromExtensions } from "remirror";

import { IconEnum } from "../../../utils";
import { Button } from "../../Form";
import { Icon } from "../../Misc";
import { Dropdown } from "../../Overlay";

const menuBarItems = ({ chain }: { chain: ChainedFromExtensions<AnyExtension | Remirror.Extensions> }) => [
  { id: "text_bold", icon: IconEnum.text_bold, onClick: () => chain?.toggleBold()?.run() },
  { id: "text_italic", icon: IconEnum.text_italic, onClick: () => chain?.toggleItalic()?.run() },
  {
    id: "text_underline",
    icon: IconEnum.text_underline,
    onClick: () => chain?.toggleUnderline()?.run(),
  },
  {
    id: "heading",
    icon: IconEnum.heading,
    onClick: undefined,
    subItems: [
      {
        id: "heading_1",
        icon: IconEnum.heading_one,
        onClick: () => chain?.toggleHeading({ level: 1 })?.run(),
        iconThickness: "light" as const,
        label: "Heading 1",
      },
      {
        id: "heading_2",

        icon: IconEnum.heading_two,
        onClick: () => chain?.toggleHeading({ level: 2 })?.run(),
        iconThickness: "light" as const,
        label: "Heading 2",
      },
      {
        id: "heading_3",

        icon: IconEnum.heading_three,
        onClick: () => chain?.toggleHeading({ level: 3 })?.run(),
        iconThickness: "light" as const,
        label: "Heading 3",
      },
      {
        id: "heading_4",
        icon: IconEnum.heading_four,
        onClick: () => chain?.toggleHeading({ level: 4 })?.run(),
        iconThickness: "light" as const,
        label: "Heading 4",
      },
      {
        id: "heading_5",

        icon: IconEnum.heading_five,
        onClick: () => chain?.toggleHeading({ level: 5 })?.run(),
        iconThickness: "light" as const,
        label: "Heading 5",
      },
      {
        id: "heading_6",
        icon: IconEnum.heading_six,
        onClick: () => chain?.toggleHeading({ level: 6 })?.run(),
        iconThickness: "light" as const,
        label: "Heading 6",
      },
    ],
  },
  {
    id: "align_text",
    icon: IconEnum.text_align_justify,
    onClick: undefined,
    label: "Align text",
    subItems: [
      {
        id: "align_text_left",
        icon: IconEnum.text_align_left,
        onClick: () => chain?.leftAlign()?.run(),
        label: "Align left",
        iconThickness: "light" as const,
      },
      {
        id: "align_text_center",
        icon: IconEnum.text_align_center,
        onClick: () => chain?.centerAlign()?.run(),
        label: "Align center",
        iconThickness: "light" as const,
      },
      {
        id: "align_text_right",
        icon: IconEnum.text_align_right,
        onClick: () => chain?.rightAlign()?.run(),
        label: "Align right",
        iconThickness: "light" as const,
      },
      {
        id: "align_text_justify",
        icon: IconEnum.text_align_justify,
        onClick: () => chain?.justifyAlign()?.run(),
        label: "Align justify",
        iconThickness: "light" as const,
      },
    ],
  },
  {
    id: "bullet_list",
    icon: IconEnum.bullet_list,
    onClick: () => chain?.toggleBulletList()?.run(),
  },
  {
    id: "numbered_list",
    icon: IconEnum.numbered_list,
    onClick: () => chain?.toggleOrderedList()?.run(),
  },

  {
    id: "callout",
    icon: IconEnum.callout,
    onClick: undefined,
    subItems: [
      {
        id: "callout_info",
        icon: IconEnum.info_circle,
        onClick: () => chain?.toggleCallout({ type: "info" })?.run(),
        label: "Info",
        iconColor: "#60a5fa",
      },
      {
        id: "callout_error",
        icon: IconEnum.error,
        onClick: () => chain?.toggleCallout({ type: "error" })?.run(),
        label: "Error",
        iconColor: "#b91c1c",
      },
      {
        id: "callout_warning",
        icon: IconEnum.warning,
        onClick: () => chain?.toggleCallout({ type: "warning" })?.run(),
        label: "Warning",
        iconColor: "#fb923c",
      },
      {
        id: "callout_success",
        onClick: () => chain?.toggleCallout({ type: "success" })?.run(),
        icon: IconEnum.check_circle,
        label: "Success",
        iconColor: "#4ade80",
      },
    ],
  },
  {
    id: "insert_image",
    icon: IconEnum.image,
    onClick: undefined,
  },
  {
    id: "table",
    icon: IconEnum.table,
    onClick: undefined,
    subItems: [
      {
        id: "create_basic_table",
        icon: IconEnum.table_add,
        label: "Create table",
        onClick: () => chain?.createTable({ rowsCount: 3, columnsCount: 3, withHeaderRow: true })?.run(),
      },
    ],
  },
  {
    id: "divider",
    icon: IconEnum.divider,
    onClick: undefined,
  },
  {
    id: "secret",
    icon: IconEnum.eye,
    onClick: () => chain?.toggleSecret({ secret: true, classNames: "secretBlock" })?.run(),
  },
];

export function Menubar() {
  const chain = useChainedCommands();

  const items = useMemo(() => menuBarItems({ chain }), []);
  return (
    <ul className="mb-1 flex h-10 min-h-[2.5rem] flex-nowrap items-center gap-x-4 bg-zinc-900 px-3">
      {items.map((item) => (
        <div key={item.icon}>
          {item?.subItems?.length ? (
            <Dropdown items={item?.subItems}>
              <div className="flex items-center">
                <Button hasNoBackground icon={item.icon} isIconOnly onClick={undefined} />
                <Icon icon={IconEnum.chevron_down} />
              </div>
            </Dropdown>
          ) : (
            <Button hasNoBackground icon={item.icon} isIconOnly onClick={item.onClick} />
          )}
        </div>
      ))}
    </ul>
  );
}
