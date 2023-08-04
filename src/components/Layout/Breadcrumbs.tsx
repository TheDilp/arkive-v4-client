import { useAtomValue } from "jotai";
import { Fragment } from "react";
import { Link } from "react-router-dom";

import { breadcrumbsAtom, IconEnum } from "../../utils";
import { Icon } from "..";

export function Breadcrumbs() {
  const { items, type } = useAtomValue(breadcrumbsAtom);
  return (
    <div className="flex h-8 max-h-8 max-w-fit flex-nowrap items-center justify-between gap-x-2 truncate">
      <Link to={`../${type}`}>
        <Icon fontSize={22} icon={IconEnum.home} />
      </Link>
      {items?.length > 0 ? <Icon fontSize={22} icon={IconEnum.chevron_right} /> : null}
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <div className="flex w-fit max-w-[10rem] items-center text-lg">
            <Link to={`../${type}/${item.id}`}>
              <span className="truncate font-semibold">{item.title}</span>
            </Link>
          </div>
          {index !== items.length - 1 ? <Icon fontSize={22} icon={IconEnum.chevron_right} /> : null}
        </Fragment>
      ))}
    </div>
  );
}
