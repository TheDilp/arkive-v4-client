import { useResetAtom } from "jotai/utils";
import { useParams } from "react-router-dom";

import { useDeleteAsset, useDeleteEntity, useDeleteSubEntity } from "../../../hooks";
import { AvailableEntityType, AvailableSubEntityType, DialogContentType } from "../../../types";
import {
  capitalizeFirstLetter,
  dialogAtom,
  getCharacterFullName,
  getImageURL,
  getSingularEntityType,
  IconEnum,
  useNotifications,
} from "../../../utils";
import { Button } from "../../Form";
import { Avatar } from "../../Misc";

export function DeleteEntityDialog({ data, type }: { data: { [key: string]: any }; type: DialogContentType }) {
  const action = type?.replace("_entity", "");
  const { project_id } = useParams();
  const resetDialogAtom = useResetAtom(dialogAtom);
  const { mutate: deleteEntity } = useDeleteEntity(
    data?.entity_title as AvailableEntityType,
    project_id as string,
    action === "arkive",
  );
  const { mutate: deleteSubEntity } = useDeleteSubEntity(data?.entity_title as AvailableSubEntityType, project_id as string);
  const { mutate: deleteAsset } = useDeleteAsset(project_id as string, data.asset_type);
  const createNotification = useNotifications();
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="text-center text-lg">
        Are you sure you want to {action === "delete" ? <span className="text-red-600">PERMANENTLY</span> : ""} {action} this{" "}
        {getSingularEntityType(data?.entity_title) || "entity"} {data?.is_folder ? "folder" : ""} - &quot;
        {data?.entity_title === "characters"
          ? getCharacterFullName(data?.first_name || "", data?.last_name || "")
          : data?.title}
        &quot; ?
        {data?.entity_title === "blueprints" && action !== "arkive" ? (
          <p className="text-center text-red-600">Deleting a blueprint will also delete all of its fields and instances.</p>
        ) : null}
        {data?.is_folder && action !== "arkive" ? (
          <p className="text-center text-red-500">
            <span className="text-red-600">WARNING: </span>
            Deleting a folder will also delete all of its children!
          </p>
        ) : null}
        {action === "delete" ? <p className="text-center text-sm text-red-400">This action cannot be undone.</p> : null}
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

      <div className="mt-auto flex gap-x-2">
        <Button icon={IconEnum.close} label="Cancel" onClick={resetDialogAtom} />
        <Button
          icon={action === "archive" ? IconEnum.archive : IconEnum.trash}
          label={capitalizeFirstLetter(action || "")}
          onClick={() => {
            if (data?.id && project_id && data?.entity_title) {
              if (data?.entity_title === "images") {
                deleteAsset({ data: { id: data?.id } });
              } else if (data?.entity_title && data?.parent_id) {
                deleteSubEntity({ data: { id: data?.id, parent_id: data?.parent_id as string } });
              } else {
                deleteEntity({ data: { id: data?.id, parent_id: data?.parent_id as string } });
              }
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
