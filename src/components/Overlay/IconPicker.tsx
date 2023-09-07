import {
  autoPlacement,
  autoUpdate,
  FloatingFocusManager,
  inline,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Fragment, useEffect, useState } from "react";

import { IconPickerType } from "../../types";
import { iconList } from "../../utils/enums/IconPickerEnums";
import { Button, Input } from "../Form";
import { Icon } from "../Misc";

export function IconPicker({ name, onChange, icon, iconColor, customOffset, allowedPlacements, isDisabled }: IconPickerType) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const [filteredIcons, setFilteredIcons] = useState<string[]>(iconList);

  const { floatingStyles, refs, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [inline(), autoPlacement({ allowedPlacements }), offset(customOffset), shift()],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context, {
      enabled: !isDisabled,
    }),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ]);

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => refs.floating.current as any,
    count: Math.ceil(iconList.filter((ic) => (filter ? ic.includes(filter.toLowerCase()) : true)).length / 6),
    estimateSize: () => 36,
    overscan: 1,
  });
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    estimateSize: () => 36,
    count: 6,
    getScrollElement: () => refs.floating.current as any,
    overscan: 5,
  });

  useEffect(() => {
    if (filter && filter.length >= 3) {
      const timeout = setTimeout(() => {
        setFilteredIcons(iconList.filter((i) => i.split(":")?.[1]?.includes(filter.toLowerCase())));
      }, 250);
      return () => {
        clearTimeout(timeout);
      };
    }
    if (filter.length === 0) {
      setFilteredIcons(iconList);
    }
    return () => {};
  }, [filter]);

  return (
    <>
      <div {...getReferenceProps({ ref: refs.setReference })}>
        {icon ? (
          <div className="cursor-pointer">
            <Icon color={iconColor || "#ffffff"} fontSize={24} icon={icon} />
          </div>
        ) : (
          <div className="h-6 w-6 cursor-pointer rounded-full border border-dashed" />
        )}
      </div>
      {open && (
        <FloatingFocusManager context={context} modal={false} order={["reference", "content"]} returnFocus={false}>
          <div
            ref={refs.setFloating}
            className="border border-zinc-700 bg-zinc-900"
            {...getFloatingProps({
              ref: refs.setFloating,
            })}
            style={{
              ...floatingStyles,
              zIndex: 99999,
              height: "20rem",
              width: "fit-content",
              overflow: "auto",
            }}>
            <Input
              name="filter"
              onChange={({ value }) => setFilter(value as string)}
              placeholder="Search icons."
              value={filter}
            />
            <div
              className="p-2"
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: `${columnVirtualizer.getTotalSize()}px`,
                position: "relative",
              }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                <Fragment key={virtualRow.index}>
                  {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
                    <div
                      key={virtualColumn.index}
                      className="transition-all [&>*>svg]:hover:text-blue-400"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${virtualColumn.size}px`,
                        height: `${virtualRow.size}px`,
                        transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                      }}>
                      <Button
                        hasNoBackground
                        icon={filteredIcons[virtualRow.index * 6 + virtualColumn.index]}
                        iconSize={32}
                        isIconOnly
                        onClick={() => {
                          onChange({ name, value: filteredIcons[virtualRow.index * 6 + virtualColumn.index] });
                          setOpen(false);
                        }}
                        variant="info-bordered"
                      />
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}
