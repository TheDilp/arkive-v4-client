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
import { Icon } from "../Misc";

const DropdownClasses = tv({
  slots: {
    base: "rounded divide-y [&:not(:has(button))]:border border-zinc-600 z-50",
    floatingBase: "max-h-[40rem] overflow-y-auto rounded divide-y h-fit z-50",
    baseItem: "h-10 items-center gap-x-2 text-white border-zinc-600",
    dropdownItem:
      "flex flex-no-wrap justify-between bg-zinc-800 cursor-pointer items-center border-0 text-left h-full px-2 m-0 outline-0 text-white hover:bg-zinc-700",
  },
});

export function DropdownComponent({ allowedPlacements = [], children, items }: DropdownType) {
  const { base, floatingBase, baseItem } = DropdownClasses();

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
    middleware: [offset({ mainAxis: isNested ? 8 : 4, alignmentAxis: 0 }), autoPlacement({ allowedPlacements }), shift()],
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

    function onSubMenuOpen(event: { nodeId: string; parentId: string }) {
      if (event.nodeId !== nodeId && event.parentId === parentId) {
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
  return (
    <FloatingNode id={nodeId}>
      <div
        ref={useMergeRefs([refs.setReference, item.ref])}
        className={isNested ? baseItem() : base()}
        role={isNested ? "menuitem" : undefined}
        tabIndex={!isNested ? 0 : -1}
        {...getReferenceProps()}>
        {children}
      </div>
      <FloatingList elementsRef={elementsRef}>
        {isOpen ? (
          <FloatingPortal>
            <FloatingFocusManager context={context} initialFocus={isNested ? -1 : 0} modal={false} returnFocus={!isNested}>
              <div ref={refs.setFloating} className={floatingBase()} style={floatingStyles} {...getFloatingProps()}>
                {items && isOpen
                  ? items.map((dropdownItem) => (
                      <DropdownItem
                        key={dropdownItem.id}
                        child={dropdownItem?.child}
                        icon={dropdownItem.icon}
                        iconColor={dropdownItem?.iconColor}
                        iconThickness={dropdownItem?.iconThickness}
                        id={dropdownItem.id}
                        label={dropdownItem.label}
                        onClick={() => {
                          tree?.events.emit("click");
                          if (dropdownItem?.onClick) {
                            dropdownItem.onClick();
                          }
                          setIsOpen(false);
                        }}
                        subItems={dropdownItem.subItems}
                      />
                    ))
                  : null}
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        ) : null}
      </FloatingList>
    </FloatingNode>
  );
}

function DropdownItem({ id, label, icon, onClick, subItems, iconColor, iconThickness, child }: DropdownItemType) {
  const { dropdownItem: dropdownItemClasses } = DropdownClasses();
  return (
    <Dropdown key={id} items={subItems || []}>
      <div className={dropdownItemClasses()} onClick={onClick} onKeyDown={() => {}} role="menuitem" tabIndex={0}>
        {label && !child ? <div className="select-none truncate">{label}</div> : null}
        {child ?? null}
        {icon && !subItems?.length ? (
          <div className="ml-auto flex min-w-[22px] justify-end">
            <Icon color={iconColor || "#ffffff"} fontSize={20} icon={icon} thickness={iconThickness || "regular"} />
          </div>
        ) : null}
        {subItems?.length ? <Icon icon={IconEnum.chevron_right} /> : null}
      </div>
    </Dropdown>
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
