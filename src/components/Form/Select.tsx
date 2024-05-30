/* eslint-disable jsx-a11y/no-autofocus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  ReferenceType,
  size as sizeMiddleware,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { Dispatch, MutableRefObject, SetStateAction, useEffect, useRef, useState } from "react";
import { tv } from "tailwind-variants";

import { SelectOptionType, SelectType } from "../../types";
import { IconEnum } from "../../utils";
import { Avatar, Icon, Spinner } from "../Misc";
import { Button } from "./Button";

const SelectClasses = tv({
  slots: {
    base: "relative flex select-none flex-col w-full cursor-pointer z-0 max-w-full font-lato",
    select:
      "flex h-10 truncate w-full max-w-full items-center justify-between bg-zinc-950 text-white border rounded p-2 outline-none placeholder:select-none placeholder:font-lato",
    label: "text-sm font-medium truncate block w-full font-lato",
    helperText: "text-xs block mt-0.5",
    optionsContainer:
      "overflow-y-auto z-[99999] border-zinc-700 border-b border-x max-h-[12.5rem] bg-zinc-700 text-white rounded shadow-lg focus-visible:ring-0 focus-visible:outline-none focus:outline-none",
    placeholder: "text-zinc-500 font-lato opacity-40",
    displayItem: "truncate hidden sm:block",
    search:
      "sticky top-0 z-50 h-8 w-full border-y border-zinc-700 bg-zinc-800 pl-2 placeholder:text-sm placeholder:text-zinc-600 focus:outline-none focus-visible:outline-none",
  },
  variants: {
    variant: {
      primary: {
        select: "border-zinc-800 focus:border-zinc-700",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
        placeholder: "text-zinc-300",
      },
      secondary: {
        select: "border-zinc-400",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
        placeholder: "text-zinc-300",
      },
      info: {
        select: "border-blue-600",
        label: "text-blue-400",
        helperText: "text-blue-400",
        placeholder: "text-blue-400",
      },
      success: {
        select: "border-green-600",
        label: "text-green-400",
        helperText: "text-green-400",
        placeholder: "text-green-400",
      },
      warning: {
        select: "border-orange-400",
        label: "text-orange-400",
        helperText: "text-orange-400",
        placeholder: "text-orange-400",
      },
      error: {
        select: "border-red-600",
        label: "text-red-500",
        helperText: "text-red-500",
        placeholder: "text-red-500",
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
    isExpandingToNewRow: {
      true: {
        displayItem: "whitespace-normal overflow-visible",
        select: "h-fit",
      },
    },
    hasSearch: {
      true: {
        optionsContainer: "max-h-[14.5rem]",
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
      isReadOnly: true,
      class: "cursor-not-allowed select-none border-zinc-700 bg-zinc-900 text-white",
    },
    {
      slots: ["select"],
      isOpen: true,
      class: "bg-zinc-700",
    },
    {
      slots: ["helperText"],
      isDisabled: true,
      class: "hidden",
    },
    {
      slots: ["helperText"],
      isReadOnly: true,
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
    "cursor-pointer",
    "hover:bg-zinc-500",
    "items-center",
    "justify-start",
    "border-zinc-500",
    "border-b",
    "last:border-b-0",
    "gap-x-2",
    "flex",
  ],
  variants: {
    size: {
      sm: "h-8",
    },
    isActive: {
      true: "bg-zinc-600",
    },
    isSelected: {
      true: "bg-blue-500",
    },
    isDisabled: {
      true: "bg-zinc-500 text-zinc-400 cursor-not-allowed select-none border-zinc-700",
    },
  },
  compoundVariants: [
    {
      isActive: true,
      isSelected: true,
      className: "bg-blue-400",
    },
    {
      isActive: true,
      isSelected: true,
      isDisabled: true,
      className: "text-white",
    },
  ],
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
  if (optionsLength) return <Icon color="white" icon={isOpen ? IconEnum.chevron_up : IconEnum.chevron_down} />;
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
  ref,
}: Pick<SelectType, "isMultiple" | "value" | "options" | "onChange" | "name"> & {
  index: number | null;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  ref: MutableRefObject<ReferenceType | null>;
}) {
  if (typeof index === "number") {
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
        if (!value) {
          onChange({
            name,
            value: [options[index].value],
          });
        } else {
          onChange({
            name,
            value: value?.concat(options[index].value),
          });
        }
      }
    } else {
      const selectedItem = options.find((opt) => opt?.value === options[index].value);
      if (selectedItem) {
        onChange({ name, value: selectedItem?.value });
        setIsOpen(false);
        // @ts-ignore
        ref.current.focus();
      }
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
  hasSearch,
  name,
  isExpandingToNewRow,
  isClearable,
  isDisabled,
  isReadOnly,
  options = [],
  isMultiple,
  onChange,
  size = "md",
}: SelectType) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [displayText, setDisplayText] = useState("");
  const [filteredItems, setFilteredItems] = useState(options);
  const [selectedItem, setSelectedItem] = useState<SelectOptionType | null>();
  const selectedIndex = options.findIndex((opt) => opt.value === selectedItem?.value);
  const {
    base,
    label: labelClasses,
    select,
    optionsContainer,
    helperText: helperTextClasses,
    placeholder: placeholderClasses,
    displayItem: displayItemClasses,
    search,
  } = SelectClasses({
    variant,
    isDisabled: !options.length || isDisabled || isReadOnly,
    isReadOnly,
    size,
    isOpen,
    isExpandingToNewRow,
    hasSearch,
  });
  const { refs, floatingStyles, context } = useFloating({
    placement: "bottom-start",
    open: isOpen,
    onOpenChange: (o, e) => {
      // @ts-ignore
      if (options.length !== 0 && !isDisabled && !isReadOnly && e?.target?.dataset?.option !== "clearable") {
        setIsOpen(o);
      }
    },
    whileElementsMounted: autoUpdate,
    middleware: [
      offset({ mainAxis: 2 }),
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
    selectedIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
    scrollItemIntoView: isMultiple
      ? true
      : {
          behavior: "instant",
          block: "center",
        },
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([dismiss, role, listNav, click]);
  useEffect(() => {
    if (value && options) {
      if (isMultiple && Array.isArray(value) && value.length !== 0) {
        const selectedOptions = options.filter((opt) => value.includes(opt.value)).map((opt) => opt.label);
        setDisplayText(selectedOptions.join(", "));
      } else if (isMultiple && Array.isArray(value) && value.length === 0) {
        setDisplayText("");
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

  useEffect(() => {
    if (!filteredItems.length && options.length) setFilteredItems(options);
    if (!isOpen) setFilteredItems(options);
  }, [options, isOpen]);

  return (
    <div
      className={base()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onClick({
            isMultiple,
            name,
            index: activeIndex,
            onChange,
            options: filteredItems,
            value,
            setIsOpen,
            ref: refs.reference,
          });
        }
      }}>
      {label ? <span className={labelClasses()}>{label}</span> : null}
      <div
        ref={refs.setReference}
        aria-autocomplete="none"
        aria-labelledby="select-label"
        className={select()}
        tabIndex={0}
        {...getReferenceProps({
          onKeyDown(e) {
            if (e.key === "Enter") {
              onClick({
                isMultiple,
                name,
                index: activeIndex,
                onChange,
                options: filteredItems,
                value,
                setIsOpen,
                ref: refs.reference,
              });
            }
          },
          onClick(event) {
            event.preventDefault();
            event.stopPropagation();
          },
        })}>
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
            <span className={displayItemClasses()}>{selectedItem?.label || displayText}</span>
          </div>
        ) : (
          <div className={placeholderClasses()}>{options.length === 0 ? "No options available." : placeholder || "Select"}</div>
        )}

        {isClearable && !!value && !isDisabled && !isReadOnly ? (
          <div
            className="ml-auto"
            data-option="clearable"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange({ name, value: undefined });
            }}>
            <span className="pointer-events-none">
              <Button
                hasNoBackground
                icon={IconEnum.close}
                isDisabled={isDisabled || isReadOnly}
                isIconOnly
                onClick={undefined}
              />
            </span>
          </div>
        ) : null}

        <RightIcon isLoading={isLoading} isOpen={isOpen} optionsLength={options.length} />
      </div>
      {helperText ? <div className={helperTextClasses()}>{helperText}</div> : null}
      {isOpen && options.length ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div ref={refs.setFloating} className={optionsContainer()} style={floatingStyles} {...getFloatingProps()}>
              {hasSearch ? (
                <input
                  // @ts-ignore
                  autoFocus="off"
                  className={search()}
                  onChange={(e) => {
                    if (e.target.value) {
                      setFilteredItems(options.filter((opt) => opt.label.toLowerCase().includes(e.target.value.toLowerCase())));
                    } else {
                      setFilteredItems(options);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onClick({
                        isMultiple,
                        name,
                        index: activeIndex,
                        onChange,
                        options: filteredItems,
                        value,
                        setIsOpen,
                        ref: refs.reference,
                      });
                    }
                  }}
                  placeholder="Search"
                />
              ) : null}

              {filteredItems.map((opt, i) => {
                return (
                  <div
                    ref={(node) => {
                      listRef.current[i] = node;
                    }}
                    aria-selected={i === activeIndex}
                    className={SelectOption({
                      isActive: activeIndex === i,
                      isSelected: Array.isArray(value)
                        ? value?.includes(filteredItems?.[i]?.value)
                        : value === filteredItems?.[i]?.value,
                      isDisabled: opt.isDisabled,
                      size,
                    })}
                    role="option"
                    tabIndex={i === activeIndex ? 0 : -1}
                    {...getItemProps({
                      onClick: () => {
                        if (!opt.isDisabled)
                          onClick({
                            isMultiple,
                            name,
                            index: i,
                            onChange,
                            options: filteredItems,
                            value,
                            setIsOpen,
                            ref: refs.reference,
                          });
                      },
                      onKeyDown: (e) => {
                        if (e.key === "Enter") {
                          onClick({
                            isMultiple,
                            name,
                            index: activeIndex,
                            onChange,
                            options: filteredItems,
                            value,
                            setIsOpen,
                            ref: refs.reference,
                          });
                        }
                      },
                    })}
                    key={`${opt}-${i.toFixed()}`}>
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
                    <span className="hidden truncate sm:block">{opt.label}</span>
                  </div>
                );
              })}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </div>
  );
}
