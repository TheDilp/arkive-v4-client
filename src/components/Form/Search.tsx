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
import { IconEnum } from "../../utils";
import { Button } from ".";

interface ItemProps {
  children: ReactNode;
  active: boolean;
}

const SearchClasses = tv({
  slots: {
    base: "flex w-full",
    input:
      "flex h-10 w-full items-center justify-center bg-zinc-900 text-white focus:bg-zinc-950 rounded-l-md p-2 text-base outline-none placeholder:italic",
    label: "text-sm font-medium truncate block pl-1 min-h-[20px]",
    buttonContainer: "w-10 [&>button]:rounded-l-none [&>button]:shadow-none",
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
    <div ref={ref} aria-selected={active} className={SearchItem()} id={id} role="option" {...rest}>
      {children}
    </div>
  );
});

export function Search({ placeholder, label, onChange }: SearchType) {
  const { project_id } = useParams();
  const { base, input, label: labelClasses, buttonContainer } = SearchClasses();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const listRef = useRef<Array<HTMLElement | null>>([]);
  const inputRef = useRef() as MutableRefObject<HTMLInputElement>;
  const { data, isFetching, remove, refetch } = useSearch<{ label: string; value: string }>(
    { data: { search_term: inputValue } },
    "characters",
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

  return (
    <>
      <div className={base()}>
        {label ? <div className={labelClasses()}>{label}</div> : null}
        <input
          ref={inputRef}
          className={input()}
          name="search"
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
          {...getReferenceProps({
            ref: refs.setReference,
          })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue) refetch();
          }}
          placeholder={placeholder}
          value={inputValue}
        />
        <div className={buttonContainer()}>
          <Button
            icon={isFetching ? IconEnum.loading : IconEnum.search}
            isDisabled={!inputValue}
            isLoading={isFetching}
            onClick={() => refetch()}
            variant="info"
          />
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
              className="z-[999999] max-w-full bg-zinc-900">
              {data?.data?.map((item, index) => (
                <Item
                  {...getItemProps({
                    key: item.value,
                    ref(node) {
                      listRef.current[index] = node;
                    },
                    onClick() {
                      setInputValue("");
                      setOpen(false);
                      remove();
                      onChange(item);
                      refs.domReference.current?.focus();
                    },
                  })}
                  active={activeIndex === index}>
                  <span className="w-full max-w-full truncate">{item.label}</span>
                </Item>
              ))}
            </div>
          </FloatingFocusManager>
        )}
      </FloatingPortal>
    </>
  );
}
