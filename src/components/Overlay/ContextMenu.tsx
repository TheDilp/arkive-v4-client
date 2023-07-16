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
import { useEffect, useRef, useState } from "react";

import { ContextMenuType } from "../../types/ComponentTypes/OverlayTypes/contextMenuTypes";
import { Icon } from "..";

export function ContextMenu({ items }: ContextMenuType) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [contextData, setContextData] = useState<any>();
  const listItemsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const allowMouseUpCloseRef = useRef(false);

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
    let timeout: number;

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
      //   @ts-ignore
      const contextType = e.target.dataset?.contextType;
      if (typeof contextType === "string") {
        refs.setPositionReference({
          getBoundingClientRect() {
            return {
              width: 0,
              height: 0,
              x: e.clientX,
              y: e.clientY,
              top: e.clientY,
              right: e.clientX,
              bottom: e.clientY,
              left: e.clientX,
            };
          },
        });
        //   @ts-ignore
        setContextData(e.target.dataset);
        setIsOpen(true);
        clearTimeout(timeout);

        allowMouseUpCloseRef.current = false;
        timeout = window.setTimeout(() => {
          allowMouseUpCloseRef.current = true;
        }, 300);
      }
    }

    function onMouseUp() {
      if (allowMouseUpCloseRef.current) {
        setIsOpen(false);
      }
    }

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("mouseup", onMouseUp);
      clearTimeout(timeout);
    };
  }, [refs]);

  return (
    <FloatingPortal>
      {isOpen && (
        <FloatingOverlay lockScroll>
          <FloatingFocusManager context={context} initialFocus={refs.floating}>
            <div
              ref={refs.setFloating}
              className="max-w-xs rounded-md border border-zinc-700 bg-zinc-800 p-2 shadow focus-visible:outline-none"
              style={floatingStyles}
              {...getFloatingProps()}>
              {items.map((item, index) => (
                <div
                  className="flex cursor-pointer items-center gap-x-2 outline-none hover:text-sky-400 focus-visible:outline-none"
                  {...getItemProps({
                    tabIndex: activeIndex === index ? 0 : -1,
                    ref(node: HTMLButtonElement) {
                      listItemsRef.current[index] = node;
                    },
                    onClick() {
                      item?.onClick?.(contextData);
                      setIsOpen(false);
                    },
                    onMouseUp() {
                      item?.onClick?.(contextData);
                      setIsOpen(false);
                    },
                  })}
                  key={item.title}>
                  {item?.icon ? <Icon icon={item.icon} /> : null}
                  {item.title}
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingOverlay>
      )}
    </FloatingPortal>
  );
}
