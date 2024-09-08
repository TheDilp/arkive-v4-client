import { autoPlacement, computePosition, offset } from "@floating-ui/dom";
import * as d3 from "d3";
import { useAtomValue, useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { Dispatch, MouseEvent, MutableRefObject, SetStateAction, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { clamp } from "remirror";

import { Button, Input, Select } from "../../components";
import { useBreakpoint, useDeleteSubEntity } from "../../hooks";
import { EraType, EventType, MonthType, UserHasPermissionsType, UserType } from "../../types";
import {
  contextMenuAtom,
  DefaultTagColor,
  drawerAtom,
  getDayOrdinal,
  hasActionPermission,
  IconEnum,
  projectFeatureFlagsAtom,
  timelineZoomOptions,
} from "../../utils";

const CIRCLE_RADIUS = 6;
const X_AXIS_OFFSET = 30;

function truncateLongEventText(texts: any) {
  texts.each(function () {
    // @ts-ignore
    const text = d3.select(this);
    const words = text.text().split(/\s+/);
    const ellipsis = text.text("").append("tspan").attr("class", "elip").text("...");
    const width = parseFloat(text.attr("width")) - (ellipsis?.node()?.getComputedTextLength() || 0);
    const numWords = words.length;

    const tspan = text.insert("tspan", ":first-child").text(words.join(" "));

    // Try the whole line
    // While it's too long, and we have words left, keep removing words

    while ((tspan?.node()?.getComputedTextLength() || 10) > width && words.length) {
      words.pop();
      tspan.text(words.join(" "));
    }

    if (words.length === numWords || Number(text.attr("width")) < 10) {
      ellipsis.remove();
    }
  });
}

function changeZoom(type: "in" | "out", setZoom: Dispatch<SetStateAction<number>>, id: string) {
  setZoom((prev) => {
    const newZoom = clamp({
      min: 2,
      max: 100,
      value: prev + (type === "in" ? 2 : -2),
    });
    ls.set(`timeline_${id}_zoom`, newZoom);
    return newZoom;
  });
}

export function TimelineView({
  id,
  events,
  months,
  eras,
  user,
  isProjectOwner,
  permissions,
}: {
  id?: string;
  events: EventType[];
  months: MonthType[];
  eras: EraType[];
  user: UserType | null;
  isProjectOwner: boolean;
  permissions: UserHasPermissionsType;
}) {
  const { project_id, item_id } = useParams();
  const { isLg } = useBreakpoint();
  const featureFlags = useAtomValue(projectFeatureFlagsAtom);
  const [zoom, setZoom] = useState(ls.get(`timeline_${item_id}_zoom`) || 2);
  const [numberOfTicks, setNumberOfTicks] = useState(0);
  const [goToYear, setGoToYear] = useState(1);
  const [borders, setBorders] = useState({ start: 0, end: 0 });
  const setDrawer = useSetAtom(drawerAtom);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const timelineLayoutContainer = useRef() as MutableRefObject<HTMLDivElement>;
  const timelineContainer = useRef() as MutableRefObject<SVGSVGElement>;
  const container = useRef() as MutableRefObject<HTMLDivElement>;
  const scrollContainer = useRef() as MutableRefObject<HTMLDivElement>;
  const { mutate: deleteEvent } = useDeleteSubEntity("events", project_id as string, item_id);
  useLayoutEffect(() => {
    if (
      timelineContainer.current &&
      events.length &&
      timelineContainer?.current?.clientWidth &&
      timelineContainer?.current?.clientHeight
    ) {
      // Calendar constants
      const minYear = events.reduce((prev: number, curr) => {
        if (curr?.start_year && curr.start_year < prev) return curr.start_year;
        return prev;
      }, Infinity);
      const minYearCount = clamp({
        min: minYear < 0 ? minYear - 5 : 0,
        max: Infinity,
        value: minYear === Infinity ? 0 : minYear - 10,
      });
      const maxYearCount = events.reduce((prev: number, curr) => {
        if (curr?.end_year && curr.end_year > prev) return curr.end_year;
        if (curr?.start_year && curr.start_year > prev) return curr.start_year;
        return prev;
      }, 0);

      const monthCount = months.length;
      const isYearsOnly = maxYearCount > 5;
      const endRange = clamp({
        min: 1,
        max: maxYearCount,
        value: maxYearCount * (isYearsOnly ? 1 : monthCount),
      });
      setBorders({ start: minYearCount, end: endRange });

      // Graphics constants
      const width = timelineContainer?.current?.clientWidth || 1;
      const height = clamp({
        min: timelineContainer?.current?.clientHeight || 0 - 5,
        max: timelineContainer?.current?.clientHeight || 0 - 5,
        value: events.length * 30 || timelineContainer?.current?.clientHeight || 1,
      });
      const svg = d3.select(timelineContainer.current);
      const x = d3
        .scaleLinear()
        .domain([minYearCount, endRange])
        .range([0, width - X_AXIS_OFFSET - 30]);

      const y = d3
        .scaleLinear()
        .domain([0, (events.length * zoom) / 2])
        .rangeRound([50, height * 1.05]);

      const numOfTicks = Math.floor((maxYearCount - Math.abs(minYearCount)) / clamp({ min: 1, max: 1000, value: zoom % 2 }));
      if (numberOfTicks !== numOfTicks) {
        setNumberOfTicks(numOfTicks);
      } else {
        const axisBottom = d3
          .axisBottom(x)
          .ticks(numOfTicks)
          .tickSize(10)
          .tickFormat((d) => {
            if (isYearsOnly) return ((d as number) + 1).toString();
            return `${months[Number(d) % monthCount].title} ${Math.floor(Number(d) / monthCount) + 1}`;
          });

        const highlighter = svg
          .append("rect")
          .attr("class", "highlighter stroke-blue-400 w-[1px]")
          .attr("height", height)
          .attr("width", width)
          .style("pointer-events", "all")
          .style("fill", "none");

        const eraBars = eras
          .filter((e) => e.start_year <= endRange)
          .map((e, i) => {
            return {
              x: isYearsOnly ? e.start_year - 1 : (e.start_year - 1) * monthCount + e.start_month + e.start_day * 0.01,
              y: e.start_year + Math.floor(i / 10) * 30,
              width: isYearsOnly
                ? Number(e?.end_year) - e.start_year
                : Number(e?.end_year || 0) - e.start_year + Math.abs(Number(e?.end_month || 0) - e.start_month),
              background_color: e.color || DefaultTagColor,
              title: `${e.title} (${e.start_day}${getDayOrdinal(e.start_day)} ${months[e.start_month].title} ${
                e.start_year
              } - ${e.end_day || ""}${e.end_day ? getDayOrdinal(e.end_day) : ""} ${months[e.end_month || 0].title} ${
                e.end_year || ""
              })`,
            };
          });

        // ! CHANGE TO ONLY BE EVENTS WITHOUT END DAY
        const points = (events?.filter((e) => !e.end_year) || [])?.map((e, i) => {
          return {
            id: e.id,
            parent_id: e.parent_id,
            owner_id: e.owner_id,
            permissions: e.permissions,
            x: isYearsOnly
              ? e.start_year - 1 + e.start_day * 0.01
              : (e.start_year - 1) * monthCount + e.start_month + e.start_day * 0.01,
            y: clamp({ min: 0, max: height / 1.05, value: i * 0.8 * zoom }),
            background_color: e.background_color || DefaultTagColor,
            title: `${e?.title || ""} (${e.start_day}${getDayOrdinal(e.start_day)} ${months[e.start_month].title} ${
              e.start_year
            })`,
            description: e.description,
          };
        });

        const event_bars = events
          .filter((e) => !!e.end_year)
          .map((e, index) => {
            return {
              id: e.id,
              start_x: isYearsOnly ? e.start_year - 1 : (e.start_year - 1) * monthCount + e.start_month,
              start_year: e.start_year,
              owner_id: e.owner_id,
              permissions: e.permissions,
              image_id: e.image_id,
              index,
              end_x: isYearsOnly
                ? (e.end_year || 0) - 1
                : ((e.end_year || 0) - 1) * monthCount + (e.end_month || 0) + (e.end_day || 0),
              parent_id: e.parent_id,
              background_color: e.background_color || DefaultTagColor,
              date_string: `(${e.start_day}${getDayOrdinal(e.start_day)} ${months[e.start_month].title} ${e.start_year} - ${
                e.end_day || ""
              }${e.end_day ? getDayOrdinal(e.end_day) : ""} ${months[e.end_month || 0].title} ${e.end_year || ""})`,
              title: e.title,
            };
          })
          .sort((a, b) => {
            if (a.end_x - a.start_x > b.end_x - b.start_x) return -1;
            if (a.end_x - a.start_x < b.end_x - b.start_x) return 1;
            return 0;
          });

        d3.select("#xAxisContainer")
          .append("g")
          .attr("class", "axis axis--x")
          .attr("transform", `translate(${X_AXIS_OFFSET},${0})`)
          .call(axisBottom);

        const tooltip = d3
          .select(container.current)
          .attr(
            "class",
            "tooltip pointer-events-none absolute hidden bg-black border border-zinc-800 shadow-lg font-lato rounded p-2"
          );

        const groupForEras = svg.append("g").attr("transform", `translate(${X_AXIS_OFFSET},0)`).attr("id", "groupForEras");
        const groupForBars = svg
          .append("g")
          .attr("transform", `translate(${X_AXIS_OFFSET},0)`)
          .attr("id", "groupForBars")
          .attr("height", events.length * 300);
        const groupForCircles = svg
          .append("g")
          .attr("transform", `translate(${X_AXIS_OFFSET},0)`)
          .attr("id", "groupForCircles");

        (featureFlags?.show_eras_in_timelines ? eraBars : []).forEach((e) => {
          const bar = groupForEras.append("g");

          bar
            .append("rect")
            .attr("width", x(e.width))
            .attr("height", scrollContainer.current.scrollHeight)
            .attr("fill-opacity", "30%")
            .attr("x", x(e.x))
            .attr("y", 0)
            .style("fill", e.background_color);

          bar
            .append("text")
            .attr("class", "event-text")
            .attr("width", x(e.width))
            .attr("font-size", "25")
            .attr("font-family", "Merriweather")
            .text(() => {
              const title = `${e.title}`;
              if (title.length > x(e.width) - 10) {
                return `${title.slice(0, title.length / 2)}...`;
              }
              return title;
            })
            .attr("fill", "white")
            .attr("x", x(e.x) + 20)
            .attr("y", 30);
        });
        event_bars.forEach((event, j) => {
          const event_bar = groupForBars.append("g");
          const bar_width = x(event.end_x) - x(event.start_x);
          event_bar
            .append("rect")
            .on("click", () => {
              if (
                hasActionPermission(
                  isProjectOwner,
                  user?.id === event?.owner_id,
                  permissions,
                  event?.permissions || [],
                  "update_events",
                  user?.role?.id
                )
              ) {
                setDrawer((prev) => ({
                  ...prev,
                  size: "lg",
                  title: `Edit event - ${event.title}`,
                  type: "events",
                  data: {
                    id: event.id,
                  },
                }));
              }
            })
            .on("contextmenu", (evt: MouseEvent) => {
              evt.preventDefault();
              setContextMenu({
                event: evt as any,
                items:
                  id || IS_PUBLIC
                    ? [
                        {
                          id: "1",
                          title: "Preview event",
                          icon: IconEnum.eye,
                          onClick: () =>
                            setDrawer((prev) => ({
                              ...prev,
                              title: "Preview event",
                              type: "entity_preview",
                              data: {
                                id: event.id,
                                parent_id: event.parent_id,
                                entity_type: "events",
                              },
                              size: "lg",
                            })),
                        },
                      ]
                    : [
                        {
                          id: "1",
                          title: "Edit event",
                          icon: IconEnum.add,
                          isDisabled: !hasActionPermission(
                            isProjectOwner,
                            user?.id === event?.owner_id,
                            permissions,
                            event?.permissions || [],
                            "update_events",
                            user?.role?.id
                          ),
                          onClick: () =>
                            setDrawer((prev) => ({
                              ...prev,
                              title: "Edit event",
                              type: "events",
                              data: {
                                id: event.id,
                                parent_id: event.parent_id,
                              },
                              size: "lg",
                            })),
                        },
                        {
                          id: "2",
                          title: "Delete event",
                          isDisabled: !hasActionPermission(
                            isProjectOwner,
                            user?.id === event?.owner_id,
                            permissions,
                            event?.permissions || [],
                            "delete_events",
                            user?.role?.id
                          ),
                          icon: IconEnum.trash,
                          onClick: () => {
                            deleteEvent({
                              data: {
                                id: event.id,
                                parent_id: event.parent_id,
                              },
                            });
                          },
                        },
                      ],
              });
            })
            .on("mouseover", (evt: MouseEvent) => {
              const tooltipNode = tooltip.node();
              if (tooltipNode) {
                tooltip.style("display", "block");
                computePosition(evt.currentTarget, tooltipNode, {
                  middleware: [offset({ mainAxis: 10 }), autoPlacement()],
                }).then(({ x: xPos, y: yPos }) => {
                  tooltip
                    .style("transform", `translate(${xPos || 0}px, ${yPos || 0}px)`)
                    .html(`${event.title} ${event.date_string}`);
                });
              }

              // // Activate tooltip only if the text of the event
              // // has an ellipsis i.e. isn't fully visible
              // if (
              //   evt.currentTarget.parentElement?.lastChild?.lastChild?.textContent === "..." ||
              //   !evt.currentTarget.parentElement?.lastChild?.firstChild?.textContent?.length
              // )
              //  ;
            })
            .on("mouseout", () => {
              tooltip.style("display", "none");
            })
            .attr("width", bar_width)
            .attr("height", 30)
            .attr("class", "event-bar")
            .attr("x", x(event.start_x))
            .attr("y", j * 30 + 80)
            .attr("cursor", "pointer")
            .style("fill", event.background_color);

          event_bar
            .append("text")
            .attr("pointer-events", "none")
            .attr("class", "event-text")
            .attr("width", bar_width - 10)
            .text(() => {
              const title = `${event.title} ${event.date_string}`;
              if (title.length > bar_width - 10) {
                return `${title.slice(0, title.length / 2)}...`;
              }
              return title;
            })
            .attr("fill", "white")
            .attr("x", x(event.start_x) + 10)
            .attr("y", j * 30 + 100);
        });

        points.forEach((event) => {
          groupForCircles
            .append("g")
            .append("circle")
            .attr("class", "cursor-pointer")
            .attr("cx", x(event.x))
            .attr("cy", y(event.y))
            .attr("r", CIRCLE_RADIUS)
            .style("fill", event.background_color)
            .style("stroke", "white")
            .style("stroke-opacity", "20%")
            .on("mouseover", (evt: MouseEvent) => {
              tooltip
                .style("display", "block")
                .style(
                  "transform",
                  `translate(${Number(evt.currentTarget.getAttribute("cx")) + 5 || 0}px, ${
                    Number(evt.currentTarget.getAttribute("cy")) || 0
                  }px)`
                )
                .html(event.title);
            })
            .on("mouseout", () => {
              tooltip.style("display", "none");
            })
            .on("click", () => {
              if (
                hasActionPermission(
                  isProjectOwner,
                  user?.id === event?.owner_id,
                  permissions,
                  event?.permissions || [],
                  "update_events",
                  user?.role?.id
                )
              ) {
                setDrawer((prev) => ({
                  ...prev,
                  size: "lg",
                  title: `Edit event - ${event.title}`,
                  type: "events",
                  data: {
                    id: event.id,
                  },
                }));
              }
            })
            .on("contextmenu", (evt: MouseEvent) => {
              evt.preventDefault();
              setContextMenu({
                event: evt as any,
                items:
                  id || IS_PUBLIC
                    ? [
                        {
                          id: "1",
                          title: "Preview event",
                          icon: IconEnum.eye,
                          onClick: () =>
                            setDrawer((prev) => ({
                              ...prev,
                              title: "Preview event",
                              type: "entity_preview",
                              data: {
                                id: event.id,
                                parent_id: event.parent_id,
                                entity_type: "events",
                              },
                              size: "lg",
                            })),
                        },
                      ]
                    : [
                        {
                          id: "1",
                          title: "Edit event",
                          icon: IconEnum.add,
                          isDisabled: !hasActionPermission(
                            isProjectOwner,
                            user?.id === event?.owner_id,
                            permissions,
                            event?.permissions || [],
                            "update_events",
                            user?.role?.id
                          ),
                          onClick: () =>
                            setDrawer((prev) => ({
                              ...prev,
                              title: "Edit event",
                              type: "events",
                              data: {
                                id: event.id,
                                parent_id: event.parent_id,
                              },
                              size: "lg",
                            })),
                        },
                        {
                          id: "2",
                          title: "Delete event",
                          isDisabled: !hasActionPermission(
                            isProjectOwner,
                            user?.id === event?.owner_id,
                            permissions,
                            event?.permissions || [],
                            "delete_events",
                            user?.role?.id
                          ),
                          icon: IconEnum.trash,
                          onClick: () => {
                            deleteEvent({
                              data: {
                                id: event.id,
                                parent_id: event.parent_id,
                              },
                            });
                          },
                        },
                      ],
              });
            });
        });

        d3.selectAll(".event-text").call(truncateLongEventText);

        svg.on("mousemove", (e: MouseEvent) => {
          highlighter.attr(
            "transform",
            `translate(${clamp({
              min: 0,
              max: Infinity,
              // Additional 32 for sidebar width on large screens
              value:
                e.clientX +
                scrollContainer.current.scrollLeft -
                (document.body.clientWidth - timelineLayoutContainer.current.clientWidth) / 2 -
                (isLg && !IS_PUBLIC ? 32 : 0),
            })}, 0)`
          );
        });
        const ticks = d3.selectAll(".axis--x .tick text");
        // @ts-ignore
        ticks.attr("class", (d: number) => {
          return `_${d + 1}`;
        });
      }

      return () => {
        d3.select(timelineContainer.current).select("#groupForEras").remove();
        d3.select(timelineContainer.current).select("#groupForBars").remove();
        d3.select(timelineContainer.current).select("#groupForCircles").remove();
        d3.select(".axis--x").remove();
        d3.select(timelineContainer.current).select(".axis--y").remove();
        d3.select(timelineContainer.current).select(".highlighter").remove();
        d3.select(timelineContainer.current).select(".tooltip").remove();
        d3.select(timelineContainer.current).select(".year-highlighter-text").remove();
      };
    }
    return () => {};
  }, [events, zoom, numberOfTicks]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const tick = document.querySelector(`._${goToYear}`);
      if (tick) {
        tick.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      } else {
        let closestTick: Element | null = null;

        for (let index = goToYear; index < borders.end; index += 1) {
          const t = document.querySelector(`._${index}`);
          if (t) {
            closestTick = t;
            break;
          }
        }
        if (closestTick) {
          closestTick.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [goToYear]);

  return (
    <div ref={timelineLayoutContainer} className="flex h-full flex-col gap-y-2">
      <div className="flex w-full items-center gap-x-1">
        <div className="h-10 w-10 self-end">
          <Button
            icon={IconEnum.remove}
            isDisabled={zoom === 2}
            onClick={() => changeZoom("out", setZoom, item_id as string)}
          />
        </div>
        <div className="h-10 w-10 self-end">
          <Button icon={IconEnum.add} isDisabled={zoom === 100} onClick={() => changeZoom("in", setZoom, item_id as string)} />
        </div>
        <div className="w-20">
          <Select
            label="Zoom"
            name="zoom"
            onChange={({ value }) => {
              setZoom(Number(value || 2));
              ls.set(`timeline_${id}_zoom`, Number(value || 2));
            }}
            options={timelineZoomOptions}
            value={zoom.toString()}
          />
        </div>
        <div className="w-20">
          <Input
            label="Go to year"
            min={-Infinity}
            name="goToYear"
            onChange={({ value }) => {
              setGoToYear(Number(value));
            }}
            type="number"
            value={goToYear}
          />
        </div>
      </div>
      <div
        ref={scrollContainer}
        className={`relative ${isLg ? "max-h-[calc(78%)]" : "max-h-[calc(75%)]"} scrollbar-thick w-full max-w-full flex-1 overflow-x-auto`}>
        <div ref={container} className="hidden w-fit" />
        {/* min-w-1 is required so that the SVG element has minimum clientWidth which is a condition for rendering the timeline */}
        <div
          className="min-w-full"
          style={{
            height: events.length * 50,
            minHeight: "100%",
            width: `${zoom * numberOfTicks}rem`,
          }}>
          {events.length ? (
            <>
              <svg className="sticky top-0 h-8 w-full min-w-full max-w-fit bg-black" id="xAxisContainer" />
              <svg ref={timelineContainer} className="block min-h-full w-full min-w-full overflow-y-auto bg-zinc-900" />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
