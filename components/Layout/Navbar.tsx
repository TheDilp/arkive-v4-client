import { useIsFetching, useIsMutating, useQueryClient } from "@tanstack/react-query";
import { SetStateAction, useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { Dispatch, useLayoutEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useWebSocket from "react-use-websocket";

import { useBreakpoint, useGetNotifications, useHasPermissions, useReadNotification, useSignout } from "../../hooks";
import {
  AllAvailableEntities,
  DrawerAtomType,
  DropdownItemType,
  NotificationEntityType,
  UserHasPermissionsType,
  WebsocketEventType,
} from "../../types";
import {
  baseURLS,
  DefaultTagColor,
  dialogAtom,
  drawerAtom,
  getDefaultEntityIcon,
  getEntityLink,
  getEntityTypeFromNotificationType,
  getSingularEntityType,
  historyAtom,
  IconEnum,
  navbarTitleAtom,
  projectFeatureFlagsAtom,
  useNotifications,
  userAtom,
  userStatusAtom,
} from "../../utils";
import { Dice, DiceRollRegex, rollDiceWithNotification } from "../../utils/ui/diceRollerUtils";
import { Button, Input } from "../Form";
import { Alert, Avatar, Icon, IndeterminateProgressBar } from "../Misc";
import { Dropdown, Tooltip } from "../Overlay";
import { Card } from "./Card";

function accountItems(signOut: () => void, navigate: (path: string) => void): DropdownItemType[] {
  return [
    { id: "user_profile", title: "User profile", icon: IconEnum.user, onClick: () => navigate("/user_settings/profile") },
    {
      id: "user_feature_flags",
      title: "User feature flags",
      icon: IconEnum.feature_flag,
      onClick: () => navigate("/user_settings/feature_flags"),
    },
    {
      id: "user_webhooks",
      title: "User webhooks",
      icon: IconEnum.webhooks,
      onClick: () => navigate("/user_settings/webhooks"),
    },
    { id: "sign_out", title: "Sign out", icon: IconEnum.logout, onClick: signOut },
  ];
}

function createNewOptions(
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
  project_id: string,
  permissions: UserHasPermissionsType
): DropdownItemType[] {
  const options: DropdownItemType[] = [];

  if (permissions.create_characters) {
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
  }

  if (permissions.create_blueprints) {
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
  }

  if (permissions.create_blueprint_instances) {
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
  }

  if (permissions.create_documents) {
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
  }

  if (permissions.create_maps) {
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
  }
  if (permissions.create_graphs) {
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
  }

  if (permissions.create_calendars) {
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
  }

  if (permissions.create_events) {
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
  }

  if (permissions.create_dictionaries) {
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
  }
  if (permissions.create_words) {
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
  }
  if (permissions.create_random_tables) {
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
  }

  if (permissions.create_tags) {
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
  }
  if (permissions.create_character_fields_templates) {
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
  }

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
              Dice.updateConfig({
                themeColor: defaultDiceColor || DefaultTagColor,
              });
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
            Dice.updateConfig({
              themeColor: defaultDiceColor || DefaultTagColor,
            });
            await rollDiceWithNotification(createNotification, diceRoll);
          }}
          variant="info"
        />
      </div>
    </Card>
  );
}
function HistoryList({ history, closeTooltip }: { history: { label: string; link: string }[]; closeTooltip?: () => void }) {
  const navigate = useNavigate();
  return (
    <ul className="flex flex-col gap-y-1 divide-y divide-zinc-600 rounded bg-zinc-700 p-0 shadow">
      {history.map((link, i) => (
        <li
          key={(link.link + i).toString()}
          className="cursor-pointer px-2 py-1 text-lg transition-all [&>button]:h-6 [&>button]:border-0 [&>button]:p-0 [&>button]:hover:text-blue-400">
          <Button
            hasNoBackground
            label={link.label}
            onClick={() => {
              navigate(link.link);
              if (closeTooltip) closeTooltip();
            }}
          />
        </li>
      ))}
    </ul>
  );
}
function NotificationDate({ created_at }: { created_at: string }) {
  const date = new Date(created_at);

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.toLocaleTimeString()}`;
}
function NotificationList({
  user_id,
  project_id,
  notifications,
  closeTooltip,
}: {
  user_id: string;
  project_id: string;
  notifications: NotificationEntityType[];
  closeTooltip?: () => void;
}) {
  const { mutate } = useReadNotification(project_id, false);
  const { mutate: readAll } = useReadNotification(project_id, true);
  return (
    <div className="flex max-h-80 w-[28rem] flex-col gap-y-2 overflow-auto rounded-md bg-zinc-800 p-2 shadow">
      <div className="flex items-center gap-x-2">
        <div className="flex-1 text-xl font-bold">Notifications</div>
        <div className="w-46 ml-auto">
          <Button
            icon={IconEnum.check_circle}
            isDisabled={notifications.length === 0}
            label="Mark all as read"
            onClick={(e) => {
              e?.preventDefault();
              e?.stopPropagation();
              readAll({ data: { user_id, notification_id: "" } });
            }}
            variant="info"
          />
        </div>
      </div>
      <ul className="flex max-h-64 flex-col gap-y-2 overflow-auto">
        {notifications?.length ? (
          notifications?.map((notif) => (
            <li
              key={notif?.id}
              className="flex max-w-full flex-nowrap gap-x-1 rounded bg-zinc-700 p-2 shadow"
              onClick={() => {
                if (closeTooltip) closeTooltip();
              }}>
              <div className="self-center">
                {notif?.image_id ? (
                  <Avatar hasShowImage image_id={notif?.image_id} size="xs" />
                ) : (
                  <Icon fontSize={22} icon={getDefaultEntityIcon(notif?.entity_type)} />
                )}
              </div>

              <div className="flex flex-col gap-x-2">
                <span className="w-full text-xs">
                  <NotificationDate created_at={notif?.created_at} />
                </span>
                <div className="flex items-center text-sm">
                  <p className="gap-x-1 whitespace-normal break-words">
                    {`${notif.user_name} ${`${notif.action}d`} ${getSingularEntityType(notif.entity_type)?.toLowerCase()} `}
                    <Link
                      className="text-nowrap font-semibold text-blue-400 transition-colors hover:text-blue-300 active:text-blue-500"
                      to={getEntityLink(project_id as string, notif.entity_type, notif.related_id, notif.parent_id)}>
                      {notif.title}
                    </Link>
                  </p>
                </div>
              </div>
              <div className="ml-auto w-min">
                <Button
                  hasNoBackground
                  icon={IconEnum.check_circle}
                  isIconOnly
                  onClick={(e) => {
                    e?.preventDefault();
                    e?.stopPropagation();
                    mutate({ data: { notification_id: notif?.id, user_id } });
                  }}
                  tooltip="Mark as read"
                />
              </div>
            </li>
          ))
        ) : (
          <Alert label="There are no unread notifications." variant="info-bordered" />
        )}
      </ul>
    </div>
  );
}

export function Navbar({ isDisabled }: { isDisabled: boolean }) {
  const { project_id, game_id, subitem_id } = useParams();
  const { isLg } = useBreakpoint();
  const navigate = useNavigate();
  const module = ls.get("module");
  const queryClient = useQueryClient();
  const isMutating = useIsMutating();
  const isMutatingDocument = useIsMutating({ mutationKey: ["document_view", "update"] });
  const isGettingStatus = useIsFetching({ queryKey: ["auth_status"] });
  const { mutate: signOut, isLoading: isSigningOut } = useSignout();
  const createNotification = useNotifications();
  const navbarTitle = useAtomValue(navbarTitleAtom);
  const authUser = useAtomValue(userStatusAtom);
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
    undefined
  );
  const user = useAtomValue(userAtom);
  const featureFlags = useAtomValue(projectFeatureFlagsAtom);

  const { data: notifications } = useGetNotifications(project_id, user?.id, {
    enabled: !!user?.id && !!project_id && module === "editor",
  });

  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  function openSearchDrawer() {
    setDrawer((prev) => ({
      ...prev,
      title: "Search",
      size: "lg",
      type: "search",
      data: null,
    }));
  }
  function openImageUploadDialog() {
    if (permissions.create_assets) {
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
  }>(
    `${baseURLS.baseWebsocketServer}/ws/notifications/${project_id}`,
    {
      reconnectInterval: 5000,
      reconnectAttempts: 10,
    },
    !!project_id && module === "editor"
  );
  useLayoutEffect(() => {
    if (lastJsonMessage && !isDisabled) {
      if (lastJsonMessage.event_type === "NEW_NOTIFICATION") {
        // Don't create a notification if this is a conversation message
        if (lastJsonMessage?.conversation_id && subitem_id && subitem_id === lastJsonMessage.conversation_id) return;
        if (authUser?.user_id && lastJsonMessage.userId && authUser?.user_id === lastJsonMessage?.userId) return;
        if (lastJsonMessage?.notification_type) {
          const entityType = getEntityTypeFromNotificationType(lastJsonMessage?.notification_type);
          queryClient.invalidateQueries(["allEntities", project_id, entityType]);
          queryClient.invalidateQueries(["notifications", project_id]);
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
      } else if (
        (lastJsonMessage.event_type === "ROLE_UPDATED" && user?.role?.id === lastJsonMessage?.entity_id) ||
        (lastJsonMessage.event_type === "ROLE_ASSIGNED" && user?.id === lastJsonMessage.entity_id)
      ) {
        if (lastJsonMessage?.entity_id) {
          createNotification({
            icon: getDefaultEntityIcon(lastJsonMessage.entity),
            title:
              lastJsonMessage.event_type === "ROLE_ASSIGNED"
                ? "Your role in this project has been changed by the owner."
                : "Your role's permissions have been updated by the project's owner.",
            variant: "info",
            timer: 5,
            hasNoTruncate: true,
          });
        }
        queryClient.invalidateQueries(["user", project_id, authUser?.user_id]);
        queryClient.invalidateQueries(["allEntities", project_id]);
      }
    }
  }, [lastJsonMessage]);
  const history = useAtomValue(historyAtom);

  return (
    <div className="flex h-16 max-h-16 min-h-[4rem] max-w-full flex-1 overflow-hidden border-b border-zinc-800 bg-zinc-900 shadow">
      {isMutating && !isMutatingDocument ? <IndeterminateProgressBar /> : null}
      <h1 className="flex h-full min-h-[64px] max-w-[50%] select-none items-center pl-4 font-merriweather text-2xl text-white">
        <span className="truncate">{navbarTitle || "The Arkive"}</span>
      </h1>
      <div className="ml-auto flex items-center gap-x-2 pr-4">
        {project_id && user?.id && !isDisabled && module === "editor" ? (
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
            {isLg ? (
              <div className="w-fit">
                <Tooltip
                  arrowColor="#27272a"
                  content={<DiceRoller />}
                  customOffset={{ mainAxis: 25, crossAxis: 50 }}
                  isClickable>
                  <div className="h-full">
                    <Button hasNoBackground icon={IconEnum.d20} iconSize={24} isIconOnly onClick={undefined} />
                  </div>
                </Tooltip>
              </div>
            ) : null}
            <div className="w-fit">
              <div className="h-full">
                <Button hasNoBackground icon={IconEnum.search} iconSize={24} isIconOnly onClick={openSearchDrawer} />
              </div>
            </div>
            {isLg ? (
              <div className="w-fit">
                <Tooltip arrowColor="#3f3f46" content={<HistoryList history={history} />} isClickable isInline passCloseTooltip>
                  <div className="h-full">
                    <Button hasNoBackground icon={IconEnum.history} iconSize={24} isIconOnly onClick={undefined} />
                  </div>
                </Tooltip>
              </div>
            ) : null}
            <div className="w-fit">
              <Tooltip
                allowedPlacements={["bottom-end"]}
                arrowColor="#3f3f46"
                content={
                  <NotificationList notifications={notifications?.data || []} project_id={project_id} user_id={user?.id} />
                }
                isClickable
                isInline
                passCloseTooltip>
                <div className="relative h-full">
                  {notifications?.data?.length ? (
                    <div className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 p-1.5 text-sm font-bold">
                      {notifications?.data?.length}
                    </div>
                  ) : null}
                  <Button
                    hasNoBackground
                    icon={IconEnum.notifications}
                    iconSize={24}
                    iconThickness={notifications?.data?.length ? "fill" : "regular"}
                    isIconOnly
                    onClick={undefined}
                  />
                </div>
              </Tooltip>
            </div>
          </>
        ) : null}

        {project_id && user?.id && !isDisabled ? (
          <>
            {isLg ? (
              <div className="w-fit">
                <Tooltip
                  arrowColor="#27272a"
                  content={<DiceRoller />}
                  customOffset={{ mainAxis: 25, crossAxis: 50 }}
                  isClickable>
                  <div className="h-full">
                    <Button hasNoBackground icon={IconEnum.d20} iconSize={24} isIconOnly onClick={undefined} />
                  </div>
                </Tooltip>
              </div>
            ) : null}
            {game_id ? (
              <div className="h-full w-fit">
                <Link to={`/games/${game_id}/settings`}>
                  <Button
                    hasNoBackground
                    icon={IconEnum.settings}
                    iconSize={24}
                    isIconOnly
                    onClick={undefined}
                    tooltip={"Game settings"}
                  />
                </Link>
              </div>
            ) : null}
          </>
        ) : null}
        {authUser ? (
          <Dropdown allowedPlacements={["bottom-end"]} items={accountItems(signOut, navigate)}>
            <div className="relative ml-auto flex cursor-pointer items-center">
              <div className="absolute z-10 h-full w-full rounded-full bg-zinc-700 opacity-0 transition-all hover:opacity-50 active:opacity-70" />
              <Avatar
                image_url={user?.image || authUser?.image_url || undefined}
                isLoading={isSigningOut || !!isGettingStatus}
              />
            </div>
          </Dropdown>
        ) : null}
      </div>
    </div>
  );
}
