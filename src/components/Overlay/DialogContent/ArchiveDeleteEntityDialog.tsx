import { useResetAtom } from "jotai/utils";
import { useParams } from "react-router-dom";

import { useDeleteEntity } from "../../../hooks";
import { AvailableEntityType, DialogContentType } from "../../../types";
import {
  capitalizeFirstLetter,
  dialogAtom,
  getCharacterFullName,
  getImageURL,
  IconEnum,
  useNotifications,
} from "../../../utils";
import { getEntityNameFromType } from "../../../utils/ui/entityUtils";
import { Button } from "../../Form";
import { Avatar } from "../../Misc";

export function DeleteEntityDialog({ data, type }: { data: { [key: string]: any }; type: DialogContentType }) {
  const action = type?.replace("_entity", "");
  const { project_id } = useParams();
  const resetDialogAtom = useResetAtom(dialogAtom);
  const { mutate } = useDeleteEntity(data?.entity_title as AvailableEntityType, project_id as string, action === "archive");
  const createNotification = useNotifications();
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="text-center text-lg">
        Are you sure you want to {action === "delete" ? <span className="text-red-600">PERMANENTLY</span> : ""} {action} this{" "}
        {getEntityNameFromType(data?.entity_title) || "entity"} -{" "}
        {data?.entity_title === "characters"
          ? getCharacterFullName(data?.first_name || "", data?.last_name || "")
          : data?.title}
        ?<p className="text-center text-sm text-red-400">This action cannot be undone.</p>
      </div>
      <div className="mx-auto my-2 flex items-center gap-x-4">
        {data?.image && data?.project_id ? (
          <>
            <Avatar
              image={getImageURL(data?.project_id, "images", data?.image || "")}
              isBordered
              isTooltipDisabled
              label=""
              size="2xl"
            />
            <span className="text-lg">{getCharacterFullName(data?.first_name || "", data?.last_name || "")}</span>
          </>
        ) : null}
      </div>

      <div className="mt-auto flex gap-x-8">
        <Button icon={IconEnum.close} label="Cancel" onClick={resetDialogAtom} />
        <Button
          icon={action === "archive" ? IconEnum.archive : IconEnum.trash}
          label={capitalizeFirstLetter(action || "")}
          onClick={() => {
            if (data?.id && project_id && data?.entity_title) {
              mutate({ data: { id: data?.id, parent_id: data?.parent_id as string } });
              resetDialogAtom();
            } else {
              createNotification({
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
