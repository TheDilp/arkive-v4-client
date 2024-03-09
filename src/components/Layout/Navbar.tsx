import { UserButton, useUser } from "@clerk/clerk-react";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import { useHasPermissions } from "../../hooks";
import { AllAvailableEntities, WebsocketEventType } from "../../types";
import {
  baseURLS,
  DefaultTagColor,
  dialogAtom,
  drawerAtom,
  getDefaultEntityIcon,
  getEntityTypeFromNotificationType,
  IconEnum,
  navbarTitleAtom,
  useNotifications,
  userAtom,
} from "../../utils";
import { Dice, DiceRollRegex, rollDiceWithNotification } from "../../utils/ui/diceRollerUtils";
import { Button, Input } from "../Form";
import { IndeterminateProgressBar } from "../Misc";
import { Tooltip } from "../Overlay";
import { Card } from "./Card";

function DiceRoller() {
  const createNotification = useNotifications();
  const [diceRoll, setDiceRoll] = useState("");
  const defaultDiceColor = ls.get("default_dice_color");
  return (
    <Card title="Roll dice">
      <div className="flex flex-col gap-y-2">
        <Input
          name="diceRoll"
          onChange={(e) => setDiceRoll(e.value as string)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              Dice.updateConfig({ themeColor: defaultDiceColor || DefaultTagColor });
              if (!diceRoll.match(DiceRollRegex)) {
                createNotification({
                  timer: 2,
                  title: "The dice roll notation is not valid.",
                  icon: IconEnum.warning,
                  variant: "error",
                  position: "top",
                });
              } else {
                await rollDiceWithNotification(createNotification, diceRoll);
              }
            }
          }}
          placeholder="E.g. d20+d4-2"
          value={diceRoll}
        />
        <Button
          icon={IconEnum.d20}
          isDisabled={!diceRoll || !diceRoll.match(DiceRollRegex)}
          isIconOnly
          label="Roll"
          onClick={async () => {
            Dice.updateConfig({ themeColor: defaultDiceColor || DefaultTagColor });
            await rollDiceWithNotification(createNotification, diceRoll);
          }}
          variant="info"
        />
      </div>
    </Card>
  );
}

export function Navbar({ isDisabled }: { isDisabled: boolean }) {
  const { project_id, subitem_id } = useParams();
  const queryClient = useQueryClient();
  const isMutating = useIsMutating();
  const createNotification = useNotifications();
  const navbarTitle = useAtomValue(navbarTitleAtom);
  const { user: authUser } = useUser();
  const permissions = useHasPermissions(["create_assets"], undefined);
  const user = useAtomValue(userAtom);

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);

  function openSearchDrawer() {
    setDrawer((prev) => ({ ...prev, title: "Search", size: "lg", type: "search", data: null }));
  }
  function openImageUploadDialog() {
    if (permissions.create_assets)
      setDialog((prev) => ({
        ...prev,
        type: "image_upload",
        title: "Upload images",
        size: "lg",
        isOverlay: true,
        data: {
          type: "images",
        },
      }));
  }

  const { lastJsonMessage } = useWebSocket<{
    event_type: WebsocketEventType;
    message: string;
    image_id?: string;
    conversation_id?: string;
    entity: AllAvailableEntities;
    userId: string;
    nickname?: string;
    userImageUrl?: string;
    notification_type: string;
  }>(`${baseURLS.baseWebsocketServer}/ws/notifications/${project_id}`, { reconnectInterval: 5000, reconnectAttempts: 10 });

  // const { lastJsonMessage: versionMessage } = useWebSocket<{
  //   timestamp: number;
  // }>(`${baseURLS.baseWebsocketServer}/ws/version`);

  useLayoutEffect(() => {
    if (lastJsonMessage && !isDisabled) {
      if (lastJsonMessage.event_type === "NEW_NOTIFICATION") {
        // Don't create a notification if this is a conversation message
        if (lastJsonMessage?.conversation_id && subitem_id && subitem_id === lastJsonMessage.conversation_id) return;
        if (authUser?.id && lastJsonMessage.userId && authUser?.id === lastJsonMessage?.userId) return;
        if (lastJsonMessage?.notification_type && user?.feature_flags?.[lastJsonMessage?.notification_type]) {
          const entityType = getEntityTypeFromNotificationType(lastJsonMessage?.notification_type);
          createNotification({
            icon: getDefaultEntityIcon(lastJsonMessage.entity),
            title: lastJsonMessage.message,
            image_id: lastJsonMessage.image_id,
            variant: "info",
            timer: 5,
            image_url: lastJsonMessage.userImageUrl,
            hasNoTruncate: true,
          });
          queryClient.invalidateQueries(["allEntities", project_id, entityType]);
        }
      } else if (lastJsonMessage.event_type === "ROLE_UPDATED") {
        queryClient.invalidateQueries(["user", project_id, authUser?.id]);
        queryClient.invalidateQueries(["allEntities", project_id]);
      }
    }
  }, [lastJsonMessage]);

  // useLayoutEffect(() => {
  //   if (versionMessage) {
  //     const currentTimestamp: number | null = ls.get("version_timestamp");
  //     const oldDate = currentTimestamp ?? null;
  //     if (!oldDate || oldDate < versionMessage.timestamp) {
  //       createNotification({
  //         title:
  //           "There's an update available for the app! Please save your progress and refresh the page to get the latest version.",
  //         timer: 600,
  //         variant: "success",
  //         icon: IconEnum.reload,
  //         hasNoTruncate: true,
  //       });
  //     }

  //     ls.set("version_timestamp", versionMessage.timestamp);
  //   }
  // }, [versionMessage]);

  return (
    <div className="flex h-16 max-h-16 min-h-[4rem] flex-1 border-b border-zinc-800 bg-zinc-900 shadow">
      {isMutating ? <IndeterminateProgressBar /> : null}
      <h1 className="flex h-full max-w-[50%] select-none items-center pl-4 font-merriweather text-2xl text-white">
        <span className="truncate">{navbarTitle || "The Arkive"}</span>
      </h1>
      <div className="ml-auto flex items-center gap-x-2 pr-4">
        {project_id && !isDisabled ? (
          <>
            {permissions?.create_assets ? (
              <div className="w-fit">
                <Button hasNoBackground icon={IconEnum.upload} isIconOnly onClick={openImageUploadDialog} />
              </div>
            ) : null}
            <div className="w-fit">
              <Tooltip arrowColor="#27272a" content={<DiceRoller />} customOffset={{ mainAxis: 25, crossAxis: 50 }} isClickable>
                <div className="h-full">
                  <Button hasNoBackground icon={IconEnum.d20} iconSize={24} isIconOnly onClick={undefined} />
                </div>
              </Tooltip>
            </div>
            <div className="w-fit">
              <div className="h-full">
                <Button hasNoBackground icon={IconEnum.search} iconSize={24} isIconOnly onClick={openSearchDrawer} />
              </div>
            </div>
          </>
        ) : null}
        <div className="ml-auto flex items-center">
          <UserButton />
        </div>
      </div>
    </div>
  );
}
