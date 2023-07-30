import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { tv } from "tailwind-variants";

import { dialogAtom, IconEnum } from "../../utils";
import { Button } from "../Form/Button";
import { DeleteEntityDialog, ExportGraphDialog, FamilyTreeDialog, ImageUploadDialog } from "./DialogContent";

const DialogClasses = tv({
  slots: {
    container: " absolute z-[1000] top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
    base: "flex flex-col pointer-events-auto rounded bg-zinc-700 text-white mx-4 border-zinc-600 border-b shadow-lg p-4",
    titleContainer: "flex items-center",
    title: "w-full flex justify-center font-merriweather text-2xl select-none text-center",
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
        container: "h-[20rem] lg:w-[30rem] w-full",
      },
      md: {
        container: "h-[30rem] lg:w-[40rem] w-full",
      },
      lg: {
        container: "h-[40rem] lg:w-[50rem] w-full",
        imageUploadContainer: "h-[15rem] max-h-[15rem]",
        imagesList: "h-[15rem]",
      },
    },
    isOverlay: {
      true: {
        container: "bg-zinc-950 bg-opacity-60 w-full h-full flex justify-center items-center",
        base: "max-w-[80%] h-max",
        titleContainer: "mb-4",
      },
      false: {
        container: "",
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

  if (!dialog?.title) return null;
  return (
    <div className={container()}>
      <div className={base()}>
        <div className={titleContainer()}>
          {dialog?.title ? <h1 className={title()}>{dialog.title}</h1> : null}
          <div className="ml-auto">
            <Button hasNoBackground icon={IconEnum.close} iconSize={22} onClick={resetDialogAtom} />
          </div>
        </div>
        {dialog.type === "image_upload" ? <ImageUploadDialog size={dialog.size || "md"} type={dialog?.data?.type} /> : null}
        {dialog.type === "archive_entity" || dialog.type === "delete_entity" ? (
          <DeleteEntityDialog data={dialog.data} type={dialog.type} />
        ) : null}
        {dialog.type === "family_tree" ? <FamilyTreeDialog data={dialog.data} /> : null}
        {dialog.type === "export_graph" ? <ExportGraphDialog /> : null}
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
  );
}
