import { UserButton, useUser } from "@clerk/clerk-react";
import { useIsMutating, useQueryClient } from "@tanstack/react-query";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import { useHasPermissions } from "../../hooks";
import {
  AllAvailableEntities,
  DrawerAtomType,
  DropdownItemType,
  UserHasPermissionsType,
  WebsocketEventType,
} from "../../types";
import {
  baseURLS,
  DefaultTagColor,
  dialogAtom,
  drawerAtom,
  getDefaultEntityIcon,
  getEntityTypeFromNotificationType,
  IconEnum,
  navbarTitleAtom,
  projectFeatureFlagsAtom,
  useNotifications,
  userAtom,
} from "../../utils";
import { Dice, DiceRollRegex, rollDiceWithNotification } from "../../utils/ui/diceRollerUtils";
import { Button, Input } from "../Form";
import { IndeterminateProgressBar } from "../Misc";
import { Dropdown, Tooltip } from "../Overlay";
import { Card } from "./Card";

function createNewOptions(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  project_id: string,
  permissions: UserHasPermissionsType,
): DropdownItemType[] {
  const options: DropdownItemType[] = [];

  if (permissions.create_characters)
    options.push({
      id: "character",
      title: "Character",
      icon: IconEnum.character,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: { project_id },
          title: "Create new character",
          type: "characters",
          size: "2xl",
        })),
    });

  if (permissions.create_blueprints)
    options.push({
      id: "blueprints",
      title: "Blueprint",
      icon: IconEnum.blueprint,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: { project_id },
          title: "Create new blueprint",
          type: "blueprints",
          size: "lg",
        })),
    });

  if (permissions.create_blueprint_instances)
    options.push({
      id: "blueprint_instances",
      title: "Blueprint instances",
      icon: IconEnum.blueprint,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: {},
          exceptions: { globalCreate: true },
          title: "Create new blueprint instance",
          type: "blueprint_instances",
          size: "lg",
        })),
    });

  if (permissions.create_documents)
    options.push({
      id: "documents",
      title: "Document",
      icon: IconEnum.document,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: { project_id },
          title: "Create new document",
          type: "documents",
          size: "lg",
          exceptions: { globalCreate: true },
        })),
    });

  if (permissions.create_maps)
    options.push({
      id: "maps",
      title: "Map",
      icon: IconEnum.map,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: { project_id },
          title: "Create new map",
          type: "maps",
          size: "lg",
        })),
    });
  if (permissions.create_graphs)
    options.push({
      id: "graphs",
      title: "Graph",
      icon: IconEnum.graph,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: { project_id },
          title: "Create new graph",
          type: "graphs",
          size: "lg",
        })),
    });

  if (permissions.create_calendars)
    options.push({
      id: "calendars",
      title: "Calendar",
      icon: IconEnum.calendar,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: { project_id },
          title: "Create new calendar",
          type: "calendars",
          size: "lg",
        })),
    });

  if (permissions.create_events)
    options.push({
      id: "event",
      title: "Event",
      icon: IconEnum.event,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: {},
          title: "Create new event",
          type: "events",
          size: "lg",
          exceptions: { globalCreate: true },
        })),
    });

  if (permissions.create_dictionaries)
    options.push({
      id: "dictionaries",
      title: "Dictionary",
      icon: IconEnum.dictionary,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: { project_id },
          title: "Create new dictionary",
          type: "dictionaries",
          size: "lg",
          exceptions: { globalCreate: true },
        })),
    });
  if (permissions.create_words)
    options.push({
      id: "words",
      title: "Word",
      icon: IconEnum.word,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: {},
          title: "Create new word",
          type: "words",
          size: "lg",
          exceptions: { globalCreate: true },
        })),
    });
  if (permissions.create_random_tables)
    options.push({
      id: "random_tables",
      title: "Random table",
      icon: IconEnum.random_table,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: {},
          title: "Create new random table",
          type: "random_tables",
          size: "lg",
          exceptions: { globalCreate: true },
        })),
    });

  if (permissions.create_tags)
    options.push({
      id: "tags",
      title: "Tags",
      icon: IconEnum.tags,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: { project_id },
          title: "Create new tag",
          type: "tags",
          size: "lg",
        })),
    });
  if (permissions.create_character_fields_templates)
    options.push({
      id: "character_field_templates",
      title: "Character field template",
      icon: IconEnum.additional_fields,
      onClick: () =>
        setDrawer((prev) => ({
          ...prev,
          data: { project_id },
          title: "Create new field template",
          type: "character_fields_templates",
          size: "lg",
        })),
    });

  return options;
}

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
  const permissions = useHasPermissions(
    [
      "create_characters",
      "create_blueprints",
      "create_blueprint_instances",
      "create_documents",
      "create_maps",
      "create_graphs",
      "create_calendars",
      "create_events",
      "create_dictionaries",
      "create_words",
      "create_tags",
      "create_random_tables",
      "create_character_fields_templates",
      "create_assets",
    ],
    undefined,
  );
  const user = useAtomValue(userAtom);
  const featureFlags = useAtomValue(projectFeatureFlagsAtom);

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
    entity_id?: string;
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
        if (lastJsonMessage?.notification_type) {
          const entityType = getEntityTypeFromNotificationType(lastJsonMessage?.notification_type);
          queryClient.invalidateQueries(["allEntities", project_id, entityType]);
          if (
            (lastJsonMessage?.notification_type === `${entityType}_arkive_notification` &&
              featureFlags?.[`${entityType}_delete_notification`]) ||
            featureFlags?.[lastJsonMessage?.notification_type]
          ) {
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
        }
      } else if (lastJsonMessage.event_type === "ROLE_UPDATED") {
        if (!!lastJsonMessage?.entity_id && user?.role?.id === lastJsonMessage?.entity_id) {
          createNotification({
            icon: getDefaultEntityIcon(lastJsonMessage.entity),
            title: "Your role's permissions have been updated by the project's owner.",
            variant: "info",
            timer: 5,
            hasNoTruncate: true,
          });
        }
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
              <>
                <div className="w-fit">
                  <Dropdown
                    allowedPlacements={["left", "left-end", "left-start"]}
                    items={createNewOptions(setDrawer, project_id, permissions)}>
                    <Button hasNoBackground icon={IconEnum.add} isIconOnly onClick={undefined} tooltip="Create new entity" />
                  </Dropdown>
                </div>
                <div className="w-fit">
                  <Button hasNoBackground icon={IconEnum.upload} isIconOnly onClick={openImageUploadDialog} />
                </div>
              </>
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
