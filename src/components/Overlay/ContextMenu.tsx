import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

import { contextMenuAtom } from "../../utils";
import { Icon } from "..";

export function ContextMenu() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [contextMenuAtomValue, setContextMenuAtom] = useAtom(contextMenuAtom);

  const listItemsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset({ mainAxis: 5, alignmentAxis: 4 }),
      flip({
        fallbackPlacements: ["left-start"],
      }),
      shift({ padding: 10 }),
    ],
    placement: "right-start",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  const role = useRole(context, { role: "menu" });
  const dismiss = useDismiss(context);
  const listNavigation = useListNavigation(context, {
    listRef: listItemsRef,
    onNavigate: setActiveIndex,
    activeIndex,
  });

  const { getFloatingProps, getItemProps } = useInteractions([role, dismiss, listNavigation]);

  useEffect(() => {
    if (contextMenuAtomValue?.items?.length && contextMenuAtomValue?.event) {
      const { event } = contextMenuAtomValue;
      refs.setPositionReference({
        getBoundingClientRect() {
          return {
            width: 0,
            height: 0,
            x: event.clientX,
            y: event.clientY,
            top: event.clientY,
            right: event.clientX,
            bottom: event.clientY,
            left: event.clientX,
          };
        },
      });
      //   @ts-ignore
      setIsOpen(true);
    }
  }, [contextMenuAtomValue?.items]);

  useEffect(() => {
    if (!isOpen) setContextMenuAtom({ items: null, event: null });
  }, [isOpen]);

  return (
    <FloatingPortal>
      {isOpen && (
        <FloatingOverlay lockScroll>
          <FloatingFocusManager context={context} initialFocus={refs.floating}>
            <div
              ref={refs.setFloating}
              className="max-w-xs gap-y-2 rounded-md border border-zinc-700 bg-zinc-800 shadow focus-visible:outline-none"
              style={floatingStyles}
              {...getFloatingProps()}>
              {contextMenuAtomValue?.items
                ? contextMenuAtomValue.items.map((item, index) => (
                    <div
                      className="flex h-10 cursor-pointer items-center border-b border-zinc-700 px-2 outline-none last:border-none hover:text-sky-400 focus-visible:outline-none"
                      {...getItemProps({
                        tabIndex: activeIndex === index ? 0 : -1,
                        ref(node: HTMLButtonElement) {
                          listItemsRef.current[index] = node;
                        },
                        onClick() {
                          item?.onClick?.();
                          setIsOpen(false);
                        },
                        onMouseUp() {
                          item?.onClick?.();
                          setIsOpen(false);
                        },
                      })}
                      key={item.title}>
                      {item?.icon ? <Icon icon={item.icon} /> : null}
                      {item.title}
                    </div>
                  ))
                : null}
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      )}
    </FloatingPortal>
  );
}
