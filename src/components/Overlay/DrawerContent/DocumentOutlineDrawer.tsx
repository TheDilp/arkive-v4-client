/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useNoDataChangedDrawer } from "../../../hooks";
import { getTextSizeFromHeadingLevel } from "../../../utils";
import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    headings: { id: string; title: string; level: number }[];
  };
};

export function DocumentOutlineDrawer({ data }: Props) {
  useNoDataChangedDrawer();

  return (
    <DrawerLayout>
      <ul>
        {data.headings.map((h) => (
          <li
            key={h.id}
            className={`${getTextSizeFromHeadingLevel(h.level)} cursor-pointer hover:text-blue-400`}
            onClick={() => {
              const el = document.getElementById(h.id);
              if (el) {
                const editor = document.getElementById("editor");
                if (editor) editor.scrollTo({ top: el.offsetTop, behavior: "smooth" });
              }
            }}
            style={{
              paddingLeft: `${0.45 * (h.level - 1)}rem`,
            }}>
            {h.title}
          </li>
        ))}
      </ul>
    </DrawerLayout>
  );
}
