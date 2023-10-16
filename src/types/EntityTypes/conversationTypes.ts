import { CharacterType } from "./characterTypes";
import { MessageType } from "./messageTypes";

export interface ConversationType {
  id: string;
  title: string;
  project_id: string;
  characters: Pick<CharacterType, "id" | "first_name" | "last_name" | "portrait_id">[];
  messages: MessageType[];
}
