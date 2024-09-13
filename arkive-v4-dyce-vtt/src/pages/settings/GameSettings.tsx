import { createColumnHelper } from "@tanstack/react-table";
import { useSetAtom } from "jotai";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { capitalize } from "remirror";

import { Avatar, Button, Dropdown, Skeleton, Table, Tabs } from "../../../../components";
import { useBreakpoint, useGetEntity, useRemovePlayer, useTable } from "../../../../hooks";
import { GamePlayerType, GameType, TabType } from "../../../../types";
import { dialogAtom, drawerAtom, getFirstLetters, IconEnum } from "../../../../utils";

const rolesColumnHelper = createColumnHelper<GamePlayerType>();

function PlayersTableActions({ id, game_id }: Pick<GamePlayerType, "id" | "game_id">) {
  const setDialog = useSetAtom(dialogAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const { mutate } = useRemovePlayer(id);
  return (
    <div className="flex items-center justify-center">
      <Dropdown
        allowedPlacements={["left", "left-start", "left-end"]}
        items={[
          {
            id: "edit_player",
            title: "Edit player",
            icon: IconEnum.edit,
            onClick: () => {
              setDrawer((prev) => ({
                ...prev,
                title: "Edit player",
                data: { id, game_id },
                type: "players",
              }));
            },
          },
          {
            id: "remove_member",
            title: "Remove player from game",
            icon: IconEnum.user_remove,
            onClick: () => {
              setDialog((prev) => ({
                ...prev,
                title: "Are you sure you wish to remove this player from this game?",
                cancel: { action: () => {} },
                isOverlay: true,
                confirm: {
                  variant: "error-bordered",
                  action: mutate,
                },
                size: "sm",
              }));
            },
          },
        ]}>
        <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
      </Dropdown>
    </div>
  );
}
const playersColumns = [
  rolesColumnHelper.display({
    id: "nickname",
    header: "Nickname",
    cell: ({ row }) => row.original.nickname,
  }),

  rolesColumnHelper.display({
    id: "role",
    header: "Role",
    cell: ({ row }) => <div>{capitalize(row.original.role)}</div>,
    maxSize: 4,
    size: 4,
    meta: {
      centered: true,
    },
  }),
  rolesColumnHelper.display({
    id: "action",
    header: "Actions",
    meta: {
      centered: true,
    },
    cell: ({ row }) => <PlayersTableActions game_id={row.original.game_id} id={row.original.id} />,
  }),
];
const tabs: TabType[] = [
  { id: "game_settings", label: "Game settings", icon: IconEnum.settings, isOwner: true },
  { id: "players", label: "Players", icon: IconEnum.user, isOwner: true },
];

export function GameSettings() {
  const { game_id } = useParams();
  const { isLg } = useBreakpoint();
  const setDrawer = useSetAtom(drawerAtom);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [game, setGame] = useState<GameType | null>();
  const [, dispatch] = useTable({});
  const [selectedTab, setSelectedTab] = useState(0);
  const { data: gameData, isLoading } = useGetEntity<GameType>(
    game_id as string,
    "games",
    {
      fields: ["id", "title", "background_image", "next_session_date", "owner_id", "project_id"],
      relations: {
        game_players: true,
      },
    },
    {
      queryKeyConcat: ["settings"],
    }
  );

  return (
    <div className="flex h-full max-h-[95%] w-full flex-col gap-y-2 overflow-hidden p-4">
      <div className="w-full flex-1 content-start gap-4 pt-0 lg:grid lg:grid-cols-5 lg:content-stretch">
        {isLoading ? <Skeleton type="character_profile" /> : null}
        {!isLoading && isLg ? (
          <div className="flex flex-col items-center gap-y-2 rounded-lg bg-zinc-800 p-4 lg:col-span-1">
            <Avatar
              hasShowImage
              image_id={gameData?.data?.background_image}
              initials={getFirstLetters(gameData?.data?.title || "")}
              isTooltipDisabled
              size="4xl"
            />

            <div className="mt-2 flex flex-col gap-y-1">
              <h2 className="text-center font-merriweather text-lg">{`${gameData?.data?.title || ""}`.trimEnd()}</h2>
            </div>

            <div className="w-full">
              <Tabs isVertical onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
            </div>
          </div>
        ) : null}
        {!isLoading && !isLg ? (
          <div className="w-full">
            <Tabs hasArrowNav onChange={(_, index) => setSelectedTab(index)} selectedTab={selectedTab} tabs={tabs} />
          </div>
        ) : null}
        {tabs?.[selectedTab]?.id === "players" ? (
          <div className="flex flex-col gap-y-2 lg:col-span-4">
            <div className="w-fit self-end">
              <Button
                icon={IconEnum.user_invite}
                label="Add new player"
                onClick={() =>
                  setDrawer((prev) => ({
                    ...prev,
                    title: "Add player",
                    data: { game_id: game_id as string },
                    type: "players",
                  }))
                }
                size="xs"
                variant="info"
              />
            </div>
            <Table
              columns={playersColumns}
              data={gameData?.data?.game_players || []}
              dispatch={dispatch}
              type="character_relationship_types"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
