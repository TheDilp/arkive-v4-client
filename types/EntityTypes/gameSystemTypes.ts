import { JsonObject } from "remirror";

export interface GameSystem {
  id: string;
  title: string;
  code: string;
  configuration: JsonObject;
}
