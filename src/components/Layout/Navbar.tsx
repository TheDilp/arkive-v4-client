import { useIsMutating } from "@tanstack/react-query";
import { useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import { AllAvailableEntities, WebsocketEventType } from "../../types";
import {
  DefaultTagColor,
  dialogAtom,
  drawerAtom,
  getDefaultEntityIcon,
  IconEnum,
  navbarTitleAtom,
  useNotifications,
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

export function Navbar() {
  const { project_id } = useParams();
  const isMutating = useIsMutating();
  const createNotification = useNotifications();
  const navbarTitle = useAtomValue(navbarTitleAtom);

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);

  function openSearchDrawer() {
    setDrawer((prev) => ({ ...prev, title: "Search", size: "lg", type: "search", data: null }));
  }
  function openImageUploadDialog() {
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

  const { lastJsonMessage } = useWebSocket<{ event_type: WebsocketEventType; message: string; entity: AllAvailableEntities }>(
    `ws://localhost:5174/ws/notifications/${project_id}`,
  );

  useLayoutEffect(() => {
    if (lastJsonMessage) {
      if (lastJsonMessage.event_type === "NEW_NOTIFICATION") {
        createNotification({
          icon: getDefaultEntityIcon(lastJsonMessage.entity),
          title: lastJsonMessage.message,
          variant: "info",
          timer: 5,
        });
      }
    }
  }, [lastJsonMessage]);

  return (
    <div className="flex h-16 max-h-16 min-h-[4rem] flex-1 border-b border-zinc-800 bg-zinc-900 shadow">
      {isMutating ? <IndeterminateProgressBar /> : null}
      <h1 className="flex h-full max-w-[50%] select-none items-center pl-4 font-merriweather text-3xl text-white">
        <span className="truncate">{navbarTitle || "The Arkive"}</span>
      </h1>
      {project_id ? (
        <div className="ml-auto flex items-center gap-x-2 pr-4">
          <div className="w-fit">
            <Button hasNoBackground icon={IconEnum.upload} isIconOnly onClick={openImageUploadDialog} />
          </div>
          <div className="w-fit">
            <Tooltip arrowColor="#27272a" content={<DiceRoller />} customOffset={{ mainAxis: 25, crossAxis: 50 }} isClickable>
              <div className="h-full">
                <Button hasNoBackground icon={IconEnum.d20} iconSize={24} onClick={undefined} />
              </div>
            </Tooltip>
          </div>
          <div className="w-fit">
            <div className="h-full">
              <Button hasNoBackground icon={IconEnum.search} iconSize={24} onClick={openSearchDrawer} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
