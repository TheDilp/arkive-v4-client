import { useAtomValue } from "jotai";
import { Fragment } from "react";
import { Link, useParams } from "react-router-dom";

import { breadcrumbsAtom, getLinkToItem, IconEnum } from "../../utils";
import { Icon } from "..";

export function Breadcrumbs() {
  const { project_id } = useParams();
  const { items, type } = useAtomValue(breadcrumbsAtom);
  return (
    <div className="flex h-8 max-h-8 max-w-fit flex-nowrap items-center justify-between gap-x-2 self-center">
      <Link to={`../${type}`}>
        <Icon fontSize={22} icon={IconEnum.home} />
      </Link>
      {items?.length > 0 ? <Icon fontSize={22} icon={IconEnum.chevron_right} /> : null}
      {items.map((item, index) => (
        <Fragment key={item.id}>
          <div className="flex w-fit min-w-fit max-w-[10rem] items-center text-lg">
            <Link to={getLinkToItem(project_id as string, type as string, item.id, item.is_folder)}>
              <span className="truncate font-lato font-semibold">{item.title}</span>
            </Link>
          </div>
          <span>{index !== items.length - 1 ? <Icon fontSize={22} icon={IconEnum.chevron_right} /> : null}</span>
        </Fragment>
      ))}
    </div>
  );
}
