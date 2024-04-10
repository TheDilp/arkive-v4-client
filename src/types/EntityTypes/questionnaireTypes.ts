import { AvailableIcons } from "../../utils";
import { BlueprintType } from "./blueprintTypes";

export type AnswerType =
  | ({
      id: string;
      parent_id: string;
      value: string | null;
      icon: string | null;
    } & {
      character_id: string;
      blueprint_instance_id: null;
    })
  | {
      character_id: null;
      blueprint_instance_id: string;
    };
export type QuestionType = {
  id: string;
  parent_id: string;
  title: string;
  options: { id: string; value: string }[];
  blueprint_id: string | null;
  blueprint?: BlueprintType;
  sort: number;
  type:
    | "text"
    | "number"
    | "boolean"
    | "select_single"
    | "select_multiple"
    | "characters_single"
    | "characters_multiple"
    | "blueprints_single"
    | "blueprints_multiple"
    | "events_single"
    | "events_multiple"
    | "locations_single"
    | "locations_multiple";
};

export type QuestionnaireType = {
  id: string;
  title: string;
  user_id: string;
  icon?: AvailableIcons;
  questions: QuestionType[];
};
