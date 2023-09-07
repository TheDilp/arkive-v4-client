import { TagType } from "./tagTypes";

/* eslint-disable no-use-before-define */
export interface CalendarType {
  id: string;
  title: string;
  project_id: string;
  parent_id?: string | null;
  icon: string | null;
  is_folder?: boolean | null;
  is_public?: boolean | null;
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
  description?: string;
  backgroundImage?: string;

  textColor: string;
  backgroundColor?: string;

  documentsId?: string;
  document?: DocumentType;

  year: number;
  month: MonthType;
  day: number;
  hours?: number;
  minutes?: number;

  isPublic: boolean;

  erasId: string;
  monthsId: string | null;
  calendarsId: string | null;

  tags: TagType[];
}

export interface CurrentDateType {
  month: number;
  year: number;
}
