import { IconEnum } from "../../../utils";
import { Button } from "../../Form";
import { Icon } from "../../Misc";
import { Dropdown } from "../../Overlay";

const menuBarIcons = [
  { icon: IconEnum.text_bold, action: () => {} },
  { icon: IconEnum.text_italic, action: () => {} },
  { icon: IconEnum.text_underline, action: () => {} },
  {
    icon: IconEnum.heading,
    action: undefined,
    subItems: [
      { icon: IconEnum.heading_one, action: () => {}, label: "Heading 1" },
      { icon: IconEnum.heading_two, action: () => {}, label: "Heading 2" },
      { icon: IconEnum.heading_three, action: () => {}, label: "Heading 3" },
      { icon: IconEnum.heading_four, action: () => {}, label: "Heading 4" },
      { icon: IconEnum.heading_five, action: () => {}, label: "Heading 5" },
      { icon: IconEnum.heading_six, action: () => {}, label: "Heading 6" },
    ],
  },
  {
    icon: IconEnum.text_align_justify,
    action: undefined,
    subItems: [
      { icon: IconEnum.text_align_left, action: () => {}, label: "Align left" },
      { icon: IconEnum.text_align_center, action: () => {}, label: "Align center" },
      { icon: IconEnum.text_align_right, action: () => {}, label: "Align right" },
      { icon: IconEnum.text_align_justify, action: () => {}, label: "Align justify" },
    ],
  },
];

export function Menubar() {
  return (
    <ul className="mb-1 flex h-8 flex-nowrap items-center bg-zinc-800 px-3">
      {menuBarIcons.map((item) => (
        <div key={item.icon}>
          {item?.subItems?.length ? (
            <Dropdown items={item?.subItems}>
              <div className="flex items-center">
                <Button hasNoBackground icon={item.icon} isIconOnly />
                <Icon icon={IconEnum.chevron_down} />
              </div>
            </Dropdown>
          ) : (
            <Button hasNoBackground icon={item.icon} isIconOnly />
          )}
        </div>
      ))}
    </ul>
  );
}
