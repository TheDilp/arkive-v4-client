import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  size,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { useSetAtom } from "jotai";
import { useState } from "react";

import { AvailableEntityType, ItemPreviewType } from "../../types";
import { drawerAtom, IconEnum } from "../../utils";
import { EntityPreview } from "./EntityPreview";

type Props = {
  items: ItemPreviewType[];
};

export function CarouselEntityPreview({ items }: Props) {
  const setDrawer = useSetAtom(drawerAtom);

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

  const dismiss = useDismiss(context);

  useInteractions([dismiss]);

  return (
    <div className="relative flex w-full items-center">
      {items?.length ? (
        <div ref={refs.setReference} className="relative w-full">
          <EntityPreview
            key={items[0].id}
            {...items[0]}
            otherAction={
              items.length > 1
                ? () => {
                    setIsOpen((prev) => !prev);
                  }
                : undefined
            }
            otherActionIcon={isOpen ? IconEnum.chevron_up : IconEnum.chevron_down}
            previewAction={(id) => {
              setDrawer((prev) => ({
                ...prev,
                title: "Preview",
                data: { id, entity_type: items[0].type as AvailableEntityType },
                type: "entity_preview",
              }));
            }}
          />
        </div>
      ) : null}
      {isOpen && items.length > 1 ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              className=" z-10 flex max-h-56 w-full max-w-full flex-col gap-y-2 overflow-y-auto shadow"
              style={floatingStyles}>
              {items.slice(1).map((item) => (
                <div key={item.id} className="w-full">
                  <EntityPreview
                    {...item}
                    label=""
                    previewAction={(id) => {
                      setDrawer((prev) => ({
                        ...prev,
                        title: "Preview",
                        data: { id, entity_type: items[0].type as AvailableEntityType },
                        type: "entity_preview",
                      }));
                    }}
                  />
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </div>
  );
}
