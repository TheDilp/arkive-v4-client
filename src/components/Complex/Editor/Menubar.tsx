import { IconEnum } from "../../../utils";
import { Button } from "../../Form";
import { Icon } from "../../Misc";
import { Dropdown } from "../../Overlay";

const menuBarIcons = [
  { id: "text_bold", icon: IconEnum.text_bold, action: () => {} },
  { id: "text_italic", icon: IconEnum.text_italic, action: () => {} },
  { id: "text_underline", icon: IconEnum.text_underline, action: () => {} },
  {
    id: "heading",
    icon: IconEnum.heading,
    action: undefined,
    subItems: [
      {
        id: "heading_1",
        icon: IconEnum.heading_one,
        action: () => {},
        iconThickness: "light" as const,
        label: "Heading 1",
      },
      {
        id: "heading_2",

        icon: IconEnum.heading_two,
        action: () => {},
        iconThickness: "light" as const,
        label: "Heading 2",
      },
      {
        id: "heading_3",

        icon: IconEnum.heading_three,
        action: () => {},
        iconThickness: "light" as const,
        label: "Heading 3",
      },
      {
        id: "heading_4",
        icon: IconEnum.heading_four,
        action: () => {},
        iconThickness: "light" as const,
        label: "Heading 4",
      },
      {
        id: "heading_5",

        icon: IconEnum.heading_five,
        action: () => {},
        iconThickness: "light" as const,
        label: "Heading 5",
      },
      {
        id: "heading_6",
        icon: IconEnum.heading_six,
        action: () => {},
        iconThickness: "light" as const,
        label: "Heading 6",
      },
    ],
  },

  {
    id: "align_text",
    icon: IconEnum.text_align_justify,
    action: undefined,
    label: "Align text",
    subItems: [
      {
        id: "align_text_left",
        icon: IconEnum.text_align_left,
        action: () => {},
        label: "Align left",
        iconThickness: "light" as const,
      },
      {
        id: "align_text_center",
        icon: IconEnum.text_align_center,
        action: () => {},
        label: "Align center",
        iconThickness: "light" as const,
      },
      {
        id: "align_text_right",
        icon: IconEnum.text_align_right,
        action: () => {},
        label: "Align right",
        iconThickness: "light" as const,
      },
      {
        id: "align_text_justify",
        icon: IconEnum.text_align_justify,
        action: () => {},
        label: "Align justify",
        iconThickness: "light" as const,
      },
    ],
  },
  {
    id: "bullet_list",
    icon: IconEnum.bullet_list,
    action: undefined,
  },
  {
    id: "numbered_list",
    icon: IconEnum.numbered_list,
    action: undefined,
  },

  {
    id: "callout",
    icon: IconEnum.callout,
    action: undefined,
    subItems: [
      { id: "callout_info", icon: IconEnum.info_circle, action: () => {}, label: "Info", iconColor: "#2563eb" },
      { id: "callout_error", icon: IconEnum.error, action: () => {}, label: "Error", iconColor: "#b91c1c" },
      { id: "callout_warning", icon: IconEnum.warning, action: () => {}, label: "Warning", iconColor: "#ea580c" },
      { id: "callout_success", icon: IconEnum.check_circle, action: () => {}, label: "Success", iconColor: "#16a34a" },
    ],
  },
  {
    id: "insert_image",
    icon: IconEnum.image,
    action: undefined,
  },
  {
    id: "divider",
    icon: IconEnum.divider,
    action: undefined,
  },
  {
    id: "secret",
    icon: IconEnum.eye,
    action: undefined,
  },
];

export function Menubar() {
  return (
    <ul className="mb-1 flex h-10 flex-nowrap items-center gap-x-4 bg-zinc-900 px-3">
      {menuBarIcons.map((item) => (
        <div key={item.icon}>
          {item?.subItems?.length ? (
            <Dropdown items={item?.subItems}>
              <div className="flex items-center">
                <Button hasNoBackground icon={item.icon} isIconOnly onClick={undefined} />
                <Icon icon={IconEnum.chevron_down} />
              </div>
            </Dropdown>
          ) : (
            <Button hasNoBackground icon={item.icon} isIconOnly onClick={item.action} />
          )}
        </div>
      ))}
    </ul>
  );
}
