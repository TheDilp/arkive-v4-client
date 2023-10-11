import { CharacterType } from "./characterTypes";

export interface ConversationType {
  id: string;
  title: string;
  project_id: string;
  characters: CharacterType[];
  messages: any[];
}
