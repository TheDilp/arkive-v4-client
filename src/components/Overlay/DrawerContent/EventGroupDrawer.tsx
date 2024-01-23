import { useQueryClient } from "@tanstack/react-query";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntity, useHandleChange } from "../../../hooks";
import { EventGroupType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { InsertEventGroupSchema } from "../../../validation";
import { Button, Input } from "../../Form";
import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    id?: string | undefined;
  };
};

export function EventGroupDrawer({ data }: Props) {
  const { project_id } = useParams();
  const client = useQueryClient();
  const resetDrawer = useResetAtom(drawerAtom);
  const [eventGroup, setEventGroup] = useState<Partial<EventGroupType>>({ project_id });
  const { handleChange } = useHandleChange({ data: eventGroup, setData: setEventGroup });
  const { mutateAsync: create } = useCreateEntity<{ data: { title: string; project_id: string } }>("event_groups");
  async function handleSave() {
    if (data?.id) {
      //
    } else {
      const parsedData = InsertEventGroupSchema.parse({ data: eventGroup });
      await create(parsedData);
    }
    client.invalidateQueries(["projects", project_id, "settings"]);
    resetDrawer();
  }
  const { data: existingEventGroup } = useGetEntity<EventGroupType>(
    data?.id,
    "event_groups",
    { data: { id: data?.id }, fields: ["id", "title"] },
    {
      enabled: !!data.id,
    },
  );

  useLayoutEffect(() => {
    if (existingEventGroup?.data) {
      setEventGroup(existingEventGroup?.data);
    }
  }, [existingEventGroup]);

  return (
    <DrawerLayout>
      <div>
        <Input
          label="Event group title (required)"
          name="title"
          onChange={handleChange}
          placeholder="Enter title"
          value={eventGroup?.title || ""}
        />
      </div>
      <div>
        <Button
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={!eventGroup.title}
          label={data?.id ? "Update" : "Create"}
          onClick={handleSave}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
