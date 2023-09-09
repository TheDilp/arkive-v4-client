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
  months: MonthType[];
  days: string[];
  tags: TagType[];
}

export type MonthType = {
  id: string;
  title: string;
  days: number;
  sort: number;
  events: EventType[];
  parent_id: string;
};

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
export type EventStateType = Partial<Omit<EventType, "document">> & { start_month: number };
export interface CurrentDateType {
  month: number;
  year: number;
}
