// import { useEffect, useState } from "react";

// import { AutocompleteType } from "../../types/ComponentTypes/FormTypes/autocompleteTypes";
// import { IconEnum } from "../../utils";
// import { Button, Input } from ".";

// export function Autocomplete({ placeholder, value }: AutocompleteType) {
//   const [filter, setFilter] = useState("");

//   useEffect(() => {}, [filter]);

//   return (
//     <div className="flex max-w-fit [&>div>input]:rounded-r-none  [&>div>input]:border-r-0">
//       <Input placeholder={placeholder} value={value} />
//       <div className="w-10 [&>button]:rounded-l-none [&>button]:border-y [&>button]:border-r [&>button]:border-zinc-700">
//         <Button icon={IconEnum.search} variant="info" />
//       </div>
//     </div>
//   );
// }

import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  size,
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
import { SearchType } from "../../types/ComponentTypes/FormTypes/searchTypes";
import { getImageURL, IconEnum } from "../../utils";
import { Avatar, Icon } from "..";
import { Button } from ".";

interface ItemProps {
  children: ReactNode;
  active: boolean;
}

const SearchClasses = tv({
  slots: {
    base: "flex w-full bg-zinc-900 focus:bg-zinc-950 text-white rounded-l-md items-center pl-2 h-10 border border-zinc-700",
    input: "flex h-10 w-full items-center justify-center bg-zinc-900 p-2 text-base outline-none placeholder:italic border-y",
    label: "text-sm truncate block pl-1 min-h-[20px]",
    buttonContainer: "w-10 [&>button]:rounded-l-none [&>button]:shadow-none h-full",
    optionsContainer:
      "overflow-y-auto z-[99999] border-zinc-700 border-b border-x max-h-56 bg-zinc-900 text-white rounded-b shadow-lg focus-visible:ring-0 focus-visible:outline-none focus:outline-none",
  },
  variants: {
    variant: {
      primary: {
        input: "border-zinc-700",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      secondary: {
        input: "border-zinc-400",
        label: "text-zinc-300",
        helperText: "text-zinc-300",
      },
      info: {
        input: "border-blue-600",
        label: "text-blue-400",
        helperText: "text-blue-400",
        icon: "text-blue-200",
      },
      success: {
        input: "border-green-600",
        label: "text-green-400",
        helperText: "text-green-400",
      },
      warning: {
        input: "border-orange-400",
        label: "text-orange-400",
        helperText: "text-orange-400",
      },
      error: {
        input: "border-red-600",
        label: "text-red-500",
        helperText: "text-red-500",
      },
    },
    size: {
      sm: {
        input: "h-8",
      },
    },
    isDisabled: {
      true: {
        base: "cursor-not-allowed select-none",
        input: "bg-zinc-700 text-zinc-400 cursor-not-allowed pointer-events-none select-none",
      },
    },
    isAutocomplete: {
      true: {
        base: "rounded-r-md",
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

const Item = forwardRef<HTMLDivElement, ItemProps & HTMLProps<HTMLDivElement>>(({ children, active, ...rest }, ref) => {
  const id = useId();
  return (
    <div ref={ref} aria-selected={active} className={SearchItem({ isActive: active })} id={id} role="option" {...rest}>
      {children}
    </div>
  );
});

export function Search({
  placeholder,
  label,
  isAutocomplete,
  variant = "primary",
  searchEntity,
  name,
  value,
  onChange,
}: SearchType) {
  const { project_id } = useParams();
  const { base, input, label: labelClasses, buttonContainer, optionsContainer } = SearchClasses({ variant, isAutocomplete });
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const inputRef = useRef() as MutableRefObject<HTMLInputElement>;

  const { data, isFetching, remove, refetch } = useSearch<{ label: string; value: string; color?: string }>(
    { data: { search_term: inputValue } },
    searchEntity,
    project_id as string,
    {
      enabled: false,
    },
  );
  const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
    whileElementsMounted: autoUpdate,
    open,
    onOpenChange: setOpen,
    middleware: [
      flip({ padding: 10 }),
      size({
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
    if (data?.data?.length) setOpen(true);
  }, [data?.data]);

  useEffect(() => {
    if (isAutocomplete && inputValue && document.activeElement === inputRef.current) {
      const timeout = setTimeout(() => {
        refetch();
      }, 1000);

      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [isAutocomplete, inputValue, refetch]);

  return (
    <>
      {label ? <div className={labelClasses()}>{label}</div> : null}
      <div
        className={base()}
        {...getReferenceProps({
          ref: refs.setReference,
        })}>
        {searchEntity === "images" && value ? (
          <Avatar
            image={getImageURL(project_id as string, "images", value as string)}
            imageLoading="lazy"
            isTooltipDisabled
            label={label || ""}
            size="xs"
          />
        ) : null}
        <input
          ref={inputRef}
          autoComplete="one-time-code"
          className={input()}
          name="search"
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue) {
              e.preventDefault();
              if (!value && activeIndex === null) {
                refetch();
              } else if (!value && typeof activeIndex === "number") {
                const item = data?.data?.[activeIndex];
                if (item) {
                  onChange({ name, value: item.value, label: item.label, color: item?.color });
                  if (!isAutocomplete) {
                    setInputValue("");
                  } else {
                    setInputValue(item.label);
                  }
                  setOpen(false);
                  remove();
                  inputRef.current?.focus();
                }
              }
            }
            if (e.key === "Backspace" && inputValue) {
              if (value) {
                e.preventDefault();
                onChange({ name, value: "", label: "" });
                setInputValue("");
              }
              remove();
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
          value={inputValue}
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
              icon={isFetching ? IconEnum.loading : IconEnum.search}
              isDisabled={!inputValue}
              isLoading={isFetching}
              onClick={() => refetch()}
              variant="info"
            />
          )}
        </div>
      </div>
      <FloatingPortal>
        {open && (
          <FloatingFocusManager context={context} initialFocus={-1} visuallyHiddenDismiss>
            <div
              {...getFloatingProps({
                ref: refs.setFloating,
                style: floatingStyles,
              })}
              className={optionsContainer()}>
              {data?.data?.map((item, index) => (
                <Item
                  {...getItemProps({
                    key: item.value,
                    ref(node) {
                      listRef.current[index] = node;
                    },
                    onClick() {
                      onChange({ name, value: item.value, label: item.label, color: item?.color });
                      setInputValue("");
                      setOpen(false);
                      remove();
                      inputRef.current?.focus();
                    },
                  })}
                  active={activeIndex === index}>
                  {searchEntity === "images" ? (
                    <Avatar
                      image={getImageURL(project_id as string, "images", item?.value)}
                      imageLoading="lazy"
                      isTooltipDisabled
                      label={label || ""}
                      size="xs"
                    />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </Item>
              ))}
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  );
}
