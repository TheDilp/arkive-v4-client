import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetEntities, useGetEntity, useHandleChange } from "../../../hooks";
import { CalendarType } from "../../../types";
import { InsertTimelineType, TimelineStateType } from "../../../types/EntityTypes/timelineTypes";
import { IconEnum } from "../../../utils";
import { InsertTimelineSchema } from "../../../validation";
import { Button, Input, Select } from "../../Form";
import { Skeleton } from "../../Misc";

type Props = {
  data: { id?: string };
};

export default function TimelineDrawer({ data }: Props) {
  const { project_id } = useParams();

  const { data: existingTimeline, isFetching: isFetchingTimeline } = useGetEntity<TimelineStateType>(
    data?.id,
    "timelines",
    { data: {}, fields: ["id"] },
    { enabled: !!data?.id },
  );
  const { data: existingCalenders, isFetching: isFetchingCalendars } = useGetEntities<CalendarType>(
    { data: { project_id }, fields: ["id"] },
    "calendars",
  );

  const { mutateAsync: createTimeline } = useCreateEntity<InsertTimelineType>("timelines");

  const [timeline, setTimeline] = useState<TimelineStateType>({ project_id });

  const { handleChange } = useHandleChange({ data: timeline, setData: setTimeline });

  async function handleSave() {
    if (!data?.id) {
      const parsedData = InsertTimelineSchema.parse({
        data: timeline,
        relations: { calendars: timeline.calendars?.map((id) => ({ id })) },
      });
      await createTimeline(parsedData);
    }
  }

  useLayoutEffect(() => {
    if (existingTimeline?.data) setTimeline(existingTimeline?.data);
  }, [existingTimeline]);

  if (isFetchingTimeline || isFetchingCalendars) return <Skeleton type="drawer_form" />;

  return (
    <div className="flex flex-col gap-y-2">
      <Input
        label="Title (required)"
        name="title"
        onChange={handleChange}
        placeholder="Main timeline"
        value={timeline.title || ""}
      />

      <div>
        <Select
          isDisabled={isFetchingCalendars}
          isLoading={isFetchingCalendars}
          isMultiple
          label="Calendars to display (required)"
          name="calendars"
          onChange={handleChange}
          options={existingCalenders?.data?.map((cal) => ({ label: cal.title, value: cal.id })) || []}
          value={timeline.calendars || []}
        />
      </div>

      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        label={data?.id ? "Update" : "Create"}
        onClick={handleSave}
        variant="success"
      />
    </div>
  );
}
