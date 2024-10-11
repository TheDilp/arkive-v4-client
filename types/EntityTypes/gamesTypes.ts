import { CharacterType } from "./characterTypes";
import { ProjectType } from "./projectTypes";

export interface GameType {
  id: string;
  title: string;
  owner_id: string;
  project_id: string;
  background_image: string;
  next_session_date: string;
  description: string;
  game_players: GamePlayerType[];
  project: ProjectType;
}

export interface GamePlayerType {
  id: string;
  game_id: string;
  nickname: string;
  password: string;
}

export type GamePermissionType = "none" | "view" | "read" | "own";

export type GameCharacterType = Pick<CharacterType, "id" | "full_name" | "portrait_id"> & {
  related_id: string;
  // Record<player_id, GamePermissionType>
  player_permissions: Record<string, GamePermissionType>;
};

export type GameJournalEntryType = {
  id: string;
  title: string;
  game_id: string;
  characters: GameJournalEntryEntityType[];
  blueprint_instances: GameJournalEntryEntityType[];
  documents: GameJournalEntryEntityType[];
  maps: GameJournalEntryEntityType[];
  map_pins: GameJournalEntryEntityType[];
  graphs: GameJournalEntryEntityType[];
  events: GameJournalEntryEntityType[];
  images: GameJournalEntryEntityType[];
};

export type GameJournalEntryEntityType = {
  id: string;
  title: string;
  image_id?: string | null;
  related_id: string;
  type: GameJournalEntryEntityTypes;
  sort: number;
};

export type GameJournalEntryEntityTypes =
  | "characters"
  | "blueprint_instances"
  | "documents"
  | "maps"
  | "graphs"
  | "events"
  | "images";
