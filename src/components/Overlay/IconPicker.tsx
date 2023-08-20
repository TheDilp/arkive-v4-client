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
import { useVirtual } from "@tanstack/react-virtual";
import { Fragment, useCallback, useState } from "react";

import { IconPickerType } from "../../types";
import { iconList } from "../../utils/enums/IconPickerEnums";
import { Input } from "../Form";
import { Icon } from "../Misc";

export function IconPicker({ setIcon, customOffset, allowedPlacements, isDisabled, iconTypes = ["general"] }: IconPickerType) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const { floatingStyles, refs, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [inline(), autoPlacement({ allowedPlacements }), offset(customOffset), shift()],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context, {
      enabled: true,
    }),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ]);

  const id = crypto.randomUUID();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const rowVirtualizer = useVirtual({
    parentRef: refs.floating,
    size: Math.ceil(iconList.length / 6),
    overscan: 10,
  });
  const columnVirtualizer = useVirtual({
    horizontal: true,
    size: 6,
    parentRef: refs.floating,
    overscan: 5,
  });
  return (
    <>
      <div {...getReferenceProps({ ref: refs.setReference })}>TEST</div>
      {open && (
        <FloatingFocusManager context={context} modal={false} order={["reference", "content"]} returnFocus={false}>
          <div
            ref={refs.setFloating}
            aria-describedby={descriptionId}
            aria-labelledby={labelId}
            className="h-[20rem] max-h-[20rem] w-80 overflow-y-auto rounded bg-zinc-800"
            style={floatingStyles}
            {...getFloatingProps({
              ref: refs.setFloating,
              style: { ...floatingStyles, zIndex: 99999 },
            })}>
            <div className="sticky top-0 z-50">
              <Input isInline name="iconFilter" placeholder="Search icons" size="sm" />
            </div>
            <div
              style={{
                width: "100%",
                height: `${rowVirtualizer.totalSize}px`,
                position: "relative",
              }}>
              {rowVirtualizer.virtualItems.map((virtualRow) => (
                <Fragment key={virtualRow.key}>
                  {columnVirtualizer.virtualItems.map((virtualColumn) => (
                    <div
                      key={virtualColumn.index}
                      className="p-4"
                      onClick={() => {
                        console.log(iconList[virtualRow.index * 6 + virtualColumn.index]);
                      }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${virtualColumn.size}px`,
                        height: `${virtualRow.size}px`,
                        transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                      }}>
                      <Icon
                        className="mx-auto cursor-pointer hover:text-blue-300"
                        fontSize={30}
                        icon={`${iconList[virtualRow.index * 6 + virtualColumn.index]}`}
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
