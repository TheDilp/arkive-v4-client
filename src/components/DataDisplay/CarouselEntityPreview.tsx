import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, size, useFloating } from "@floating-ui/react";
import { useState } from "react";

import { ItemPreviewType } from "../../types";
import { IconEnum } from "../../utils";
import { Button } from "../Form";
import { EntityPreview } from "./EntityPreview";

type Props = {
  items: ItemPreviewType[];
};

export function CarouselEntityPreview({ items }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    placement: "bottom-start",
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      flip(),
      offset(8),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${rects.reference.width}px`,
            minWidth: `${rects.reference.width}px`,
          });
        },
      }),
    ],
  });

  return (
    <div className="relative flex w-full items-center">
      {items?.length ? (
        <div ref={refs.setReference} className="relative w-full">
          <EntityPreview key={items[0].id} {...items[0]} />
          <div className="absolute right-2 top-1/2">
            <Button
              hasNoBackground
              icon={isOpen ? IconEnum.chevron_up : IconEnum.chevron_down}
              onClick={(e: Event) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen((prev) => !prev);
              }}
            />
          </div>
        </div>
      ) : null}
      {isOpen ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              className=" z-10 flex max-h-56 w-full max-w-full flex-col gap-y-2 overflow-y-auto shadow"
              style={floatingStyles}>
              {items.slice(1).map((item) => (
                <EntityPreview key={item.id} {...item} label="" />
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </div>
  );
}
