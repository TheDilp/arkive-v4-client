import {
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { tv } from "tailwind-variants";

import { dialogAtom, IconEnum } from "../../utils";
import { Button } from "../Form/Button";
import { DeleteEntityDialog } from "./DialogContent";
import { ImageUploadDialog } from "./DialogContent/ImageUploadDialog";
import FamilyTreeDialog from "./DialogContent/FamilyTreeDialog";

const DialogClasses = tv({
  slots: {
    container: "pointer-events-none flex h-full w-full animate-in fade-in",
    base: "flex flex-col pointer-events-auto rounded bg-zinc-700 text-white mx-4 border-zinc-600 border-b shadow-lg p-4",
    titleContainer: "flex items-center",
    title: "w-full flex justify-center font-merriweather text-3xl select-none text-center",
    imageUploadContainer: "sticky top-0 bg-zinc-700",
    imagesList: "grid grid-cols-2 gap-2 overflow-y-auto",
  },
  variants: {
    position: {
      top: {
        container: "justify-center items-start",
      },
      center: {
        container: "justify-center items-center",
      },
      right: {
        container: "justify-end items-center",
      },
      left: {
        container: "justify-start items-center",
      },
      bottom: {
        container: "justify-center items-end",
      },
    },
    size: {
      sm: {
        base: "h-[20rem] lg:w-[30rem] w-full",
      },
      md: {
        base: "h-[30rem] lg:w-[40rem] w-full",
      },
      lg: {
        base: "h-[40rem] lg:w-[50rem] w-full",
        imageUploadContainer: "h-[15rem] max-h-[15rem]",
        imagesList: "h-[15rem]",
      },
    },
    isOverlay: {
      true: {
        container: "bg-zinc-950 bg-opacity-60",
      },
    },
  },
});

export function Dialog() {
  const dialog = useAtomValue(dialogAtom);

  const { base, container, title, titleContainer } = DialogClasses({
    position: dialog?.position || "center",
    isOverlay: dialog?.isOverlay,
    size: dialog?.size || "md",
  });
  const resetDialogAtom = useResetAtom(dialogAtom);
  const { context } = useFloating({
    open: !!dialog?.title,
    onOpenChange: (open) => (open ? () => {} : resetDialogAtom),
  });

  const click = useClick(context, {
    enabled: true,
  });
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown" });
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);
  if (!dialog?.title) return null;
  return (
    <FloatingPortal>
      <FloatingOverlay className="z-[100]" lockScroll>
        <FloatingFocusManager context={context}>
          <div className={container()}>
            <div ref={context.refs.setFloating} className={base()} {...interactions.getFloatingProps()}>
              <div className={titleContainer()}>
                {dialog?.title ? <h1 className={title()}>{dialog.title}</h1> : null}
                <div className="ml-auto">
                  <Button hasNoBackground icon={IconEnum.close} iconSize={22} onClick={resetDialogAtom} />
                </div>
              </div>
              {dialog.type === "image_upload" ? (
                <ImageUploadDialog size={dialog.size || "md"} type={dialog?.data?.type} />
              ) : null}
              {dialog.type === "archive_entity" || dialog.type === "delete_entity" ? (
                <DeleteEntityDialog data={dialog.data} type={dialog.type} />
              ) : null}
              {dialog.type === "family_tree" ? <FamilyTreeDialog data={dialog.data} type={dialog.type} /> : null}
              {dialog?.cancel || dialog?.confirm ? (
                <div className="mt-auto flex items-center justify-center gap-x-2">
                  {dialog?.cancel ? (
                    <Button
                      icon={dialog?.cancel?.icon || IconEnum.close}
                      label={dialog?.cancel?.label || "Cancel"}
                      onClick={dialog?.cancel?.action}
                      variant={dialog?.cancel?.variant || "secondary"}
                    />
                  ) : null}
                  {dialog?.confirm ? (
                    <Button
                      icon={dialog?.confirm?.icon || IconEnum.close}
                      label={dialog?.confirm?.label || "Confirm"}
                      onClick={dialog?.confirm?.action}
                      variant={dialog?.confirm?.variant || "error"}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
}
