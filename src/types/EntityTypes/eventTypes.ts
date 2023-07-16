export interface EventType {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  background_color: string | null;
  text_color: string | null;
  year: number;
  day: number;
  hours: number | null;
  minutes: number | null;
  calendar_id: string | null;
  document_id: string | null;
  month_id: string;
  image_id: string | null;
}
