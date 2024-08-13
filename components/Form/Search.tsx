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
import { useAtomValue } from "jotai";
import { forwardRef, HTMLProps, MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { useSearch } from "../../hooks";
import { AllAvailableEntities } from "../../types";
import { SearchType } from "../../types/ComponentTypes/FormTypes/searchTypes";
import { AvailableIcons, getAssetURL, IconEnum, userAtom } from "../../utils";
import { Avatar, Icon } from "..";
import { Button } from ".";

interface ItemProps {
  children: ReactNode;
  isActive: boolean;
  isSelected?: boolean;
}

const SearchClasses = tv({
  slots: {
    base: "flex w-full bg-zinc-950 [&:has(input:focus)]:bg-black [&>input:focus]:bg-black text-white rounded-md items-center pl-2 h-10 border border-zinc-700",
    input: "flex h-10 w-full items-center justify-center bg-zinc-950 pr-2 text-base outline-none placeholder:italic border-y",
    label: "text-sm truncate block min-h-[20px]",
    helperText: "text-xs truncate block",
    buttonContainer: "w-10 [&>button]:rounded-l-none [&>button]:shadow-none h-full",
    optionsContainer:
      "overflow-y-auto z-[99999] border-zinc-700 border-b border-x max-h-56 bg-zinc-700 text-white rounded shadow-lg focus-visible:ring-0 focus-visible:outline-none focus:outline-none",
  },
  variants: {
    variant: {
      primary: {
        base: "border-zinc-800 [&:has(input:focus)]:border-zinc-700",
        input: "border-zinc-800 focus:border-zinc-700",
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
        base: "border-red-700",
        input: "border-red-700",
        label: "text-red-600",
        helperText: "text-red-500",
      },
      "primary-bordered": {},
      "secondary-bordered": {},
      "info-bordered": {},
      "success-bordered": {},
      "warning-bordered": {},
      "error-bordered": {},
    },
    size: {
      "4xs": {},
      "3xs": {},
      "2xs": {},
      xs: {},
      sm: {},
      md: {
        base: "max-h-8",
        input: "max-h-8",
      },
      lg: {},
      xl: {},
      "2xl": {},
      "3xl": {},
      "4xl": {},
    },
    isDisabled: {
      true: {
        base: "cursor-not-allowed select-none bg-zinc-700",
        input: "bg-zinc-700 text-zinc-400 cursor-not-allowed pointer-events-none select-none",
      },
    },

    hasValueWithImage: {
      true: {
        input: "pl-2",
      },
    },
    hasNoBackground: {
      true: {
        base: "bg-transparent border-t-0 border-x-0 rounded-none [&:has(input:focus)]:bg-transparent [&>input:focus]:bg-transparent",
        input: "bg-transparent border-t-0 border-b-0",
      },
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
      <div aria-selected={isActive} className={SearchItem({ isActive, isSelected })} id={id} ref={ref} role="option" {...rest}>
        {children}
      </div>
    );
  }
);

export function Search({
  allowedPlacements = [],
  initialDisplayValue,
  placeholder,
  label,
  isAutofocused,
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
  isGlobal,
  isFolders,
  limit,
  offset: offsetProp,
  hasNoBackground,
  onChange,
  manualResults,
  onSearch,
  size,
  parent_id,
  manual_project_id,
}: SearchType) {
  const { project_id } = useParams();
  const user = useAtomValue(userAtom);
  const {
    base,
    input,
    label: labelClasses,
    helperText: helperTextClasses,
    buttonContainer,
    optionsContainer,
  } = SearchClasses({
    variant,
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
      icon?: AvailableIcons;
      parent_id?: string;
      project_id?: string;
      type?: AllAvailableEntities;
    }[]
  >(
    {
      data: {
        search_term: inputValue,
        project_id: searchEntity === "projects" ? null : ((manual_project_id || project_id) as string),
        user_id: searchEntity === "projects" ? user?.id || null : null,
        parent_id,
      },
      limit: limit ?? 0,
    },
    searchEntity,
    searchEntity === "projects" ? "" : ((manual_project_id || project_id) as string),
    isGlobal,
    {
      enabled: false,
      queryKeyConcat: [searchTerm, name, searchEntity || "all"],
      isFolders,
    }
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
    if (inputValue.length >= 2 && document.activeElement === inputRef.current) {
      setSearchTerm(inputValue);
      const timeout = setTimeout(() => {
        refetch();
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }
    if (inputValue.length === 0) {
      // queryClient.removeQueries(["search", searchEntity]);
      setOpen(false);
    }

    return () => {};
  }, [inputValue, refetch]);

  useEffect(() => {
    if (inputValue.length >= 2) {
      refetch();
    }
  }, [searchEntity]);

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
            image={getAssetURL((manual_project_id || project_id) as string, imageType || "images", value as string)}
            imageLoading="lazy"
            isTooltipDisabled
            label={label || ""}
            size="xs"
          />
        ) : null}
        <input
          autoComplete="off"
          autoFocus={isAutofocused}
          className={input()}
          disabled={isDisabled}
          name="search"
          onBlur={() => {
            if (activeIndex === null) setOpen(false);
          }}
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
            if (e.key === "Enter") {
              e.preventDefault();

              if (activeIndex === null && !data?.data.length) {
                refetch();
              } else if (typeof activeIndex === "number" || activeIndex === null) {
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
                    project_id: item?.project_id,
                  });
                  if (hasShownOption) setDisplayValue(item.label);
                  if (!isMultiple) {
                    setInputValue("");
                    setOpen(false);
                  }

                  inputRef.current?.focus();
                }
              }
            }
            if (e.key === "Escape") {
              // if (isMultiple) remove();
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
              if (!inputValue && value) {
                onChange({ name, value: "" });
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
          ref={inputRef}
          type="search"
          value={hasShownOption && !inputValue ? displayValue : inputValue}
        />

        <div className={buttonContainer()}>
          {!inputValue ? (
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
              hasNoBackground
              icon={IconEnum.close}
              isDisabled={!inputValue}
              isLoading={isFetching}
              onClick={() => {
                setDisplayValue("");
                setInputValue("");
              }}
              variant="primary"
            />
          )}
        </div>
      </div>
      {helperText ? <span className={helperTextClasses()}>{helperText}</span> : null}
      <FloatingPortal>
        {open && (searchTerm || displayValue) && !isOptionsHidden && (data?.data?.length || manualResults?.length) && (
          <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss>
            <div
              {...getFloatingProps({
                ref: refs.setFloating,
                style: floatingStyles,
              })}
              className={optionsContainer()}>
              {(manualResults || data?.data)?.map((item, index) => (
                <Item
                  key={item.value}
                  {...getItemProps({
                    ref(node) {
                      listRef.current[index] = node;
                    },
                    onClick(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      if (typeof activeIndex === "number" || activeIndex === null) {
                        const ittem = (manualResults || data?.data)?.[activeIndex || 0];
                        if (ittem) {
                          onChange({
                            name,
                            value: ittem.value,
                            label: ittem.label,
                            color: ittem?.color,
                            image: ittem?.image,
                            type: ittem?.type,
                            parent_id: ittem?.parent_id,
                            project_id: ittem?.project_id,
                            icon: ittem?.icon,
                          });
                          if (hasShownOption) setDisplayValue(ittem.label);
                          if (!isMultiple) {
                            setInputValue("");
                            setOpen(false);
                          }

                          // inputRef.current?.focus();
                        }
                      }

                      if (hasShownOption) setDisplayValue(item.label);
                      if (isMultiple) {
                        // remove();
                        setOpen(false);
                      }

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
                      image={getAssetURL(
                        item?.project_id || ((manual_project_id || project_id) as string),
                        imageType || "images",
                        searchEntity === "images" || searchEntity === "map_images" ? item?.value : item?.image
                      )}
                      imageLoading="lazy"
                      isTooltipDisabled
                      label={label || ""}
                      size="xs"
                    />
                  ) : null}
                  {item?.icon && !item?.image ? <Icon icon={item?.icon as AvailableIcons} /> : null}
                  <span className="truncate">{item.label}</span>
                </Item>
              ))}

              {/* If no results for public search display NO RESULTS */}
              {IS_PUBLIC && data?.data?.length && !manualResults?.length ? (
                <Item
                  {...getItemProps({
                    key: "no_results",
                    onClick(e) {
                      e.preventDefault();
                      e.stopPropagation();
                    },
                  })}
                  isActive={false}
                  isSelected={false}>
                  <span className="truncate">No results</span>
                </Item>
              ) : null}
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </div>
  );
}
