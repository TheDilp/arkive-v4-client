/* eslint-disable no-use-before-define */
import {
  autoPlacement,
  autoUpdate,
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  offset,
  safePolygon,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
} from "@floating-ui/react";
import { useEffect, useRef, useState } from "react";
import { tv } from "tailwind-variants";

import { DropdownItemType, DropdownType } from "../../types";
import { IconEnum } from "../../utils";
import { Avatar, Icon } from "../Misc";

const DropdownClasses = tv({
  slots: {
    base: "z-30 font-lato min-w-fit outline-none",
    floatingBase:
      "border max-h-[40rem] rounded overflow-y-auto border-zinc-600 z-[60] font-lato shadow-lg absolute top-0 left-0",
  },
});
const DropdownItemClasses = tv({
  base: "flex flex-nowrap group group-hover:bg-zinc-700 h-10 min-h-[2.5rem] border-zinc-600 bg-zinc-800 cursor-pointer items-center border-0 text-left h-full w-full pl-2 m-0 outline-0 text-white hover:bg-zinc-700",
  variants: {
    isDisabled: {
      true: "bg-zinc-500 text-zinc-300 cursor-not-allowed",
    },
    hasIcon: {
      true: "justify-between",
    },
    hasImage: {
      true: "justify-start gap-x-2",
    },
  },
});

export function DropdownComponent({ allowedPlacements = [], children, items, isReferenceMaxSize, event }: DropdownType) {
  const { base, floatingBase } = DropdownClasses();

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const elementsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();

  const isNested = parentId !== null;

  const { floatingStyles, refs, context } = useFloating({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: isNested ? "right-start" : "bottom-start",
    middleware: [
      offset({ mainAxis: isNested ? 8 : 4, alignmentAxis: 0 }),
      autoPlacement({ allowedPlacements }),
      shift(),

      size({
        apply({ rects, elements }) {
          Object.assign(elements?.floating?.style, {
            minWidth: `${rects.reference.width}px`,
            maxWidth: isReferenceMaxSize ? `${rects.reference.width}px` : "",
          });
        },
        padding: 10,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    enabled: isNested,
    delay: { open: 75 },
    handleClose: safePolygon({ blockPointerEvents: true }),
  });
  const click = useClick(context, {
    event: "mousedown",
    toggle: !isNested,
    ignoreMouse: isNested,
  });
  const role = useRole(context, { role: "menu" });
  const dismiss = useDismiss(context, { bubbles: true });
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    nested: isNested,
    onNavigate: setActiveIndex,
  });

  const tree = useFloatingTree();

  useEffect(() => {
    if (!tree) return () => {};

    function handleTreeClick() {
      setIsOpen(false);
    }

    function onSubMenuOpen(evt: { nodeId: string; parentId: string }) {
      if (evt.nodeId !== nodeId && evt.parentId === parentId) {
        setIsOpen(false);
      }
    }

    tree.events.on("click", handleTreeClick);
    tree.events.on("menuopen", onSubMenuOpen);

    return () => {
      tree.events.off("click", handleTreeClick);
      tree.events.off("menuopen", onSubMenuOpen);
    };
  }, [tree, nodeId, parentId]);

  useEffect(() => {
    if (isOpen && tree) {
      tree.events.emit("menuopen", { parentId, nodeId });
    }
  }, [tree, isOpen, nodeId, parentId]);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, click, role, dismiss, listNavigation]);
  const item = useListItem();
  const mergedRefs = useMergeRefs([refs.setReference, item.ref]);
  useEffect(() => {
    if (event) {
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
  }, [event]);
  if (items?.length === 0) return null;
  const dropdownItemClasses = DropdownItemClasses({ isRoot: true, hasSubitems: !!items?.length });

  return (
    <FloatingNode id={nodeId}>
      <div
        ref={mergedRefs}
        className={isNested ? dropdownItemClasses : base()}
        role={isNested ? "menuitem" : undefined}
        tabIndex={!isNested ? 0 : -1}
        {...getReferenceProps()}>
        {children || null}
      </div>
      <FloatingList elementsRef={elementsRef}>
        {isOpen ? (
          <FloatingPortal>
            <FloatingFocusManager context={context} initialFocus={isNested ? -1 : 0} modal={false} returnFocus={!isNested}>
              <div
                ref={refs.setFloating}
                className={floatingBase()}
                style={{ transform: floatingStyles.transform }}
                {...getFloatingProps()}>
                {items && isOpen
                  ? items.map((dropdownItem) =>
                      dropdownItem.subItems?.length ? (
                        <Dropdown key={dropdownItem.id} allowedPlacements={allowedPlacements} items={dropdownItem.subItems}>
                          <DropdownItem
                            child={dropdownItem?.child}
                            icon={dropdownItem.icon}
                            iconColor={dropdownItem?.iconColor}
                            iconThickness={dropdownItem?.iconThickness}
                            id={dropdownItem.id}
                            image={dropdownItem?.image}
                            isDisabled={dropdownItem?.isDisabled}
                            onClick={() => {
                              if (dropdownItem?.isDisabled) return;
                              tree?.events.emit("click");
                              if (dropdownItem?.onClick) {
                                dropdownItem.onClick();
                              }
                              setIsOpen(false);
                            }}
                            subItems={dropdownItem.subItems}
                            title={dropdownItem.title}
                          />
                        </Dropdown>
                      ) : (
                        <DropdownItem
                          key={dropdownItem.id}
                          child={dropdownItem?.child}
                          icon={dropdownItem.icon}
                          iconColor={dropdownItem?.iconColor}
                          iconThickness={dropdownItem?.iconThickness}
                          id={dropdownItem.id}
                          image={dropdownItem?.image}
                          isDisabled={dropdownItem?.isDisabled}
                          onClick={() => {
                            if (dropdownItem?.isDisabled) return;
                            tree?.events.emit("click");
                            if (dropdownItem?.onClick) {
                              dropdownItem.onClick();
                            }
                            setIsOpen(false);
                          }}
                          subItems={dropdownItem.subItems}
                          title={dropdownItem.title}
                        />
                      ),
                    )
                  : null}
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        ) : null}
      </FloatingList>
    </FloatingNode>
  );
}

function DropdownItem({
  title: label,
  icon,
  onClick,
  subItems,
  iconColor,
  isDisabled,
  image,
  iconThickness,
  child,
}: DropdownItemType) {
  const dropdownItemClasses = DropdownItemClasses({
    isDisabled,
    hasSubitems: !!subItems?.length,
    hasImage: !!image,
    hasIcon: !!icon,
  });
  return (
    <div className={dropdownItemClasses} onClick={onClick} onKeyDown={() => {}} role="menuitem" tabIndex={0}>
      {image && !subItems?.length ? <Avatar image={image} size="sm" /> : null}
      {label && !child ? <div className="select-none truncate pr-2 ">{label}</div> : null}
      {child ?? null}
      <div className="ml-auto flex pr-2">
        {icon ? (
          <div>
            <Icon color={iconColor || "#ffffff"} fontSize={20} icon={icon} thickness={iconThickness || "regular"} />
          </div>
        ) : null}

        {subItems?.length ? (
          <div>
            <Icon fontSize={20} icon={IconEnum.chevron_right} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Dropdown(props: DropdownType) {
  const parentId = useFloatingParentNodeId();

  if (parentId === null) {
    return (
      <FloatingTree>
        <DropdownComponent {...props} />
      </FloatingTree>
    );
  }

  return <DropdownComponent {...props} />;
}
