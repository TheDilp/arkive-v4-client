/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import {
  arrow,
  autoPlacement,
  autoUpdate,
  FloatingArrow,
  FloatingPortal,
  hide,
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
import { cloneElement, ReactElement, useRef, useState } from "react";
import { tv } from "tailwind-variants";

import { DefaultTooltipType, TooltipType, Variant } from "../../types";

const defaultTooltipClasses = tv({
  base: "z-50 select-none rounded border-none border-transparent p-1 text-sm text-white shadow max-w-[200px]",
  variants: {
    variant: {
      primary: "bg-black",
      secondary: "bg-zinc-700",
    },
  },
});

function DefaultTooltip({ children, variant }: DefaultTooltipType) {
  const classes = defaultTooltipClasses({ variant });
  return <div className={classes}>{children}</div>;
}

function getArrowColor(variant: Variant) {
  if (variant === "primary") return "#000000";
  if (variant === "secondary") return "#3f3f46";
  return "#000000";
}

export function Tooltip({
  allowedPlacements,
  delay,
  children,
  content,
  isDisabled,
  isClickable,
  closeOnClick,
  customOffset,
  isIgnoringHover,
  arrowColor,
  passCloseTooltip,
  variant = "primary",
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
      hide(),
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
        open: delay?.openDelay ?? 250,
        close: delay?.closeDelay || 0,
      },
    }),
    useClick(context, {
      enabled: isClickable ?? false,
    }),
    useFocus(context),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ]);

  return (
    <>
      {cloneElement(
        children,
        getReferenceProps({
          ref: refs.setReference,
          ...children.props,
        }),
      )}
      {!isDisabled && open && (
        <FloatingPortal>
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
              style: { ...floatingStyles, zIndex: 9999 },
            })}>
            {typeof content === "string" ? (
              <DefaultTooltip variant={variant}>{content}</DefaultTooltip>
            ) : (
              cloneElement(content as ReactElement, { ...(passCloseTooltip ? { closeTooltip: () => setOpen(false) } : {}) })
            )}
            <FloatingArrow
              ref={arrowRef}
              className="z-[9999] [&>path:first-of-type]:stroke-none"
              context={context}
              fill={arrowColor || getArrowColor(variant) || "black"}
              strokeWidth={0}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
