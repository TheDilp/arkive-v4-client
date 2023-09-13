export interface WordType {
  id: string;
  title: string;
  translation: string;
  parent_id: string;
  description?: string;
}

export type WordStateType = Partial<WordType>;
