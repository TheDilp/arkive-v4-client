import { Link } from "react-router-dom";

import { IconEnum } from "../../utils";
import { Icon } from "..";

type Props = { items: { id: string; title: string }[] };

export function Breadcrumbs({
  items = [
    { id: "1", title: "A" },
    { id: "2", title: "B" },
  ],
}: Props) {
  return (
    <div className="flex h-8 max-h-8 max-w-fit flex-nowrap items-center justify-between gap-x-2">
      <Link to="../graphs">
        <Icon fontSize={22} icon={IconEnum.home} />
      </Link>
      {items?.length > 0 ? <Icon fontSize={22} icon={IconEnum.chevron_right} /> : null}
      {items.map((item, index) => (
        <>
          <div key={item.id} className="flex w-fit max-w-[10rem] items-center text-lg">
            <Link to={`../graphs/${item.id}`}>
              <span className="truncate font-semibold">{item.title}</span>
            </Link>
          </div>
          {index !== items.length - 1 ? <Icon fontSize={22} icon={IconEnum.chevron_right} /> : null}
        </>
      ))}
    </div>
  );
}
