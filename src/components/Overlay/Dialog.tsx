/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { tv } from "tailwind-variants";

import { dialogAtom, IconEnum } from "../../utils";
import { Button } from "../Form/Button";
import {
  DeleteEntityDialog,
  ExportGraphDialog,
  FamilyTreeDialog,
  ImageUploadDialog,
  ImageViewDialog,
  InsertEditorImageDialog,
  RestoreEntityDialog,
} from "./DialogContent";
import { AutomentionDrawer } from "./DrawerContent";

const DialogClasses = tv({
  slots: {
    container: "absolute z-[1000] top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]",
    base: "flex flex-col pointer-events-auto rounded bg-zinc-800 text-white mx-4 border border-zinc-600 shadow-lg p-4 h-full w-full max-w-[80%] lg:max-w-[100%]",
    titleContainer: "flex items-center relative",
    title: "w-full flex justify-center font-merriweather text-2xl select-none text-center",
    imageUploadContainer: "sticky top-0 bg-zinc-700",
    imagesList: "grid grid-cols-2 gap-2 overflow-y-auto",
  },
  variants: {
    position: {
      top: {
        container: "top-[10%] left-[50%] -translate-x-[50%] -translate-y-[0%]",
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
    isImageView: {
      true: {
        container: "cursor-pointer",
        base: "bg-transparent border-none",
      },
    },
    isOverlay: {
      true: {
        container: "w-screen h-screen lg:w-screen bg-black top-0 left-0 translate-x-0 translate-y-0 bg-opacity-80",
        base: "h-[40rem] w-[50rem] absolute z-[1000] top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] relative",
        titleContainer: "mb-4",
      },
      false: {
        container: "",
      },
    },
    hasNoContent: {
      true: {
        base: "h-fit",
      },
    },
  },
});

export function Dialog() {
  const { item_id } = useParams();
  const dialog = useAtomValue(dialogAtom);

  const { base, container, title, titleContainer } = DialogClasses({
    position: dialog?.position || "center",
    isOverlay:
      dialog?.type === "image_view" ||
      dialog?.type === "arkive_entity" ||
      dialog?.type === "delete_entity" ||
      dialog?.isOverlay,
    size: dialog?.size || "md",
    isImageView: dialog?.type === "image_view",
    hasNoContent:
      !dialog?.type ||
      dialog?.type === "arkive_entity" ||
      dialog?.type === "arkive_many" ||
      dialog?.type === "delete_entity" ||
      dialog?.type === "delete_many" ||
      dialog?.type === "restore_entity",
  });
  const resetDialogAtom = useResetAtom(dialogAtom);

  useEffect(() => {
    resetDialogAtom();
  }, [item_id]);

  if (dialog?.type === "image_view")
    return (
      <div className={container()} onClick={resetDialogAtom}>
        <div className="absolute right-4">
          <Button hasNoBackground icon={IconEnum.close} iconSize={48} isIconOnly onClick={resetDialogAtom} />
        </div>
        <div className={base()} onClick={resetDialogAtom}>
          <ImageViewDialog data={dialog?.data} />
        </div>
      </div>
    );

  if (!dialog?.title) return null;
  return (
    <div className={container()}>
      <div className={base()}>
        <div className={titleContainer()}>
          {dialog?.title ? <h1 className={title()}>{dialog.title}</h1> : null}
          <div className="w-min">
            <Button hasNoBackground icon={IconEnum.close} isIconOnly onClick={() => resetDialogAtom()} />
          </div>
        </div>
        {dialog.type === "image_upload" ? <ImageUploadDialog size={dialog.size || "md"} /> : null}
        {dialog.type === "restore_entity" ? <RestoreEntityDialog data={dialog.data} /> : null}
        {dialog.type === "arkive_entity" || dialog.type === "delete_entity" ? (
          <DeleteEntityDialog data={dialog.data} type={dialog.type} />
        ) : null}
        {dialog.type === "family_tree" ? <FamilyTreeDialog data={dialog.data} /> : null}
        {dialog.type === "export_graph" ? <ExportGraphDialog /> : null}
        {dialog.type === "insert_image" ? <InsertEditorImageDialog data={dialog.data} /> : null}
        {dialog.type === "automention" ? <AutomentionDrawer data={dialog.data} /> : null}
        {dialog?.description ? <p className="text-center font-lato text-lg">{dialog.description}</p> : null}
        {dialog?.warning ? <span className="py-1 text-center font-lato text-base text-red-400">{dialog.warning}</span> : null}
        {dialog?.type === "delete_many" ? (
          <p className="text-center text-red-500">
            <span className="text-red-600">WARNING: </span>
            Deleting a folder will also delete all of its children!
          </p>
        ) : null}
        {dialog?.cancel || dialog?.confirm ? (
          <div className="mt-auto flex items-center justify-center gap-x-2">
            {dialog?.cancel ? (
              <Button
                icon={dialog?.cancel?.icon || IconEnum.close}
                label={dialog?.cancel?.label || "Cancel"}
                onClick={() => {
                  if (dialog?.cancel?.action && typeof dialog?.cancel?.action === "function") {
                    dialog?.cancel?.action();
                  }
                  resetDialogAtom();
                }}
                variant={dialog?.cancel?.variant || "secondary"}
              />
            ) : null}
            {dialog?.confirm ? (
              <Button
                icon={dialog?.confirm?.icon || IconEnum.close}
                label={dialog?.confirm?.label || "Confirm"}
                onClick={() => {
                  if (dialog?.confirm?.action && typeof dialog?.confirm?.action === "function") {
                    dialog?.confirm?.action();
                  }
                  resetDialogAtom();
                }}
                variant={dialog?.confirm?.variant || "primary"}
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
