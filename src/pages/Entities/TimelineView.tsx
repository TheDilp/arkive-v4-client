import * as d3 from "d3";
import { useAtomValue, useSetAtom } from "jotai";
import groupBy from "lodash.groupby";
import { MouseEvent, MutableRefObject, useLayoutEffect, useRef, useState } from "react";

import { useBreakpoint } from "../../hooks";
import { EraType, EventType, MonthType } from "../../types";
import { DefaultTagColor, drawerAtom, getDayOrdinal, userAtom } from "../../utils";

const CIRCLE_RADIUS = 5;
const X_AXIS_OFFSET = 20;

function truncateLongEventText(texts: any) {
  // eslint-disable-next-line func-names
  texts.each(function () {
    // @ts-ignore
    const text = d3.select(this);
    const words = text.text().split(/\s+/);

    const ellipsis = text.text("").append("tspan").attr("class", "elip").text("...");
    const width = parseFloat(text.attr("width")) - (ellipsis?.node()?.getComputedTextLength() ?? 0);
    const numWords = words.length;

    const tspan = text.insert("tspan", ":first-child").text(words.join(" "));

    // Try the whole line
    // While it's too long, and we have words left, keep removing words

    while ((tspan?.node()?.getComputedTextLength() ?? 10) > width && words.length) {
      words.pop();
      tspan.text(words.join(" "));
    }

    if (words.length === numWords) {
      ellipsis.remove();
    }
  });
}

function getYearsOnlyEventWidth(event: EventType | EraType, monthCount: number): number {
  const yearDifference = Number(event.end_year ?? 0) - event.start_year;
  const monthDifference = monthCount === 1 ? 0 : (Number(event.end_month ?? 0) - event.start_month) / (monthCount - 1);

  return yearDifference + Math.abs(monthDifference);
}

