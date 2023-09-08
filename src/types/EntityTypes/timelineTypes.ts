import { z } from "zod";

import { InsertTimelineSchema, UpdateTimelineSchema } from "../../validation";
import { BaseEntityType } from "./baseEntityTypes";
import { CalendarType, EventType } from "./calendarTypes";

export interface TimelineType extends BaseEntityType {
  calendars: CalendarType[];
  events?: EventType[];
}

export type TimelineStateType = Partial<Omit<TimelineType, "calendars">> & { calendars?: string[] };

export interface TimelineEventType extends EventType {
  top?: number;
}

export type InsertTimelineType = z.infer<typeof InsertTimelineSchema>;
export type UpdateTimelineType = z.infer<typeof UpdateTimelineSchema>;
