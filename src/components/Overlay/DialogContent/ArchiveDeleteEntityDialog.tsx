import { useParams } from "react-router-dom";

import { Button } from "../../Form";
import { Avatar } from "../../Misc";
import { AvailableEntityType, DialogContentType } from "../../../types";
import {
  IconEnum,
  capitalizeFirstLetter,
  dialogAtom,
  getCharacterFullName,
  getImageURL,
  useNotifications,
  useResetAtom,
} from "../../../utils";
import { useDeleteEntity } from "../../../hooks";

export function ArchiveDeleteEntityDialog({ data, type }: { data: { [key: string]: any }; type: DialogContentType }) {
  const action = type?.replace("_entity", "");
  const { projectId } = useParams();
  const resetDialogAtom = useResetAtom(dialogAtom);
  const { mutate } = useDeleteEntity(data?.entity_title as AvailableEntityType, projectId as string, action === "archive");
  const createNotification = useNotifications();
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="text-center text-lg">
        Are you sure you want to {action === "delete" ? <span className="text-red-600">PERMANENTLY</span> : ""} {action} this{" "}
        {data?.entity_title || "entity"} - {getCharacterFullName(data?.firstName || "", data?.lastName || "")}?
        <p className="text-center text-sm text-zinc-300">
          {type === "archive_entity"
            ? " You can restore it or delete it permanently in the archived section."
            : "This action cannot be undone."}
        </p>
      </div>
      <div className="mx-auto my-2 flex items-center gap-x-4">
        {data?.image && data?.projectId ? (
          <>
            <Avatar
              image={getImageURL(data?.projectId, "images", data?.image || "")}
              isBordered
              isTooltipDisabled
              label=""
              size="2xl"
            />
            <span className="text-lg">{getCharacterFullName(data?.firstName || "", data?.lastName || "")}</span>
          </>
        ) : null}
      </div>

      <div className="mt-auto flex gap-x-8">
        <Button icon={IconEnum.close} label="Cancel" onClick={resetDialogAtom} />
        <Button
          icon={action === "archive" ? IconEnum.archive : IconEnum.trash}
          label={capitalizeFirstLetter(action || "")}
          onClick={() => {
            if (data?.id && projectId && data?.entity_title) {
              mutate({ id: data?.id });
              resetDialogAtom();
            } else {
              createNotification({
                id: crypto.randomUUID(),
                title: `Could not ${action} entity.`,
                timer: 5,
                variant: "error",
                icon: IconEnum.error,
              });
            }
          }}
          variant="error"
        />
      </div>
    </div>
  );
}