export function TimelineView({ events, months, eras }: { events: EventType[]; months: MonthType[]; eras: EraType[] }) {
  const user = useAtomValue(userAtom);
  const [zoom] = useState(2);
  const setDrawer = useSetAtom(drawerAtom);
  const timelineContainer = useRef() as MutableRefObject<SVGSVGElement>;
  const container = useRef() as MutableRefObject<HTMLDivElement>;
  const scrollContainer = useRef() as MutableRefObject<HTMLDivElement>;
  const { isLg } = useBreakpoint();

  // const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (
      timelineContainer.current &&
      events.length &&
      timelineContainer?.current?.clientWidth &&
      timelineContainer?.current?.clientHeight
    ) {
      // Calendar constants
      const groupedEvents: Record<string, EventType[]> = groupBy(events, "start_year");
      const monthCount = months.length;
      const yearCount = Math.max(...(Object.keys(groupedEvents).map((key) => Number(key)) as number[]));
      const isYearsOnly = yearCount > 5;
      const endRange = yearCount * (isYearsOnly ? 1 : monthCount) * (zoom / 2);
      // Graphics constants
      const padding = 100;
      const width = timelineContainer?.current?.clientWidth || 1 || 1;
      const height = timelineContainer?.current?.clientHeight || 1;
      const svg = d3.select(timelineContainer.current);
      const x = d3
        .scaleLinear()
        .domain([0, endRange])
        .range([0, width - X_AXIS_OFFSET]);
      const y = d3
        .scaleLinear()
        .domain([0, yearCount * 2])
        .range([height / 1.5, 0]);

      const axisBottom = d3
        .axisBottom(x)
        .ticks(endRange)
        .tickSize(10)
        .tickFormat((d) => {
          if (isYearsOnly) return ((d as number) + 1).toString();
          return `${months[Number(d) % monthCount].title} ${Math.floor(Number(d) / monthCount) + 1}`;
        });

      const eraBars = eras
        .filter((e) => e.start_year <= endRange)
        .map((e, i) => {
          return {
            x: isYearsOnly ? e.start_year - 1 : (e.start_year - 1) * monthCount + e.start_month + e.start_day * 0.01,
            y: e.start_year + Math.floor(i / 10) * 30,
            width: isYearsOnly
              ? getYearsOnlyEventWidth(e, monthCount)
              : Number(e?.end_year ?? 0) - e.start_year + Math.abs(Number(e?.end_month ?? 0) - e.start_month),
            background_color: e.color || DefaultTagColor,
            title: `${e.title} (${e.start_day}${getDayOrdinal(e.start_day)} ${months[e.start_month].title} ${e.start_year} - ${
              e.end_day || ""
            }${e.end_day ? getDayOrdinal(e.end_day) : ""} ${months[e.end_month || 0].title} ${e.end_year || ""})`,
          };
        });

      // ! CHANGE TO ONLY BE EVENTS WITHOUT END DAY
      const points = events
        .filter((e) => !e.end_year)
        .map((e, i) => {
          return {
            id: e.id,
            x: isYearsOnly
              ? e.start_year - 1 + e.start_day * 0.01
              : (e.start_year - 1) * monthCount + e.start_month + e.start_day * 0.01,
            y: isYearsOnly ? e.start_day : e.start_year + e.start_month / 10 - i / 10,
            background_color: e.background_color || DefaultTagColor,
            title: `${e.title} (${e.start_day}${getDayOrdinal(e.start_day)} ${months[e.start_month].title} ${e.start_year})`,
            description: e.description,
          };
        });

      const bars = events
        .filter((e) => !!e.end_year)
        .map((e, i) => {
          return {
            id: e.id,
            start_x: isYearsOnly ? e.start_year - 1 : (e.start_year - 1) * monthCount + e.start_month + e.start_day * 0.01,
            end_x: isYearsOnly
              ? (e.end_year || 0) - 1
              : ((e.end_year || 0) - 1) * monthCount + (e.end_month || 0) + (e.end_day || 0) * 0.01,
            y: e.start_year + Math.floor(i / 10) * 30 + e.start_day,

            background_color: e.background_color || DefaultTagColor,
            title: `${e.title} (${e.start_day}${getDayOrdinal(e.start_day)} ${months[e.start_month].title} ${e.start_year} - ${
              e.end_day || ""
            }${e.end_day ? getDayOrdinal(e.end_day) : ""} ${months[e.end_month || 0].title} ${e.end_year || ""})`,
          };
        });

      svg
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height / 1.05})`)
        .call(axisBottom);

      const tooltip = d3
        .select(container.current)
        .attr("class", "tooltip absolute hidden bg-black border border-zinc-800 shadow-lg font-lato rounded p-2");

      const highlighter = svg
        .append("rect")
        .attr("class", "highlighter stroke-blue-400 w-[1px]")
        .attr("height", height)
        .attr("width", width)
        .style("pointer-events", "all")
        .style("fill", "none")
        .on("mouseout", () => {});
      svg.on("mousemove", (e: MouseEvent) => {
        highlighter.attr(
          "transform",
          `translate(${e.clientX + scrollContainer.current.scrollLeft - (isLg ? padding - 20 : 16)}, 0)`,
        );
      });

      const groupForEras = svg.append("g").attr("id", "groupForEras");
      const groupForBars = svg.append("g").attr("id", "groupForBars");
      const groupForCircles = svg.append("g").attr("id", "groupForCircles");

      (user?.feature_flags?.show_eras_in_timelines ? eraBars : []).forEach((e) => {
        const bar = groupForEras.append("g");

        bar
          .append("rect")
          .attr("width", x(e.width))
          .attr("height", height / 1.05)
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
          .attr("x", e.width)
          .attr("y", 30);
      });

      bars.forEach((e) => {
        const bar = groupForBars.append("g");
        const bar_width = x(e.end_x - e.start_x);
        bar
          .append("rect")
          .on("click", () =>
            setDrawer((prev) => ({
              ...prev,
              size: "lg",
              title: `Edit event - ${e.title}`,
              type: "events",
              data: {
                id: e.id,
              },
            })),
          )
          .attr("width", bar_width)
          .attr("height", 30)
          .attr("class", "overflow-hidden")
          .attr("x", x(e.start_x))
          .attr("y", y(e.y))
          .style("fill", e.background_color);
        bar
          .append("text")
          .attr("pointer-events", "none")
          .attr("class", "event-text")
          .attr("width", bar_width - 10)
          .text(() => {
            const title = `${e.title}`;
            if (title.length > bar_width - 10) {
              return `${title.slice(0, title.length / 2)}...`;
            }
            return title;
          })

          .attr("fill", "white")
          .attr("x", x(e.start_x) + 10)
          .attr("y", y(e.y) + 20);
      });
      points.forEach((e) => {
        groupForCircles
          .append("g")
          .append("circle")
          .attr("cx", x(e.x))
          .attr("cy", y(e.y))
          .attr("r", CIRCLE_RADIUS)
          .style("fill", e.background_color)
          .style("stroke", "white")
          .style("stroke-opacity", "20%")
          .on("mouseover", (evt: MouseEvent) => {
            tooltip
              .style("display", "block")
              .style(
                "transform",
                `translate(${Number(evt.currentTarget.getAttribute("cx")) + 5 ?? 0}px, ${
                  Number(evt.currentTarget.getAttribute("cy")) ?? 0
                }px)`,
              )
              .html(e.title);
          })
          .on("mouseout", () => {
            tooltip.style("display", "none");
          });
      });

      d3.selectAll(".event-text").call(truncateLongEventText);
    }

    return () => {
      d3.select(timelineContainer.current).select("#groupForEras").remove();
      d3.select(timelineContainer.current).select("#groupForBars").remove();
      d3.select(timelineContainer.current).select("#groupForCircles").remove();
      d3.select(timelineContainer.current).select(".axis--x").remove();
      d3.select(timelineContainer.current).select(".highlighter").remove();
      d3.select(timelineContainer.current).select(".tooltip").remove();
    };
  }, [events]);

  return (
    <div ref={scrollContainer} className="relative h-full w-full max-w-full overflow-x-auto overflow-y-hidden">
      <div ref={container} className="hidden w-fit" />
      <div
        className="h-full"
        style={{
          width: `${zoom * 500}rem`,
        }}>
        {events.length ? <svg ref={timelineContainer} className="block h-full w-full min-w-full bg-zinc-900" /> : null}
      </div>
    </div>
  );
}
