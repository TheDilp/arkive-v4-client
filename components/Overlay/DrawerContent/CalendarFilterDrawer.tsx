import { Dispatch, SetStateAction, useState } from "react";

import { useHandleChange } from "../../../hooks";
import { RequestFilterType } from "../../../types";
import { getSentenceCase, IconEnum, NumberFilters } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search, Select, Title } from "../../Form";
import { Collapsible, DrawerLayout } from "../../Layout";
import { Badge } from "../../Misc";
import { Dropdown } from "../Dropdown";

type Props = {
  data: {
    setFilters: Dispatch<
      SetStateAction<{
        filters: {
          and: RequestFilterType[];
          or: RequestFilterType[];
        };
        relationFilters: {
          and: RequestFilterType[];
          or: RequestFilterType[];
        };
      }>
    >;
  };
};
const timeRangeFieldEnum = [
  { label: "Start year", value: "start_year" },
  { label: "End year", value: "end_year" },
];

function getRelationFilterField(type: "character_filters" | "location_filters") {
  if (type === "character_filters") return "characters";
  if (type === "location_filters") return "map_pins";
  return undefined;
}

export function CalendarFilterDrawer({ data }: Props) {
  const { setFilters } = data;

  const [calendarFilters, setCalendarFilters] = useState<{
    filters: { type: string; and: RequestFilterType[]; or: RequestFilterType[] }[];
    relationFilters: { type: "character_filters" | "location_filters"; and: RequestFilterType[]; or: RequestFilterType[] }[];
  }>({ filters: [], relationFilters: [] });

  const { handleChange } = useHandleChange({ data: calendarFilters, setData: setCalendarFilters, ignoreDataChange: true });
  return (
    <DrawerLayout>
      <div className="flex items-center justify-between">
        <div>Add filters for events:</div>
        <Dropdown
          allowedPlacements={["left", "left-end", "left-start"]}
          items={[
            {
              id: "1",
              title: "Time range filter",
              onClick: () =>
                setCalendarFilters((prev) => ({
                  ...prev,
                  filters: prev.filters.concat({ type: "time_range_filters", and: [], or: [] }),
                })),
              isDisabled: calendarFilters.filters.some((f) => f.type === "time_range_filters"),
            },
            {
              id: "2",
              title: "Document filter",
              onClick: () =>
                setCalendarFilters((prev) => ({
                  ...prev,
                  filters: prev.filters.concat({ type: "document_filters", and: [], or: [] }),
                })),
              isDisabled: calendarFilters.filters.some((f) => f.type === "document_filters"),
            },
            {
              id: "3",
              title: "Locations filter",
              onClick: () =>
                setCalendarFilters((prev) => ({
                  ...prev,
                  relationFilters: prev.relationFilters.concat({ type: "location_filters", and: [], or: [] }),
                })),
              isDisabled: calendarFilters.relationFilters.some((f) => f.type === "location_filters"),
            },

            {
              id: "4",
              title: "Characters filter",
              onClick: () =>
                setCalendarFilters((prev) => ({
                  ...prev,
                  relationFilters: prev.relationFilters.concat({ type: "character_filters", and: [], or: [] }),
                })),
              isDisabled: calendarFilters.relationFilters.some((f) => f.type === "character_filters"),
            },
          ]}>
          <div className="h-8 w-8">
            <Button icon={IconEnum.add} onClick={undefined} variant="info" />
          </div>
        </Dropdown>
      </div>
      {calendarFilters.filters.map((filt, i) => {
        if (filt.type === "time_range_filters")
          return (
            <Collapsible
              actions={[
                {
                  icon: IconEnum.trash,
                  variant: "error",
                  onClick: () =>
                    setCalendarFilters((prev) => ({
                      ...prev,
                      filters: prev.filters.filter((f) => f.type !== "time_range_filters"),
                    })),
                },
              ]}
              icon={IconEnum.timeline}
              initialOpen
              key={filt.type}
              label="Time range filters">
              <div className="p-2">
                <div className="flex items-center">
                  <div className="flex-1">
                    <Title isDrawerTitle label="AND filters (must match every condition)" />
                  </div>

                  <div className="h-6 w-6">
                    <Button
                      hasNoBackground
                      icon={IconEnum.add}
                      onClick={() =>
                        handleChange({
                          name: `filters.[${i}].and`,
                          value: (filt.and || []).concat([
                            {
                              id: crypto.randomUUID(),
                              header_name: "",
                              field: "start_year",
                              value: 0,
                              operator: "eq",
                            },
                          ]),
                        })
                      }
                    />
                  </div>
                </div>
                {filt.and.map((f, j) => (
                  <div className="grid grid-cols-8 gap-x-2 py-0.5" key={f.id}>
                    {j > 0 ? (
                      <div className="col-span-8 mb-1.5 mt-1 flex items-center justify-center">
                        <div>
                          <Badge label="AND" variant="info" />
                        </div>
                      </div>
                    ) : null}
                    <div className="col-span-2">
                      <Select
                        name={`filters[${i}].and[${j}].field`}
                        onChange={handleChange}
                        options={timeRangeFieldEnum}
                        value={f.field}
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        name={`filters[${i}].and[${j}].operator`}
                        onChange={handleChange}
                        options={NumberFilters}
                        value={f.operator}
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-x-2">
                      <div className="flex-1">
                        <Input
                          name={`filters[${i}].and[${j}].value`}
                          onChange={handleChange}
                          type="number"
                          value={f.value as number}
                        />
                      </div>
                      <div>
                        <Button
                          hasNoBackground
                          icon={IconEnum.trash}
                          isIconOnly
                          onClick={() =>
                            setCalendarFilters((prev) => ({
                              ...prev,
                              filters: prev.filters.map((ff) => ({ ...ff, and: ff.and.filter((a) => a.id !== f.id) })),
                            }))
                          }
                          variant="error"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center">
                  <div className="flex-1">
                    <Title isDrawerTitle label="OR filters (must match at least one condition)" />
                  </div>
                  <div className="h-6 w-6">
                    <Button
                      hasNoBackground
                      icon={IconEnum.add}
                      onClick={() =>
                        handleChange({
                          name: `filters.[${i}].or`,
                          value: (filt.or || []).concat([
                            {
                              id: crypto.randomUUID(),
                              header_name: "",
                              field: "start_year",
                              value: 0,
                              operator: "eq",
                            },
                          ]),
                        })
                      }
                    />
                  </div>
                </div>
                {filt.or.map((f, j) => (
                  <div className="grid grid-cols-8 gap-x-2 py-0.5" key={f.id}>
                    {j > 0 ? (
                      <div className="col-span-8 mb-1.5 mt-1 flex items-center justify-center">
                        <div>
                          <Badge label="OR" variant="info" />
                        </div>
                      </div>
                    ) : null}
                    <div className="col-span-2">
                      <Select
                        name={`filters[${i}].or[${j}].field`}
                        onChange={handleChange}
                        options={timeRangeFieldEnum}
                        value={f.field}
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        name={`filters[${i}].or[${j}].operator`}
                        onChange={handleChange}
                        options={NumberFilters}
                        value={f.operator}
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-x-2">
                      <div className="flex-1">
                        <Input
                          name={`filters[${i}].or[${j}].value`}
                          onChange={handleChange}
                          type="number"
                          value={f.value as number}
                        />
                      </div>
                      <div>
                        <Button
                          hasNoBackground
                          icon={IconEnum.trash}
                          isIconOnly
                          onClick={() =>
                            setCalendarFilters((prev) => ({
                              ...prev,
                              filters: prev.filters.map((ff) => ({ ...ff, or: ff.or.filter((a) => a.id !== f.id) })),
                            }))
                          }
                          variant="error"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Collapsible>
          );

        if (filt.type === "document_filters")
          return (
            <Collapsible
              actions={[
                {
                  icon: IconEnum.trash,
                  variant: "error",
                  onClick: () =>
                    setCalendarFilters((prev) => ({
                      ...prev,
                      filters: prev.filters.filter((f) => f.type !== "document_filters"),
                    })),
                },
              ]}
              icon={IconEnum.document}
              initialOpen
              key={filt.type}
              label="Document filters">
              <div className="p-2">
                <div className="flex items-center">
                  <div className="flex-1">
                    <Title isDrawerTitle label="OR filters (must match at least one condition)" />
                  </div>
                  <div className="h-6 w-6">
                    <Button
                      hasNoBackground
                      icon={IconEnum.add}
                      onClick={() =>
                        handleChange({
                          name: `filters.[${i}].or`,
                          value: (filt.or || []).concat([
                            {
                              id: crypto.randomUUID(),
                              header_name: "",
                              field: "document_id",
                              value: 0,
                              operator: "eq",
                            },
                          ]),
                        })
                      }
                    />
                  </div>
                </div>
                {filt.or.map((f, j) => (
                  <div className="flex flex-col" key={f.id}>
                    {j > 0 ? (
                      <div className="mt-1 flex w-full items-center justify-center">
                        <div>
                          <Badge label="OR" variant="info" />
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-1.5 flex w-full items-center gap-x-2">
                      {f?.value ? (
                        <div className="flex-1">
                          <EntityPreview
                            clearAction={() =>
                              handleChange({
                                name: `filters[${i}].or[${j}].value`,
                                value: undefined,
                              })
                            }
                            icon={f.relationalData?.icon}
                            id={f?.value as string}
                            image_id={f.relationalData?.image_id}
                            title={f.relationalData?.label}
                            type="documents"
                          />
                        </div>
                      ) : (
                        <Search
                          isMultiple
                          name={`filters[${i}].or[${j}]`}
                          onChange={({ name, label, image, value, icon }) => {
                            handleChange([
                              {
                                name: `${name}.relationalData`,
                                value: { character_id: value, label, image_id: image, icon },
                              },
                              {
                                name: `${name}.value`,
                                value,
                              },
                            ]);
                          }}
                          searchEntity="documents"
                        />
                      )}
                      <div>
                        <Button
                          hasNoBackground
                          icon={IconEnum.trash}
                          isIconOnly
                          onClick={() =>
                            handleChange({ name: `filters[${i}].or`, value: filt.or.filter((ff) => ff.id !== f.id) })
                          }
                          variant="error"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Collapsible>
          );

        return null;
      })}
      {calendarFilters.relationFilters.map((filt, i) => {
        return (
          <Collapsible
            actions={[
              {
                icon: IconEnum.trash,
                variant: "error",
                onClick: () =>
                  setCalendarFilters((prev) => ({
                    ...prev,
                    relationFilters: prev.relationFilters.filter((f) => f.type !== filt.type),
                  })),
              },
            ]}
            icon={IconEnum.timeline}
            initialOpen
            key={filt.type}
            label={getSentenceCase(filt.type)}>
            <div className="p-2">
              <div className="flex items-center">
                <div className="flex-1">
                  <Title isDrawerTitle label="AND filters (must match every condition)" />
                </div>

                <div className="h-6 w-6">
                  <Button
                    hasNoBackground
                    icon={IconEnum.add}
                    onClick={() =>
                      handleChange({
                        name: `relationFilters.[${i}].and`,
                        value: (filt.and || []).concat([
                          {
                            id: crypto.randomUUID(),
                            header_name: getSentenceCase(filt.type),
                            field: getRelationFilterField(filt.type) || "",
                            value: "",
                            operator: "in",
                          },
                        ]),
                      })
                    }
                  />
                </div>
              </div>
              {filt.and.map((f, j) => (
                <div className="flex flex-col" key={f.id}>
                  {j > 0 ? (
                    <div className="mt-1 flex w-full items-center justify-center">
                      <div>
                        <Badge label="AND" variant="info" />
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-1.5 flex w-full items-center gap-x-2">
                    {f?.value ? (
                      <div className="flex-1">
                        <EntityPreview
                          clearAction={() =>
                            handleChange({
                              name: `relationFilters[${i}].and[${j}].value`,
                              value: undefined,
                            })
                          }
                          icon={f.relationalData?.icon}
                          id={f?.value as string}
                          image_id={f.relationalData?.image_id}
                          title={f.relationalData?.label}
                          type={filt.type === "character_filters" ? "characters" : "map_pins"}
                        />
                      </div>
                    ) : (
                      <Search
                        isMultiple
                        name={`relationFilters[${i}].and[${j}]`}
                        onChange={({ name, label, image, value, icon }) => {
                          handleChange([
                            {
                              name: `${name}.relationalData`,
                              value: { character_id: value, label, image_id: image, icon },
                            },
                            {
                              name: `${name}.value`,
                              value,
                            },
                          ]);
                        }}
                        searchEntity={filt.type === "character_filters" ? "characters" : "map_pins"}
                      />
                    )}
                    <div>
                      <Button
                        hasNoBackground
                        icon={IconEnum.trash}
                        isIconOnly
                        onClick={() =>
                          handleChange({ name: `relationFilters[${i}].and`, value: filt.and.filter((ff) => ff.id !== f.id) })
                        }
                        variant="error"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center">
                <div className="flex-1">
                  <Title isDrawerTitle label="OR filters (must match at least one condition)" />
                </div>

                <div className="h-6 w-6">
                  <Button
                    hasNoBackground
                    icon={IconEnum.add}
                    onClick={() =>
                      handleChange({
                        name: `relationFilters.[${i}].or`,
                        value: (filt.or || []).concat([
                          {
                            id: crypto.randomUUID(),
                            header_name: getSentenceCase(filt.type),
                            field: getRelationFilterField(filt.type) || "",
                            value: "",
                            operator: "in",
                          },
                        ]),
                      })
                    }
                  />
                </div>
              </div>
              {filt.or.map((f, j) => (
                <div className="flex flex-col" key={f.id}>
                  {j > 0 ? (
                    <div className="mt-1 flex w-full items-center justify-center">
                      <div>
                        <Badge label="OR" variant="info" />
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-1.5 flex w-full items-center gap-x-2">
                    {f?.value ? (
                      <div className="flex-1">
                        <EntityPreview
                          clearAction={() =>
                            handleChange({
                              name: `relationFilters[${i}].or[${j}].value`,
                              value: undefined,
                            })
                          }
                          icon={f.relationalData?.icon}
                          id={f?.value as string}
                          image_id={f.relationalData?.image_id}
                          title={f.relationalData?.label}
                          type={filt.type === "character_filters" ? "characters" : "map_pins"}
                        />
                      </div>
                    ) : (
                      <Search
                        isMultiple
                        name={`relationFilters[${i}].or[${j}]`}
                        onChange={({ name, label, image, value, icon }) => {
                          handleChange([
                            {
                              name: `${name}.relationalData`,
                              value: { character_id: value, label, image_id: image, icon },
                            },
                            {
                              name: `${name}.value`,
                              value,
                            },
                          ]);
                        }}
                        searchEntity={filt.type === "character_filters" ? "characters" : "map_pins"}
                      />
                    )}
                    <div>
                      <Button
                        hasNoBackground
                        icon={IconEnum.trash}
                        isIconOnly
                        onClick={() =>
                          handleChange({ name: `relationFilters[${i}].or`, value: filt.or.filter((ff) => ff.id !== f.id) })
                        }
                        variant="error"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Collapsible>
        );
      })}
      <Button
        icon={IconEnum.filter}
        label="Apply filter"
        onClick={() => {
          const and = calendarFilters.filters.flatMap((f) => f.and);
          const or = calendarFilters.filters.flatMap((f) => f.or);
          const andRelationFilters = calendarFilters.relationFilters.flatMap((f) => f.and);
          const orRelationFilters = calendarFilters.relationFilters.flatMap((f) => f.or);

          setFilters({
            filters: { and, or },
            relationFilters: {
              and: andRelationFilters,
              or: orRelationFilters,
            },
          });
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
