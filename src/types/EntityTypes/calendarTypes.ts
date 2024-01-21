import { BaseEntityType } from "./baseEntityTypes";
import { DocumentType } from "./documentTypes";
import { ImageType } from "./imageTypes";
import { TagType } from "./tagTypes";

/* eslint-disable no-use-before-define */
export interface CalendarType extends BaseEntityType {
  icon: string | null;
  offset: number;
  hours?: number | null;
  minutes?: number | null;
  starts_on_day?: number | null;
  eras: EraType[];
  months: MonthType[];
  leap_days: LeapDayType[];
  days: string[];
  tags: TagType[];
}

export interface MonthType {
  id: string;
  title: string;
  days: number;
  sort: number;
  events: EventType[];
  parent_id: string;
}

export type LeapDayConditionType = "every" | "divisible_by" | "not_divisible_by";
export interface LeapDayType {
  id: string;
  parent_id: string;
  month_id: string;
  conditions: {
    and?: { type: LeapDayConditionType; value: string | number }[];
    or?: { type: LeapDayConditionType; value: string | number }[];
  };
}

export interface EraBackgroundGradientType {
  id: string;
  start_stop: number;
  end_stop: number;
  color: string;
}
export interface EraType {
  id: string;
  title: string;
  parent_id: string;
  color: string;
  start_day: number;
  start_month_id: string;
  start_month: number;
  start_year: number;
  end_day: number;
  end_month_id: string;
  end_month: number;
  end_year: number;
}

export interface EventType {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean | null;
  background_color?: string | null;
  text_color?: string | null;
  hours?: number | null;
  minutes?: number | null;
  parent_id: string;
  document_id?: string | null;
  image_id?: string | null;
  end_day?: number | null;
  start_day: number;
  start_month_id: string;
  end_month_id?: string | null;
  end_month?: number | null;
  end_year?: number | null;
  start_month: number;
  start_year: number;
  document?: DocumentType;
  image?: ImageType;
  tags: TagType[];
}

export type MonthStateType = Omit<MonthType, "parent_id" | "events">;
export type DayStateType = { id: string; title: string };
export type LeapDayStateType = LeapDayType;
export type EventStateType = Partial<EventType> & { start_month: number | undefined };

export interface CurrentDateType {
  month: number;
  year: number;
}
