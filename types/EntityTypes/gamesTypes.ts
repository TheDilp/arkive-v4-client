export type GamePlayerRoleType = "gamemaster" | "player";

export interface GameType {
  id: string;
  title: string;
  owner_id: string;
  project_id: string;
  background_image: string;
  next_session_date: string;
  description: string;
  game_players: GamePlayerType[];
}

export interface GamePlayerType {
  id: string;
  game_id: string;
  nickname: string;
  password: string;
  role: GamePlayerRoleType;
}

export type GamePermissionType = "none" | "view" | "read" | "own";
