import { RemirrorJSON } from "remirror";

import { CharacterType } from "./characterTypes";

export type MessageKindType = "character" | "narration" | "place";
export interface MessageType {
  id: string;
  parent_id: string;
  content: RemirrorJSON;
  sender_id?: string;
  type: MessageKindType;
  character?: CharacterType;
}
