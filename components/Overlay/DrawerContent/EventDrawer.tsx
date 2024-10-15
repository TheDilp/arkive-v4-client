import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  useCreateSubEntity,
  useGetEntity,
  useGetSubEntity,
  useHandleChange,
  useHasPermissions,
  useToggledResetAtom,
  useUpdateSubEntity,
} from "../../../hooks";
import {
  CalendarType,
  DrawerAtomType,
  EventStateType,
  EventType,
  onChangeValue,
  PreviewableEntities,
  TabType,
  UserHasPermissionsType,
} from "../../../types";
import {
  checkIfDayCorrect,
  checkIfMonthCorrect,
  checkIfYearCorrect,
  drawerAtom,
  getAssetURL,
  getDefaultEntityIcon,
  getEntityLink,
  IconEnum,
} from "../../../utils";
import { InsertEventSchema, UpdateEventSchema } from "../../../validation/calendars/event";
import { ImageSelect } from "../../Complex";
import { EntityPermission } from "../../Complex/EntityPermission";
import { EntityPreview, ImagePreview } from "../../DataDisplay";
import { Button, Checkbox, Input, Search, Select, TagInput, Textarea } from "../../Form";
import { Collapsible, DrawerLayout, Tabs } from "../../Layout";
import { Skeleton } from "../../Misc";
import { ColorPicker } from "..";

function isSaveDisabled(event: EventStateType, { isDateCorrect }: { isDateCorrect: boolean }) {
  if (!isDateCorrect) return true;
  if (!Number.isInteger(event?.start_day)) return true;
  if (!Number.isInteger(event?.start_month)) return true;
  if (!Number.isInteger(event?.start_year)) return true;
  if (!event?.title) return true;

  return false;
}

type Props = {
  data: {
    id?: string;
    day?: number;
    month?: number;
    year?: number;
    parent_id?: string;
    isReadOnly?: boolean;
  };
  exceptions: DrawerAtomType["exceptions"];
};

function getTabs(permissions: UserHasPermissionsType, id: string | undefined): TabType[] {
  const tabs: TabType[] = [
    { id: "1", label: "Basic info", icon: IconEnum.info_circle },
    { id: "2", label: "Details", icon: IconEnum.edit },
  ];
  if (permissions?.read_tags) {
    tabs.push({ id: "3", label: "Tags", icon: IconEnum.tags });
  }

  if (permissions?.is_owner || !id) {
    tabs.push({ id: "4", label: "Access", icon: IconEnum.permissions });
  }
  return tabs;
}

