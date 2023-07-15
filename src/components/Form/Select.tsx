/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  size as sizeMiddleware,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { tv } from "tailwind-variants";

import { SelectOptionType, SelectType } from "../../types";
import { Avatar, Icon, Spinner } from "../Misc";

const SelectClasses = tv({
  slots: {
    base: "relative flex select-none flex-col w-full cursor-pointer z-0 max-w-full font-lato",
    select:
      "flex h-10 truncate w-full max-w-full items-center justify-between bg-zinc-900 text-white rounded-md border p-2 outline-none placeholder:select-none placeholder:font-lato",
    label: "text-sm font-medium truncate block w-full pl-1 font-lato",
    helperText: "text-xs truncate block px-2",
    optionsContainer:
      "overflow-y-auto z-[99999] border-zinc-700 border-b border-x max-h-56 bg-zinc-900 text-white rounded-b shadow-lg focus-visible:ring-0 focus-visible:outline-none focus:outline-none",
    placeholder: "text-zinc-500 font-lato",
  },
  variants: {
    variant: {
      primary: {
        select: "border-zinc-700",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      secondary: {
        select: "border-zinc-400",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      info: {
        select: "border-blue-600",
        label: "text-blue-400",
        helperText: "text-blue-400",
      },
      success: {
        select: "border-green-600",
        label: "text-green-400",
        helperText: "text-green-400",
      },
      warning: {
        select: "border-orange-400",
        label: "text-orange-400",
        helperText: "text-orange-400",
      },
      error: {
        select: "border-red-600",
        label: "text-red-500",
        helperText: "text-red-500",
      },
    },
    size: {
      sm: {
        select: "h-8",
      },
      md: {
        select: "h-10",
      },
    },
  },
  compoundSlots: [
    {
      slots: ["select"],
      isDisabled: true,
      class: "bg-zinc-700 text-zinc-400 cursor-not-allowed select-none border-zinc-700",
    },
    {
      slots: ["select"],
      isOpen: true,
      class: "rounded-b-none",
    },
    {
      slots: ["helperText"],
      isDisabled: true,
      class: "hidden",
    },
  ],

  defaultVariants: {
    // size: "md",
    variant: "primary",
  },
});

const SelectOption = tv({
  base: [
    "h-10",
    "py-2",
    "px-4",
    "outline-none",
    "focus-visible:outline-none",
    "focus-visible:ring-0",
    "hover:cursor-pointer",
    "hover:bg-zinc-700",
    "flex",
    "items-center",
    "justify-start",
    "border-zinc-700",
    "border-b",
    "first:border-t",
    "last:border-b-0",
    "gap-x-2",
  ],
  variants: {
    size: {
      sm: "h-8",
    },
    isActive: {
      true: "bg-zinc-700",
    },
    isSelected: {
      true: "bg-blue-500",
    },
  },
});

function RightIcon({
  isLoading,
  isOpen,
  optionsLength,
}: {
  isLoading: boolean | undefined;
  isOpen: boolean;
  optionsLength: number | undefined;
}) {
  if (isLoading) return <Spinner />;
  if (optionsLength) return <Icon color="white" icon={isOpen ? "ph-caret-up" : "ph:caret-down"} />;
  return null;
}

function onClick({
  isMultiple,
  value,
  options,
  onChange,
  name,
  index,
  setIsOpen,
}: Pick<SelectType, "isMultiple" | "value" | "options" | "onChange" | "name"> & {
  index: number;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  if (isMultiple) {
    if (Array.isArray(value) && value.includes(options[index].value)) {
      const newValue = value.filter((val) => val !== options[index].value);
      onChange({ name, value: newValue });
    } else if (
      (Array.isArray(value) && !value.includes(options[index].value)) ||
      value === undefined ||
      value === null ||
      value === ""
    ) {
      onChange({
        name,
        value: options
          .filter((opt) => opt?.value === options[index].value || value?.includes(opt?.value))
          .map((opt) => opt.value),
      });
    }
  } else {
    const selectedItem = options.find((opt) => opt?.value === options[index].value);
    if (selectedItem) {
      onChange({ name, value: selectedItem?.value });
      setIsOpen(false);
    }
  }
}

export function Select({
  label,
  variant = "primary",
  placeholder,
  helperText,
  isLoading,
  value,
  name,
  isDisabled,
  options = [],
  isMultiple,
  onChange,
  size = "md",
}: SelectType) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [displayText, setDisplayText] = useState("");
  const [selectedItem, setSelectedItem] = useState<SelectOptionType | null>();
  const {
    base,
    label: labelClasses,
    select,
    optionsContainer,
    helperText: helperTextClasses,
    placeholder: placeholderClasses,
  } = SelectClasses({ variant, isDisabled: !options.length || isDisabled, size, isOpen });
  const { refs, floatingStyles, context } = useFloating({
    placement: "bottom-start",
    open: isOpen,
    onOpenChange: options.length !== 0 && !isDisabled ? setIsOpen : () => {},
    whileElementsMounted: autoUpdate,
    middleware: [
      offset({ mainAxis: -3 }),
      flip(),
      sizeMiddleware({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${rects.reference.width}px`,
            minWidth: `${rects.reference.width}px`,
          });
        },
      }),
    ],
  });

  const listRef = useRef<Array<HTMLElement | null>>([]);

  const click = useClick(context, { event: "mousedown" });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "listbox" });
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    // This is a large list, allow looping.
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([dismiss, role, listNav, click]);
  useEffect(() => {
    if (value && options) {
      if (isMultiple && Array.isArray(value) && value.length !== 0) {
        const selectedOptions = options.filter((opt) => value.includes(opt.value)).map((opt) => opt.label);
        setDisplayText(selectedOptions.join(", "));
      } else if (!isMultiple) {
        if (value) {
          const selectedOption = options.find((opt) => value === opt?.value);
          if (selectedOption) setSelectedItem(selectedOption);
        }
      }
    } else if (!value && options) {
      setSelectedItem(null);
      setDisplayText("");
    }
  }, [value, options, isMultiple]);
  return (
    <div className={base()}>
      {label ? <span className={labelClasses()}>{label}</span> : null}
      <div
        ref={refs.setReference}
        aria-autocomplete="none"
        aria-labelledby="select-label"
        className={select()}
        tabIndex={0}
        {...getReferenceProps()}>
        {selectedItem || displayText ? (
          <div className="flex items-center gap-x-2 truncate">
            {!!value && !Array.isArray(value) && selectedItem?.image ? (
              <Avatar
                image={selectedItem?.image?.link}
                label={selectedItem?.label}
                shape={selectedItem?.image?.shape}
                size="xs"
              />
            ) : null}
            {!!value && !Array.isArray(value) && selectedItem?.icon && !selectedItem?.image ? (
              <Icon fontSize={20} icon={selectedItem.icon} />
            ) : null}
            <span className="truncate">{selectedItem?.label || displayText}</span>
          </div>
        ) : (
          <div className={placeholderClasses()}>{options.length === 0 ? "No options available." : placeholder || "Select"}</div>
        )}
        <RightIcon isLoading={isLoading} isOpen={isOpen} optionsLength={options.length} />
      </div>
      {helperText ? <div className={helperTextClasses()}>{helperText}</div> : null}
      {isOpen && options.length ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div ref={refs.setFloating} className={optionsContainer()} style={floatingStyles} {...getFloatingProps()}>
              {options.map((opt, i) => (
                <div
                  key={opt.value}
                  ref={(node) => {
                    listRef.current[i] = node;
                  }}
                  aria-selected={i === activeIndex}
                  className={SelectOption({
                    isActive: activeIndex === i,
                    isSelected: Array.isArray(value) ? value.includes(options[i].value) : value === options[i].value,
                    size,
                  })}
                  role="option"
                  tabIndex={i === activeIndex ? 0 : -1}
                  {...getItemProps({
                    onClick: () =>
                      onClick({
                        isMultiple,
                        name,
                        index: i,
                        onChange,
                        options,
                        value,
                        setIsOpen,
                      }),
                    onKeyDown: (e) => {
                      if (e.key === "Enter") {
                        onClick({
                          isMultiple,
                          name,
                          index: i,
                          onChange,
                          options,
                          value,
                          setIsOpen,
                        });
                      }
                    },
                  })}>
                  {opt?.image ? (
                    <Avatar
                      image={opt?.image?.link}
                      imageLoading="lazy"
                      isTooltipDisabled
                      label={label || ""}
                      shape={opt?.image?.shape}
                      size="xs"
                    />
                  ) : null}
                  {opt?.icon && !opt?.image ? <Icon fontSize={20} icon={opt.icon} /> : null}
                  <span className="truncate">{opt.label}</span>
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </div>
  );
}
