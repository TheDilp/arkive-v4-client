import { JsonObject } from "remirror";

export interface GameSystemType {
  id: string;
  title: string;
  code: string;
  configuration: JsonObject;
}
