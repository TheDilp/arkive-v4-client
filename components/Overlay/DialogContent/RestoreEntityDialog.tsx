import { useResetAtom } from "jotai/utils";
import { useParams } from "react-router-dom";

import { useUpdateEntity } from "../../../hooks";
import { AvailableEntityType } from "../../../types";
import { dialogAtom, getCharacterFullName, getSingularEntityType, IconEnum, useNotifications } from "../../../utils";
import { Button } from "../../Form";
import { Avatar } from "../../Misc";

export function RestoreEntityDialog({ data }: { data: { [key: string]: any } }) {
  const { project_id } = useParams();
  const resetDialogAtom = useResetAtom(dialogAtom);
  const createNotification = useNotifications();
  const { mutate: updateEntity } = useUpdateEntity<{ data: { id: string; deleted_at: string | null } }>(
    data?.entity_title as AvailableEntityType,
    project_id as string
  );

  return (
    <div className="flex flex-col justify-between">
      <div className="text-center text-lg">
        Are you sure you want to restore this {getSingularEntityType(data?.entity_title) || "entity"}{" "}
        {data?.is_folder ? "folder" : ""} - &quot;
        {data?.entity_title === "characters"
          ? getCharacterFullName(data?.first_name || "", data?.last_name || "")
          : data?.title}
        &quot; ?
      </div>

      <div className="mx-auto my-2 flex items-center gap-x-4">
        {data?.image && data?.project_id ? (
          <>
            <Avatar image_url={data?.image} isBordered isTooltipDisabled label="" size="2xl" />
            <span className="text-lg">{getCharacterFullName(data?.first_name || "", data?.last_name || "")}</span>
          </>
        ) : null}
      </div>

      <div className="mt-auto flex gap-x-2">
        <Button icon={IconEnum.close} label="Cancel" onClick={resetDialogAtom} />
        <Button
          icon={IconEnum.restore}
          label="Restore"
          onClick={() => {
            if (data?.id && project_id && data?.entity_title) {
              updateEntity({ data: { id: data?.id, deleted_at: null } });
              resetDialogAtom();
            } else {
              createNotification({
                title: "Could not restore entity.",
                timer: 5,
                variant: "error",
                icon: IconEnum.error,
              });
            }
          }}
          variant="success"
        />
      </div>
    </div>
  );
}
