import { useQueryClient } from "@tanstack/react-query";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useDeleteMany, useGetEntities, useHandleChange, useToggledResetAtom, useUpdateManySubEntities } from "../../../hooks";
import { CurrentDateType, EventType } from "../../../types";
import { DefaultTagColor, IconEnum } from "../../../utils";
import { Button, Input } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { ColorPicker } from "..";

type Props = {
  data: {
    date: CurrentDateType;
    event_ids: string[];
  };
};

export function EventManagementDrawer({ data }: Props) {
  const { project_id, item_id } = useParams();
  const resetDrawer = useToggledResetAtom();
  const queryClient = useQueryClient();
  const { data: events } = useGetEntities<EventType>(
    {
      fields: ["id", "title", "background_color"],
      filters: {
        and: [
          {
            field: "id",
            operator: "in",
            value: data.event_ids,
            header_name: "Events",
            id: "events",
          },
        ],
      },
    },
    "events",
  );

  const [updatedEvents, setUpdatedEvents] = useState<EventType[]>([]);

  const { mutateAsync: deleteMany, isLoading: isDeletingMany } = useDeleteMany("events", false, project_id as string);
  const { mutateAsync: updateMany, isLoading: isUpdatingMany } = useUpdateManySubEntities("events");

  async function handleSave() {
    const updatedEventIds = (updatedEvents || []).map((e) => e.id);
    const toDelete = (events?.data || []).filter((e) => !updatedEventIds.includes(e.id));

    if (toDelete.length) await deleteMany({ data: { ids: toDelete.map((e) => e.id) } });
    await updateMany({
      data: updatedEvents.map((e) => ({ data: { id: e.id, title: e.title, background_color: e.background_color } })),
    });
    queryClient.invalidateQueries(["allEntities", project_id, item_id, "events", "calendar", data.date]);
    resetDrawer();
  }

  useLayoutEffect(() => {
    if (events?.data.length) {
      setUpdatedEvents(events.data);
    }
  }, [events]);

  const { handleChange } = useHandleChange({ data: updatedEvents, setData: setUpdatedEvents });

  return (
    <DrawerLayout>
      {updatedEvents.map((e, i) => (
        <div key={e.id} className="flex items-center gap-x-2">
          <div className="flex-1">
            <Input name={`[${i}].title`} onChange={handleChange} value={e.title} />
          </div>
          <div>
            <ColorPicker
              name={`[${i}].background_color`}
              onChange={handleChange}
              value={e.background_color || DefaultTagColor}
            />
          </div>
          <div>
            <Button
              hasNoBackground
              icon={IconEnum.trash}
              isIconOnly
              onClick={() => setUpdatedEvents((prev) => prev.filter((evt) => evt.id !== e.id))}
              variant="error"
            />
          </div>
        </div>
      ))}
      <div>
        <Button
          icon={IconEnum.save}
          isDisabled={isDeletingMany || isUpdatingMany}
          isLoading={isDeletingMany || isUpdatingMany}
          label="Save"
          onClick={handleSave}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
