import { RemirrorJSON } from "remirror";

import { CharacterType } from "./characterTypes";

export type MessageKindType = "character" | "narration" | "place";
export type MessagePlaceContentType = {
  id: string;
  title: string;
  image_id?: string;
  icon?: string;
  parent_id?: string;
};

export type MessageType = {
  id: string;
  created_at?: string;
  parent_id: string;
  sender_id?: string;
  character?: CharacterType;
} & (
  | {
      type: "character" | "narration";
      content: RemirrorJSON;
    }
  | {
      type: "place";
      content: MessagePlaceContentType;
    }
);
