import {
  autoPlacement,
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  size as floatingSize,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import { forwardRef, HTMLProps, MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useSearch } from "../../hooks";
import { AllAvailableEntities } from "../../types";
import { SearchType } from "../../types/ComponentTypes/FormTypes/searchTypes";
import { getImageURL, IconEnum } from "../../utils";
import { Avatar, Icon } from "..";
import { Button } from ".";

interface ItemProps {
  children: ReactNode;
  isActive: boolean;
  isSelected?: boolean;
}

const SearchClasses = tv({
  slots: {
    base: "flex w-full bg-zinc-900 focus:bg-zinc-950 text-white rounded-md items-center pl-2 h-10 border border-zinc-700",
    input: "flex h-10 w-full items-center justify-center bg-zinc-900 pr-2 text-base outline-none placeholder:italic border-y",
    label: "text-sm truncate block min-h-[20px]",
    helperText: "text-xs truncate block",
    buttonContainer: "w-10 [&>button]:rounded-l-none [&>button]:shadow-none h-full",
    optionsContainer:
      "overflow-y-auto z-[99999] border-zinc-700 border-b border-x max-h-56 bg-zinc-700 text-white rounded shadow-lg focus-visible:ring-0 focus-visible:outline-none focus:outline-none",
  },
  variants: {
    variant: {
      primary: {
        base: "border-zinc-700",
        input: "border-zinc-700",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      secondary: {
        base: "border-zinc-400",
        input: "border-zinc-400",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      info: {
        base: "border-blue-600",
        input: "border-blue-600",
        label: "text-blue-400",
        helperText: "text-blue-400",
        icon: "text-blue-200",
      },
      success: {
        base: "border-green-600",
        input: "border-green-600",
        label: "text-green-400",
        helperText: "text-green-400",
      },
      warning: {
        base: "border-orange-400",
        label: "text-orange-400",
        helperText: "text-orange-400",
      },
      error: {
        base: "border-red-600",
        input: "border-red-600",
        label: "text-red-500",
        helperText: "text-red-500",
      },
    },
    size: {
      sm: {
        base: "max-h-8",
        input: "max-h-8",
      },
    },
    isDisabled: {
      true: {
        base: "cursor-not-allowed select-none bg-zinc-700",
        input: "bg-zinc-700 text-zinc-400 cursor-not-allowed pointer-events-none select-none",
      },
    },
    isAutocomplete: {
      true: {
        base: "rounded-r-md",
      },
    },
    hasValueWithImage: {
      true: {
        input: "pl-2",
      },
    },
    hasNoBackground: {
      true: { base: "bg-transparent border-t-0 border-x-0 rounded-none", input: "bg-transparent border-t-0 border-b-0" },
    },
  },
});

const SearchItem = tv({
  base: [
    "h-10",
    "py-2",
    "px-4",
    "outline-none",
    "focus-visible:outline-none",
    "focus-visible:ring-0",
    "hover:cursor-pointer",
    // "hover:bg-zinc-500",
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
      true: "bg-zinc-500",
    },
    isSelected: {
      true: "bg-blue-500",
    },
  },
  compoundVariants: [
    {
      isActive: true,
      isSelected: true,
      className: "bg-blue-400",
    },
  ],
});

const Item = forwardRef<HTMLDivElement, ItemProps & HTMLProps<HTMLDivElement>>(
  ({ children, isActive, isSelected, ...rest }, ref) => {
    const id = useId();
    return (
      <div ref={ref} aria-selected={isActive} className={SearchItem({ isActive, isSelected })} id={id} role="option" {...rest}>
        {children}
      </div>
    );
  },
);

export function Search({
  allowedPlacements = [],
  initialDisplayValue,
  placeholder,
  label,
  isAutocomplete,
  variant = "primary",
  searchEntity,
  isDisabled,
  name,
  helperText,
  value,
  hasShownOption,
  imageType,
  isOptionsHidden,
  isMultiple,
  limit,
  offset: offsetProp,
  hasNoBackground,
  onChange,
  manualResults,
  onSearch,
  size,
  isPublic,
}: SearchType) {
  const { project_id } = useParams();
  const {
    base,
    input,
    label: labelClasses,
    helperText: helperTextClasses,
    buttonContainer,
    optionsContainer,
  } = SearchClasses({
    variant,
    isAutocomplete,
    hasValueWithImage: !isMultiple && !!value && searchEntity === "images",
    isDisabled,
    size,
    hasNoBackground,
  });
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [displayValue, setDisplayValue] = useState(initialDisplayValue || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const inputRef = useRef() as MutableRefObject<HTMLInputElement>;

  const { data, isFetching, refetch } = useSearch<
    {
      label: string;
      value: string;
      color?: string;
      image?: string;
      full_name?: string;
      icon?: string;
      parent_id?: string;
      type?: AllAvailableEntities;
    }[]
  >(
    { data: { search_term: inputValue, project_id: project_id as string }, limit: limit ?? 0 },
    searchEntity,
    project_id as string,
    {
      enabled: false,
      queryKeyConcat: [searchTerm, name],
      isPublic,
    },
  );

  const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setOpen,
    middleware: [
      autoPlacement({ allowedPlacements }),
      offset(offsetProp || { mainAxis: 2 }),
      floatingSize({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            maxWidth: `${rects.reference.width}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 10,
      }),
    ],
  });

  const role = useRole(context, { role: "listbox" });
  const dismiss = useDismiss(context);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([role, dismiss, listNav]);
  useEffect(() => {
    if (data?.data?.length) {
      setOpen(true);
    }
    if (Array.isArray(data?.data) && onSearch) {
      onSearch(data?.data);
    }
  }, [data?.data]);

  useEffect(() => {
    if (isAutocomplete && inputValue && document.activeElement === inputRef.current) {
      setSearchTerm(inputValue);
      const timeout = setTimeout(() => {
        refetch();
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [isAutocomplete, inputValue, refetch]);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) setOpen(false);
  }, [document.activeElement, inputRef.current]);

  return (
    <div className="w-full">
      {label ? <div className={labelClasses()}>{label}</div> : null}
      <div
        className={base()}
        {...getReferenceProps({
          ref: refs.setReference,
        })}>
        {(searchEntity === "images" || searchEntity === "map_images") && value && !isMultiple ? (
          <Avatar
            image={getImageURL(project_id as string, imageType || "images", value as string)}
            imageLoading="lazy"
            isTooltipDisabled
            label={label || ""}
            size="xs"
          />
        ) : null}
        <input
          ref={inputRef}
          autoComplete="off"
          className={input()}
          disabled={isDisabled}
          name="search"
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onClick={() => {
            if (data?.data?.length) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape" && document.activeElement === inputRef.current) {
              setInputValue("");
              setOpen(false);
            }
            if (e.key === "Enter" && inputValue) {
              e.preventDefault();

              if ((!value || isMultiple) && activeIndex === null) {
                refetch();
              } else if ((!value || isMultiple) && (typeof activeIndex === "number" || activeIndex === null)) {
                const item = (manualResults || data?.data)?.[activeIndex || 0];
                if (item) {
                  onChange({
                    name,
                    value: item.value,
                    label: item.label,
                    color: item?.color,
                    image: item?.image,
                    type: item?.type,
                    parent_id: item?.parent_id,
                    icon: item?.icon,
                  });
                  if (hasShownOption) setDisplayValue(item.label);
                  if (!isMultiple) {
                    setInputValue("");
                  }
                  setOpen(false);
                  inputRef.current?.focus();
                }
              }
            }
            if (e.key === "Backspace") {
              if (value || inputValue || displayValue) {
                // e.preventDefault();
                // if (!isMultiple && value) onChange({ name, value: "", label: "" });
                // setInputValue("");
                // setDisplayValue("");
              }
              if (displayValue) {
                setDisplayValue("");
              }
            }
            if (e.key === "ArrowUp") {
              if (activeIndex === 0 && data?.data) {
                setActiveIndex(data.data.length - 1);
              } else {
                setActiveIndex((prev) => (prev ? prev - 1 : 0));
              }
            }
            if (e.key === "ArrowDown") {
              if (activeIndex === data?.data?.length) {
                setActiveIndex(0);
              } else setActiveIndex((prev) => prev ?? 0 + 1);
            }
          }}
          placeholder={placeholder}
          type="search"
          value={hasShownOption && !inputValue ? displayValue : inputValue}
        />

        <div className={buttonContainer()}>
          {isAutocomplete ? (
            <div className="flex h-full items-center justify-center">
              <Icon
                className={isFetching ? "animate-spin" : ""}
                color="#71717a"
                fontSize={20}
                icon={isFetching ? IconEnum.loading : IconEnum.search}
              />
            </div>
          ) : (
            <Button
              hasNoBackground={hasNoBackground}
              icon={isFetching ? IconEnum.loading : IconEnum.search}
              isDisabled={!inputValue}
              isLoading={isFetching}
              onClick={() => refetch()}
              variant={hasNoBackground ? "primary" : "info"}
            />
          )}
        </div>
      </div>
      {helperText ? <span className={helperTextClasses()}>{helperText}</span> : null}
      <FloatingPortal>
        {(open || (!isAutocomplete && (searchTerm || displayValue))) &&
          !isOptionsHidden &&
          (data?.data?.length || manualResults?.length) && (
            <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss>
              <div
                {...getFloatingProps({
                  ref: refs.setFloating,
                  style: floatingStyles,
                })}
                className={optionsContainer()}>
                {(manualResults || data?.data)?.map((item, index) => (
                  <Item
                    {...getItemProps({
                      key: item.value,
                      ref(node) {
                        listRef.current[index] = node;
                      },
                      onClick(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        onChange({
                          name,
                          value: item.value,
                          label: item.label,
                          color: item?.color,
                          image: item?.image,
                          parent_id: item?.parent_id,
                          type: item?.type,
                          icon: item?.icon,
                        });

                        if (hasShownOption) setDisplayValue(item.label);
                        setOpen(false);
                        inputRef.current?.focus();
                      },
                    })}
                    isActive={activeIndex === index}
                    isSelected={(value || [])?.includes(item.value)}>
                    {((searchEntity === "images" || searchEntity === "map_images") && item?.value) ||
                    ((searchEntity === "places" ||
                      searchEntity === "maps" ||
                      searchEntity === "characters" ||
                      searchEntity === "all") &&
                      item?.image) ? (
                      <Avatar
                        image={getImageURL(
                          project_id as string,
                          imageType || "images",
                          searchEntity === "images" || searchEntity === "map_images" ? item?.value : item?.image,
                        )}
                        imageLoading="lazy"
                        isTooltipDisabled
                        label={label || ""}
                        size="xs"
                      />
                    ) : null}
                    {item?.icon && !item?.image ? <Icon icon={item?.icon} /> : null}
                    <span className="truncate">{item.label}</span>
                  </Item>
                ))}
              </div>
            </FloatingFocusManager>
          )}
      </FloatingPortal>
    </div>
  );
}
