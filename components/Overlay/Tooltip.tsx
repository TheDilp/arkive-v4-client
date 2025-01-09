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
import { isArray } from "remirror";
import { tv } from "tailwind-variants";

import { DefaultTooltipType, TooltipType, Variant } from "../../types";

const defaultTooltipClasses = tv({
  base: "select-none rounded border-none border-transparent p-1 text-sm text-white shadow break-word",
  variants: {
    variant: {
      primary: "bg-black",
      secondary: "bg-zinc-700",
      info: "bg-zinc-700",
      success: "bg-zinc-700",
      warning: "bg-zinc-700",
      error: "bg-zinc-700",
      "primary-bordered": "bg-black",
      "secondary-bordered": "bg-zinc-700",
      "info-bordered": "bg-zinc-700",
      "success-bordered": "bg-zinc-700",
      "warning-bordered": "bg-zinc-700",
      "error-bordered": "bg-zinc-700",
    },
    isInline: {
      true: "max-w-fit min-w-fit",
      false: "max-w-[200px]",
    },
  },
});

function DefaultTooltip({ children, variant, isInline }: DefaultTooltipType) {
  const classes = defaultTooltipClasses({ variant, isInline });
  return <div className={classes}>{children}</div>;
}

function getArrowColor(variant: Variant) {
  if (variant === "primary") return "#000000";
  if (variant === "secondary") return "#3f3f46";
  return "#000000";
}

function OnlySoleChild({ children }: { children: JSX.Element | JSX.Element[] }) {
  if (isArray(children)) return children?.at(-1) || null;
  return children;
}

export function Tooltip({
  allowedPlacements,
  delay,
  children,
  content,
  isDisabled,
  isClickable,
  isPortal = true,
  closeOnClick,
  customOffset,
  isIgnoringHover,
  arrowColor,
  passCloseTooltip,
  isInline,
  hasArrow = true,
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
      enabled: !isClickable,
      handleClose: isIgnoringHover ? null : safePolygon(),
      delay: {
        open: delay?.openDelay ?? 250,
        close: delay?.closeDelay || 0,
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
      {cloneElement(
        children,
        getReferenceProps({
          ref: refs.setReference,
          ...children.props,
        })
      )}
      {!isDisabled && open && isPortal ? (
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
              style: { ...floatingStyles, zIndex: 99999 },
            })}>
            {typeof content === "string" ? (
              <DefaultTooltip isInline={isInline} variant={variant}>
                {content}
              </DefaultTooltip>
            ) : (
              <OnlySoleChild>
                {cloneElement(content as ReactElement, {
                  ...(passCloseTooltip ? { closeTooltip: () => setOpen(false) } : {}),
                })}
              </OnlySoleChild>
            )}
            {hasArrow ? (
              <FloatingArrow
                ref={arrowRef}
                className="z-[9998] [&>path:first-of-type]:stroke-none"
                context={context}
                fill={arrowColor || getArrowColor(variant) || "black"}
                strokeWidth={0}
              />
            ) : null}
          </div>
        </FloatingPortal>
      ) : null}
      {!isDisabled && open && !isPortal ? (
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
          {typeof content === "string" ? (
            <DefaultTooltip variant={variant}>{content}</DefaultTooltip>
          ) : (
            cloneElement(content as ReactElement, {
              ...(passCloseTooltip ? { closeTooltip: () => setOpen(false) } : {}),
            })
          )}
          {hasArrow ? (
            <FloatingArrow
              ref={arrowRef}
              className="z-[9998] [&>path:first-of-type]:stroke-none"
              context={context}
              fill={arrowColor || getArrowColor(variant) || "black"}
              strokeWidth={0}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
}
