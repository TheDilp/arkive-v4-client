import { createColumnHelper } from "@tanstack/react-table";
import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch, useState } from "react";
import { useParams } from "react-router-dom";
import { capitalize } from "remirror";

import { Avatar, Button, Dropdown, Skeleton, Table, Tabs } from "../../../../components";
import { useBreakpoint, useGetEntity, useTable } from "../../../../hooks";
import { DialogAtomType, GamePlayerType, GameRoleType, GameType, TabType } from "../../../../types";
import { dialogAtom, getFirstLetters, IconEnum } from "../../../../utils";

const rolesColumnHelper = createColumnHelper<GamePlayerType>();

const roles = [
  { id: "gamemaster", title: "Gamemaster" },
  { id: "player", title: "Player" },
];

function playersColumns(setDialog: Dispatch<SetStateAction<DialogAtomType>>) {
  return [
    rolesColumnHelper.display({
      id: "nickname",
      header: "Nickname",
      cell: ({ row }) => row.original.nickname,
      maxSize: 20,
    }),

    rolesColumnHelper.display({
      id: "role",
      header: "Role",
      cell: ({ getValue }) => <div>{capitalize(getValue() as GameRoleType)}</div>,
      maxSize: 2,
      size: 2,
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
      cell: () => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "assign_role",
                title: "Assign role",
                icon: IconEnum.permissions,
                subItems: roles.map((role) => ({
                  id: role.id,
                  title: role.title,
                  onClick: () => {},
                })),
              },
              {
                id: "remove_member",
                title: "Remove player from game",
                icon: IconEnum.user_remove,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    title: "Are you sure you wish to remove this member from this project?",
                    cancel: { action: () => {} },
                    isOverlay: true,
                    confirm: {
                      variant: "info-bordered",
                      action: () => {},
                    },
                    size: "sm",
                  }));
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
    }),
  ];
}
const tabs: TabType[] = [
  { id: "game_settings", label: "Game settings", icon: IconEnum.settings, isOwner: true },
  { id: "players", label: "Players", icon: IconEnum.user, isOwner: true },
];

export function GameSettings() {
  const { game_id } = useParams();
  const { isLg } = useBreakpoint();
  const setDialog = useSetAtom(dialogAtom);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [game, setGame] = useState<GameType | null>();
  const [, dispatch] = useTable({});
  const [selectedTab, setSelectedTab] = useState(0);
  const { data: gameData, isLoading } = useGetEntity<GameType>(
    game_id as string,
    "games",
    {
      fields: ["id", "title", "background_image", "next_session_date", "owner_id", "project_id"],
    },
    {
      queryKeyConcat: ["settings"],
    }
  );

  return (
    <div className="h-full p-4">
      <div className="flex h-full min-h-full flex-col gap-y-2">
        <div className="w-full flex-1 content-start gap-4 pt-0 lg:grid lg:grid-cols-5 lg:content-stretch">
          {isLoading ? <Skeleton type="character_profile" /> : null}
          {!isLoading && isLg ? (
            <div className="flex flex-col items-center gap-y-2 rounded-lg bg-zinc-800 p-4 lg:col-span-1">
              <Avatar
                hasShowImage
                image_id={gameData?.data?.background_image}
                initials={getFirstLetters(gameData?.data?.title as string)}
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
            <div className="h-full">
              <div className="h-fit w-full">
                <Table
                  columns={playersColumns(setDialog)}
                  data={gameData?.data?.game_players || []}
                  dispatch={dispatch}
                  type="character_relationship_types"
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