export function EventDrawer({ data, exceptions }: Props) {
  const queryClient = useQueryClient();
  const { project_id, item_id } = useParams();
  const hasId = "id" in data && data?.id;
  const [selectedTab, setSelectedTab] = useState(0);
  const resetDrawer = useToggledResetAtom();
  const setDrawer = useSetAtom(drawerAtom);

  const [event, setEvent] = useState<EventStateType>({
    start_month: data?.month ?? 0,
    start_month_id: "",
    start_day: data?.day,
    start_year: data?.year,
    parent_id: exceptions?.globalCreate ? null : (item_id as string),
  });

  const { data: calendar, isFetching: isFetchingMonths } = useGetEntity<CalendarType>(
    (data?.parent_id as string) || event?.parent_id || (item_id as string),
    "calendars",
    {
      fields: ["id", "title", "icon", "hours", "minutes"],
      relations: { months: true },
    },
    {
      enabled: !exceptions?.globalCreate || (exceptions?.globalCreate && !!event?.parent_id),
      queryKeyConcat: ["event_drawer"],
    }
  );

  const {
    data: existingEvent,
    isInitialLoading,
    isFetching: isFetchingEvent,
  } = useGetSubEntity<EventType>(
    data?.id,
    "events",
    {
      data: { project_id },
      relations: { tags: true, image: true, document: true, characters: true, map_pins: true },
      fields: [
        "id",
        "owner_id",
        "title",
        "background_color",
        "parent_id",
        "start_day",
        "start_month",
        "start_month_id",
        "start_year",
        "end_day",
        "end_month",
        "end_month_id",
        "end_year",
        "start_hours",
        "start_minutes",
        "end_hours",
        "end_minutes",
        "is_public",
        "description",
      ],
      permissions: true,
    },
    {
      queryKeyConcat: ["event_drawer"],
      enabled: !!data?.id,
    }
  );

  const permissions = useHasPermissions(
    [
      "read_events",
      "create_events",
      "update_events",
      "read_tags",
      "read_characters",
      "read_map_pins",
      "read_assets",
      "read_documents",
    ],
    existingEvent?.data?.owner_id
  );
  const tabs = getTabs(permissions, existingEvent?.data?.id);

  const existingMonths = calendar?.data?.months || [];

  const { mutateAsync: createEvent, isLoading: isCreating } = useCreateSubEntity<{
    data: EventStateType & { parent_id: string };
  }>("events", project_id as string);

  const { mutateAsync: updateEvent, isLoading: isUpdating } = useUpdateSubEntity(
    "events",
    project_id as string,
    item_id as string
  );

  useLayoutEffect(() => {
    if (existingEvent?.data) {
      setEvent(existingEvent?.data);
    }
  }, [existingEvent]);

  useLayoutEffect(() => {
    if (existingMonths.length) {
      setEvent((prev) => ({ ...prev, start_month_id: existingMonths?.[data?.month ?? 0]?.id }));
    }
  }, [existingMonths]);

  const { handleChange } = useHandleChange({ data: event, setData: setEvent });

  function handleMonthChange({ name, value }: onChangeValue) {
    if (value === undefined) {
      handleChange({ name, value });
      return;
    }
    const idx = existingMonths?.findIndex((month) => month.id === value) ?? -1;
    if (idx > -1)
      handleChange([
        { name, value: idx },
        { name: `${name}_id`, value: existingMonths[idx].id },
      ]);
  }

  function handleImageChange({ name, label, value }: { name: string; label?: string; value: string | null }) {
    handleChange({ name, value: { id: value, title: label } });
  }

  async function handleSave() {
    if (!data?.id) {
      const parsedData = InsertEventSchema.parse({
        data: { ...event, image_id: event?.image?.id, document_id: event?.document?.id },
        relations: {
          tags: event?.tags?.map((tag) => ({ id: tag.id })),
          characters: event?.characters?.map((char) => ({ id: char.id })),
          map_pins: event?.map_pins?.map((pin) => ({ id: pin.id })),
        },
        permissions: event.permissions,
      });

      await createEvent(parsedData, {
        onSuccess: () => {
          resetDrawer();
          setEvent({
            start_month: data?.month ?? 0,
            start_month_id: "",
            start_day: data?.day,
            start_year: data?.year,
            parent_id: exceptions?.globalCreate ? null : (item_id as string),
          });
          queryClient.invalidateQueries({
            queryKey: ["allEntities", project_id, "events"],
            exact: false,
            type: "active",
          });
        },
      });
    } else {
      const parsedData = UpdateEventSchema.parse({
        data: { ...event, image_id: event?.image?.id, document_id: event?.document?.id },
        relations: {
          tags: event?.tags?.map((tag) => ({ id: tag.id })),
          characters: event?.characters?.map((char) => ({ id: char.id })),
          map_pins: event?.map_pins?.map((pin) => ({ id: pin.id })),
        },
        permissions: event.permissions,
      });
      await updateEvent(parsedData, {
        onSuccess: () => {
          resetDrawer();
          queryClient.invalidateQueries({
            queryKey: ["allEntities", project_id, "events"],
            exact: false,
            type: "active",
          });
        },
      });
    }
  }

  const isYearCorrect = checkIfYearCorrect(event.start_year, event?.end_year);
  const isMonthCorrect = checkIfMonthCorrect(event, isYearCorrect);
  const isDayCorrect = checkIfDayCorrect(event, isYearCorrect, isMonthCorrect);
  const isDateCorrect = isYearCorrect && isMonthCorrect && isDayCorrect;

  const isLoading = isFetchingEvent || isFetchingMonths;

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Tabs
        onChange={(_, index) => setSelectedTab(index)}
        selectedTab={selectedTab}
        tabs={calendar?.data?.id ? tabs : tabs.slice(0, 1)}
      />
      {tabs[selectedTab].id === "1" ? (
        <div className="flex flex-col gap-y-2">
          {exceptions?.globalCreate && !event?.parent_id ? (
            <Search
              label="Calendar (required)"
              name="parent_id"
              onChange={handleChange}
              searchEntity="calendars"
              value={event?.parent_id}
            />
          ) : null}
          {exceptions?.globalCreate && event?.parent_id && calendar?.data ? (
            <EntityPreview
              clearAction={data?.isReadOnly ? undefined : () => handleChange({ name: "parent_id", value: null })}
              icon={calendar?.data?.icon || IconEnum.calendar}
              id={event?.parent_id}
              title={calendar?.data?.title}
              type="calendars"
            />
          ) : null}
          {(exceptions?.globalCreate && calendar?.data?.id) || !exceptions?.globalCreate ? (
            <>
              <div className="flex flex-nowrap gap-x-2">
                <Input
                  isReadOnly={data?.isReadOnly}
                  label="Event title (required)"
                  name="title"
                  onChange={handleChange}
                  placeholder="Event title"
                  value={event?.title || ""}
                  variant={event?.title ? "primary" : "error"}
                />
                <div className="flex flex-col justify-between">
                  <span className="block min-h-[20px] truncate text-center text-sm text-zinc-300">Color</span>
                  <div className="flex items-center justify-center gap-x-2 pb-2">
                    <ColorPicker
                      hasCustom
                      isDisabled={data?.isReadOnly}
                      name="background_color"
                      onChange={handleChange}
                      value={event.background_color || ""}
                    />
                  </div>
                </div>
              </div>

              <Collapsible initialOpen label="Start">
                <div className="flex flex-col gap-y-2 p-2">
                  <div className="flex items-center justify-between gap-x-2">
                    <Input
                      isReadOnly={data?.isReadOnly}
                      label="Start day (required)"
                      max={existingMonths?.[event?.start_month || 0]?.days ?? 0}
                      min={1}
                      name="start_day"
                      onChange={handleChange}
                      type="number"
                      value={event?.start_day || ""}
                      variant={event?.start_day ? "primary" : "error"}
                    />
                    <Select
                      isDisabled={isFetchingMonths}
                      isLoading={isFetchingMonths}
                      isReadOnly={data?.isReadOnly}
                      label="Start month (required)"
                      name="start_month"
                      onChange={handleMonthChange}
                      options={existingMonths?.map((month) => ({ label: month.title, value: month.id })) || []}
                      value={typeof event?.start_month === "number" ? existingMonths?.[event?.start_month]?.id : undefined}
                      variant={event?.start_month_id ? "primary" : "error"}
                    />
                    <Input
                      isReadOnly={data?.isReadOnly}
                      label="Start year (required)"
                      name="start_year"
                      onChange={handleChange}
                      type="number"
                      value={event?.start_year || ""}
                    />
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Input
                      isReadOnly={data?.isReadOnly}
                      label="Start hour (optional)"
                      max={calendar?.data?.hours ?? undefined}
                      min={0}
                      name="start_hours"
                      onChange={handleChange}
                      type="number"
                      value={event?.start_hours ?? ""}
                    />
                    <Input
                      isReadOnly={data?.isReadOnly}
                      label="Start minutes (optional)"
                      max={calendar?.data?.minutes ?? undefined}
                      min={0}
                      name="start_minutes"
                      onChange={handleChange}
                      type="number"
                      value={event?.start_minutes ?? ""}
                    />
                  </div>
                </div>
              </Collapsible>
              <Collapsible initialOpen={!!event?.end_day && !!event?.end_month_id && !!event?.end_year} label="End (optional)">
                <div className="flex flex-col gap-y-2 p-2">
                  <div className="grid grid-cols-3 gap-x-2">
                    <Input
                      helperText={
                        isDayCorrect ? "" : "End day must be more or equal to start day if in the same month and year."
                      }
                      isDisabled={typeof event?.end_month !== "number" || data?.isReadOnly}
                      label="End day (optional)"
                      max={typeof event.end_month === "number" ? existingMonths[event.end_month].days : 0}
                      min={1}
                      name="end_day"
                      onChange={handleChange}
                      placeholder={typeof event?.end_month !== "number" ? "Select a month." : ""}
                      type="number"
                      value={event?.end_day || ""}
                      variant={isDayCorrect ? "primary" : "error"}
                    />
                    <Select
                      helperText={isMonthCorrect ? "" : "End month must be more or equal to start month if in the same year."}
                      isClearable
                      isDisabled={isFetchingMonths}
                      isLoading={isFetchingMonths}
                      isReadOnly={data?.isReadOnly}
                      label="End month (optional)"
                      name="end_month"
                      onChange={handleMonthChange}
                      options={existingMonths?.map((month) => ({ label: month.title, value: month.id })) || []}
                      value={typeof event?.end_month === "number" ? existingMonths?.[event.end_month].id : undefined}
                      variant={isMonthCorrect ? "primary" : "error"}
                    />
                    <Input
                      helperText={isYearCorrect ? "" : "End year must be more or equal to start year."}
                      isDisabled={typeof event?.end_month !== "number"}
                      isReadOnly={data?.isReadOnly}
                      label="End year (optional)"
                      name="end_year"
                      onChange={handleChange}
                      placeholder={typeof event?.end_month !== "number" ? "Select a month." : ""}
                      type="number"
                      value={event?.end_year || ""}
                      variant={isYearCorrect ? "primary" : "error"}
                    />
                  </div>
                  <div className="flex items-center gap-x-2">
                    <Input
                      isDisabled={!event.end_year || !event.end_month_id || !event.end_day}
                      isReadOnly={data?.isReadOnly}
                      label="End hour (optional)"
                      max={calendar?.data?.hours ?? undefined}
                      min={0}
                      name="end_hours"
                      onChange={handleChange}
                      type="number"
                      value={event?.end_hours ?? ""}
                    />
                    <Input
                      isDisabled={!event.end_year || !event.end_month_id || !event.end_day}
                      isReadOnly={data?.isReadOnly}
                      label="End minutes (optional)"
                      max={calendar?.data?.minutes ?? undefined}
                      min={0}
                      name="end_minutes"
                      onChange={handleChange}
                      type="number"
                      value={event?.end_minutes ?? ""}
                    />
                  </div>
                </div>
              </Collapsible>

              <div className="flex w-full items-center justify-between">
                <span>Is public:</span>
                <Checkbox
                  isDisabled={data?.isReadOnly}
                  name="is_public"
                  onChange={handleChange}
                  value={event?.is_public ?? false}
                />
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {(exceptions?.globalCreate && calendar?.data?.id) || !exceptions?.globalCreate ? (
        <>
          {tabs[selectedTab].id === "2" ? (
            <>
              <div className="h-fit py-2">
                <Textarea
                  helperText={event?.document || event?.document_id ? "Note: using document instead of description." : ""}
                  isDisabled={data?.isReadOnly || !!event?.document || !!event?.document_id}
                  label="Event description (optional)"
                  name="description"
                  onChange={handleChange}
                  placeholder="Note: the event will use a document's content if selected."
                  value={event?.description || ""}
                />
              </div>
              {permissions?.read_assets ? (
                <div>
                  {event?.image?.id ? (
                    <ImagePreview
                      clearAction={
                        data?.isReadOnly || !permissions?.read_assets
                          ? undefined
                          : () => {
                              handleChange({ name: "image", value: null });
                            }
                      }
                      id={event.image.id}
                      label="Event image (optional)"
                      title={event.image.title}
                      url={getAssetURL(project_id as string, "images", event.image.id)}
                    />
                  ) : (
                    <ImageSelect
                      isDisabled={data?.isReadOnly}
                      label="Event image (optional)"
                      name="image"
                      onChange={handleImageChange}
                      type="images"
                      value={event.image_id}
                    />
                  )}
                </div>
              ) : null}
              <div>
                {event?.document ? (
                  <EntityPreview
                    clearAction={data?.isReadOnly ? undefined : () => handleChange({ name: "document", value: null })}
                    icon={event.document?.icon ?? getDefaultEntityIcon("documents")}
                    id={event.document.id}
                    label="Document"
                    link={getEntityLink(project_id as string, "documents", event.document.id, null)}
                    previewAction={
                      !permissions?.read_documents
                        ? undefined
                        : () =>
                            setDrawer((prev) => ({
                              ...prev,
                              title: "Preview",
                              data: { id: event?.document?.id as string, entity_type: "documents" as PreviewableEntities },
                              type: "entity_preview",
                              size: "half",
                            }))
                    }
                    title={event.document.title}
                    type="documents"
                  />
                ) : (
                  <Search
                    isDisabled={data?.isReadOnly || !permissions?.read_documents}
                    label="Event document (optional)"
                    name="document"
                    onChange={handleImageChange}
                    searchEntity="documents"
                    value={event.document_id}
                  />
                )}
              </div>

              <Collapsible
                icon={IconEnum.character}
                initialOpen={false}
                isDisabled={!permissions?.read_characters}
                label="Characters">
                <div className="flex flex-col gap-y-1 p-2">
                  <Search
                    isMultiple
                    label="Characters (optional)"
                    limit={10}
                    name="characters"
                    onChange={({ name, value, label, image }) => {
                      if ((event.characters || [])?.some((char) => char.id === value)) {
                        handleChange({
                          name,
                          value: (event.characters || []).filter((t) => t.id !== value),
                        });
                        return;
                      }

                      handleChange({
                        name,
                        value: (event.characters || []).concat({
                          full_name: label || "",
                          id: value,
                          portrait_id: image,
                        }),
                      });
                    }}
                    searchEntity="characters"
                    value={event.characters?.map((char) => char.id)}
                  />
                  {event.characters?.map((char) => (
                    <EntityPreview
                      clearAction={(id) =>
                        handleChange({ name: "characters", value: event.characters?.filter((c) => c.id !== id) })
                      }
                      id={char.id}
                      image_id={char.portrait_id}
                      title={char.full_name}
                      type="characters"
                    />
                  ))}
                </div>
              </Collapsible>

              <Collapsible
                icon={IconEnum.map_pin}
                initialOpen={false}
                isDisabled={!permissions?.read_map_pins}
                label="Locations">
                <div className="flex flex-col gap-y-1 p-2">
                  <Search
                    isMultiple
                    label="Locations (optional)"
                    limit={10}
                    name="map_pins"
                    onChange={({ name, value, label, image, icon, parent_id }) => {
                      if ((event.map_pins || [])?.some((char) => char.id === value)) {
                        handleChange({
                          name,
                          value: (event.map_pins || []).filter((t) => t.id !== value),
                        });
                        return;
                      }

                      handleChange({
                        name,
                        value: (event.map_pins || []).concat({
                          id: value,
                          title: label || "",
                          image_id: image,
                          icon: icon || getDefaultEntityIcon("map_pins"),
                          parent_id: parent_id || "",
                          color: "#ffffff",
                          border_color: "#ffffff",
                        }),
                      });
                    }}
                    searchEntity="map_pins"
                    value={event.map_pins?.map((pin) => pin.id)}
                  />
                  {event.map_pins?.map((pin) => (
                    <EntityPreview
                      clearAction={(id) =>
                        handleChange({ name: "map_pins", value: event.map_pins?.filter((c) => c.id !== id) })
                      }
                      icon={pin.icon}
                      id={pin.id}
                      image_id={pin.image_id}
                      title={pin.title || ""}
                      type="map_pins"
                    />
                  ))}
                </div>
              </Collapsible>
            </>
          ) : null}
          {tabs[selectedTab].id === "3" && permissions?.read_tags ? (
            <TagInput handleChange={handleChange} isDisabled={data?.isReadOnly} isMultiple tags={event?.tags || []} />
          ) : null}
          {tabs[selectedTab].id === "4" && (permissions?.is_owner || !data?.id) ? (
            <EntityPermission
              handleChange={handleChange}
              owner_id={event?.owner_id}
              permissions={event?.permissions || []}
              related_id={event?.id || null}
              selectablePermissions={["read_events", "update_events", "delete_events"]}
            />
          ) : null}
        </>
      ) : null}

      {data?.isReadOnly ? null : (
        <div>
          <Button
            icon={hasId ? IconEnum.save : IconEnum.add}
            isDisabled={isSaveDisabled(event, { isDateCorrect }) || isLoading || isCreating || isUpdating}
            isLoading={isCreating || isUpdating}
            label={hasId ? "Save" : "Create"}
            onClick={handleSave}
            variant="success"
          />
        </div>
      )}
    </DrawerLayout>
  );
}
