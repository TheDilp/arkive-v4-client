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
}

export type MonthType = {
  id: string;
  title: string;
  days: number;
  sort: number;
  events: EventType[];
  parentId: string;
};

export interface EventType {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  background_color?: string | null;
  text_color?: string | null;
  hours?: number | null;
  minutes?: number | null;
  calendar_id: string | null;
  document_id?: string | null;
  image_id?: string | null;
  endDay?: number | null;
  startDay: number;
  endMonth?: number | null;
  endYear?: number | null;
  startMonth: number;
  startYear: number;

  document?: DocumentType;
  image?: ImageType;
  tags: TagType[];
}

export type EventStateType = Partial<Omit<EventType, "document">> & { startMonth: number };

export interface CurrentDateType {
  month: number;
  year: number;
}
