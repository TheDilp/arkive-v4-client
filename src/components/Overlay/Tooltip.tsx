/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import {
  arrow,
  autoPlacement,
  autoUpdate,
  FloatingArrow,
  inline,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { cloneElement, useRef, useState } from "react";

import { DefaultTooltipType, TooltipType } from "../../types";

function DefaultTooltip({ children }: DefaultTooltipType) {
  return <div className="z-50 rounded border-none border-transparent bg-black p-2 text-sm text-white shadow">{children}</div>;
}

export function Tooltip({
  allowedPlacements,
  children,
  content,
  isDisabled,
  isClickable,
  closeOnClick,
  customOffset,
  isIgnoringHover,
  arrowColor,
}: TooltipType) {
  const [open, setOpen] = useState(false);
  const arrowRef = useRef(null);
  const { floatingStyles, refs, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [
      inline(),
      autoPlacement({ allowedPlacements }),
      offset(customOffset),
      shift(),
      arrow({
        element: arrowRef,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, {
      enabled: !isClickable ?? true,
      handleClose: isIgnoringHover ? null : safePolygon(),
      delay: {
        open: 250,
      },
    }),
    useClick(context, {
      enabled: isClickable || false,
    }),
    useFocus(context),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ]);

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref: refs.setReference, ...children.props }))}
      {!isDisabled && open && (
        <div
          onClick={() => {
            if (closeOnClick) {
              setOpen((prev) => !prev);
            }
          }}
          onKeyDown={() => {}}
          role="tooltip"
          tabIndex={-1}
          {...getFloatingProps({
            ref: refs.setFloating,
            style: { ...floatingStyles, zIndex: 99999 },
          })}>
          {typeof content === "string" ? <DefaultTooltip>{content}</DefaultTooltip> : content}
          <FloatingArrow
            ref={arrowRef}
            className="z-[9999] [&>path:first-of-type]:stroke-none"
            context={context}
            fill={arrowColor || "black"}
            strokeWidth={0}
          />
        </div>
      )}
    </>
  );
}
