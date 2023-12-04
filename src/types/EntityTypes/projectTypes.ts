import { UserType } from "../userTypes";
import { BlueprintInstanceType } from "./blueprintInstanceTypes";
import { BlueprintType } from "./blueprintTypes";
import { CalendarType, EventType } from "./calendarTypes";
import { CharacterRelationshipType } from "./characterRelationshipTypes";
import { CharacterType } from "./characterTypes";
import { ConversationType } from "./conversationTypes";
import { DictionaryType } from "./dictionaryTypes";
import { DocumentType } from "./documentTypes";
import { GraphType } from "./graphTypes";
import { ImageType } from "./imageTypes";
import { MapType } from "./mapTypes";
import { RandomTableType } from "./randomTableTypes";

export interface ProjectType {
  id: string;
  title: string;
  owner_id: string;
  image_id: string | null;
  images?: ImageType[];
  default_dice_color?: string;
  // show_image_folder_view?: boolean;
  // show_image_table_view?: boolean;
  character_relationship_types?: CharacterRelationshipType[];
  members: UserType[];
}

export type ProjectDashboardType = [
  { name: "characters"; result: (Pick<CharacterType, "id" | "portrait_id"> & { title: string })[] },
  { name: "blueprints"; result: Pick<BlueprintType, "id" | "title" | "icon">[] },
  { name: "blueprint_instances"; result: Pick<BlueprintInstanceType, "id" | "title" | "parent_id">[] },
  { name: "documents"; result: Pick<DocumentType, "id" | "title" | "icon">[] },
  { name: "maps"; result: Pick<MapType, "id" | "title">[] },
  { name: "graphs"; result: Pick<GraphType, "id" | "title">[] },
  { name: "calendars"; result: Pick<CalendarType, "id" | "title">[] },
  { name: "events"; result: Pick<EventType, "id" | "title" | "parent_id">[] },
  { name: "random_tables"; result: Pick<RandomTableType, "id" | "title" | "parent_id">[] },
  { name: "conversations"; result: Pick<ConversationType, "id" | "title">[] },
  { name: "dictionaries"; result: Pick<DictionaryType, "id" | "title">[] },
];
