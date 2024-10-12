import { UserType } from "../userTypes";
import { BlueprintInstanceType } from "./blueprintInstanceTypes";
import { CalendarType, EventType } from "./calendarTypes";
import { CharacterRelationshipType } from "./characterRelationshipTypes";
import { CharacterType } from "./characterTypes";
import { DictionaryType } from "./dictionaryTypes";
import { DocumentType } from "./documentTypes";
import { GameSystemType } from "./gameSystemTypes";
import { GraphType } from "./graphTypes";
import { ImageType } from "./imageTypes";
import { MapPinTypesType, MapType } from "./mapTypes";
import { RoleType } from "./rolesTypes";

export interface ProjectType {
  id: string;
  title: string;
  description: string | null;
  owner_id: string;
  is_public: boolean | null;
  image_id: string | null;
  owner?: UserType;
  images?: ImageType[];
  character_relationship_types?: CharacterRelationshipType[];
  map_pin_types?: MapPinTypesType[];
  members: UserType[];
  roles: RoleType[];
  feature_flags?: Record<string, boolean> | null;
  game_system_id: string | null;
  game_system?: GameSystemType;
}

export type ProjectDashboardType = [
  { name: "characters"; result: (Pick<CharacterType, "id" | "portrait_id"> & { title: string })[] },
  { name: "blueprint_instances"; result: Pick<BlueprintInstanceType, "id" | "title" | "parent_id">[] },
  { name: "documents"; result: Pick<DocumentType, "id" | "title" | "icon">[] },
  { name: "maps"; result: Pick<MapType, "id" | "title">[] },
  { name: "graphs"; result: Pick<GraphType, "id" | "title">[] },
  { name: "calendars"; result: Pick<CalendarType, "id" | "title">[] },
  { name: "events"; result: Pick<EventType, "id" | "title" | "parent_id">[] },
  { name: "dictionaries"; result: Pick<DictionaryType, "id" | "title">[] },
];
