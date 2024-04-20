import { AvailableIcons } from "../../utils";
import { BlueprintInstanceType } from "./blueprintInstanceTypes";
import { BlueprintType } from "./blueprintTypes";
import { EventType } from "./calendarTypes";
import { CharacterType } from "./characterTypes";
import { DocumentType } from "./documentTypes";
import { ImageType } from "./imageTypes";
import { MapPinType } from "./mapTypes";

export type AnswerValueType = string | number | boolean | (string | number | boolean)[] | null;

export type AnswerType =
  | {
      id: string;
      parent_id: string;
      value: AnswerValueType;

      characters: Pick<CharacterType, "id" | "full_name" | "portrait_id" | "project_id">[];
      blueprint_instances: (Pick<BlueprintInstanceType, "id" | "title" | "parent_id"> & { icon: string; project_id: string })[];
      documents: Pick<DocumentType, "id" | "title" | "icon" | "project_id">[];
      map_pins: (Pick<MapPinType, "id" | "title" | "icon" | "parent_id"> & { project_id: string })[];
      images: Pick<ImageType, "id" | "title" | "project_id">[];
      events: (Pick<EventType, "id" | "title" | "parent_id"> & { project_id: string })[];
      icon: string | null;
    } & (
      | {
          character_id: string;
          blueprint_instance_id: null;
        }
      | {
          character_id: null;
          blueprint_instance_id: string;
        }
    );
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
    | "documents_single"
    | "documents_multiple"
    | "blueprints_single"
    | "blueprints_multiple"
    | "events_single"
    | "events_multiple"
    | "locations_single"
    | "locations_multiple"
    | "images_single"
    | "images_multiple";
  answers?: Pick<AnswerType, "id" | "value" | "parent_id" | "character_id" | "blueprint_instance_id">[];
};

export type QuestionnaireType = {
  id: string;
  title: string;
  owner_id: string;
  icon?: AvailableIcons;
  questions: QuestionType[];
  characters: {
    id: string;
    full_name: string;
    project_id: string;
    portrait_id?: string;
  }[];
  blueprint_instances: {
    id: string;
    title: string;
    project_id: string;
    icon?: string;
  }[];
};

export type EntityQuestionnaireType = { questions: (QuestionType & { answer: AnswerType })[] };
