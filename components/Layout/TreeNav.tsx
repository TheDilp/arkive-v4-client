import { useAtomValue } from "jotai";
import { createContext, useContext, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useGetEntities } from "../../hooks";
import { AvailableEntityType } from "../../types";
import {
  AvailableIcons,
  EntitiesWithFoldersEnum,
  getDefaultEntityIcon,
  getEntityFields,
  getEntityLink,
  IconEnum,
  treeNavAtom,
} from "../../utils";
import { Button } from "../Form";
import { Avatar, Icon } from "../Misc";

const classes = tv({
  base: "hidden h-full lg:flex bg-zinc-800 pt-4 transition-all max-h-full overflow-y-auto border-r border-zinc-800 shadow",
  variants: {
    open: {
      true: "w-72",
      false: "w-0 border-r-0",
    },
  },
});

const treeNavItemClasses = tv({
  slots: {
    base: "flex flex-col py-0.5 px-1 text-sm hover:bg-zinc-700 rounded ",
    title: "flex w-full cursor-pointer items-center gap-x-1 pt-0.5 truncate",
  },
  variants: {
    open: {
      true: {
        base: "bg-zinc-700",
        title: "",
      },
      false: {
        base: "",
      },
    },
  },
});

const TypeContext = createContext<{
  type: AvailableEntityType | null;
}>({ type: null });

function TreeNavItem({
  id,
  title,
  is_folder,
  icon,
  image_id,
}: {
  id: string;
  title: string;
  is_folder: boolean;
  icon: AvailableIcons;
  image_id: string | null;
}) {
  const [open, setOpen] = useState(false);
  const { project_id } = useParams();
  const { type } = useContext(TypeContext);

  const { data: items } = useGetEntities(
    {
      fields: getEntityFields(type || "documents"),
      filters: { and: [{ id: "parent", value: id, operator: "eq", field: "parent_id", header_name: "parent" }] },
      pagination: {
        limit: 1000,
      },
      orderBy: [
        { field: "is_folder", sort: "asc" },
        { field: "title", sort: "asc" },
      ],
    },
    type || "documents",
    { enabled: open && !!type && EntitiesWithFoldersEnum.includes(type), queryKeyConcat: [type || ""] }
  );
  const { base, title: titleClasses } = treeNavItemClasses({ open });

  return (
    <li className={base()}>
      <Link className={titleClasses()} to={getEntityLink(project_id as string, "documents", id, null, undefined, is_folder)}>
        {is_folder ? (
          <div>
            <Button
              hasNoBackground
              icon={open ? IconEnum.chevron_up : IconEnum.chevron_down}
              iconSize={16}
              isIconOnly
              onClick={(e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(!open);
              }}
            />
          </div>
        ) : null}
        <div className={`flex w-full flex-nowrap items-center gap-x-1 ${is_folder && open ? "border-b border-zinc-600" : ""} `}>
          {image_id ? (
            <Avatar image_id={image_id} size="2xs" />
          ) : (
            <Icon icon={is_folder ? IconEnum.folder : icon || getDefaultEntityIcon(type)} />
          )}
          {title}
        </div>
      </Link>
      {open ? (
        <div className="pl-4">
          <TreeNavRoot items={items?.data || []} />
        </div>
      ) : null}
    </li>
  );
}

function TreeNavRoot({ items }: { items: Record<string, any>[] }) {
  return (
    <ul className="w-full px-1">
      {(items || []).map((item) => (
        <TreeNavItem
          key={item.id}
          icon={item.icon}
          id={item.id}
          image_id={item.image_id || null}
          is_folder={item.is_folder}
          title={item.title}
        />
      ))}
    </ul>
  );
}

export function TreeNav({ type }: { type: AvailableEntityType }) {
  const open = useAtomValue(treeNavAtom);
  const { data: rootItems } = useGetEntities(
    {
      fields: getEntityFields(type || "documents"),
      filters: { and: [{ id: "parent", value: null, operator: "is", field: "parent_id", header_name: "parent" }] },
      pagination: {
        limit: 1000,
      },
      orderBy: [
        { field: "is_folder", sort: "asc" },
        { field: "title", sort: "asc" },
      ],
    },
    type,
    { enabled: !!type && EntitiesWithFoldersEnum.includes(type) }
  );
  return (
    <div className={classes({ open })}>
      <TypeContext.Provider value={{ type }}>
        <TreeNavRoot items={rootItems?.data || []} />
      </TypeContext.Provider>
    </div>
  );
}
