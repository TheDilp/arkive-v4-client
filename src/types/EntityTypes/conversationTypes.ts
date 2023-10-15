import { RemirrorJSON } from "remirror";

import { CharacterType } from "./characterTypes";

export type MessageKindType = "character" | "narration" | "place";
export interface MessageType {
  id: string;
  content: RemirrorJSON;
  sender_id?: string;
  type: MessageKindType;
}

export interface ConversationType {
  id: string;
  title: string;
  project_id: string;
  characters: Pick<CharacterType, "id" | "first_name" | "last_name" | "portrait_id">[];
  messages: MessageType[];
}
