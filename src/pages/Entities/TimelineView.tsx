import * as d3 from "d3";
import groupBy from "lodash.groupby";
import { MouseEvent, MutableRefObject, useLayoutEffect, useRef } from "react";

import { EventType, MonthType } from "../../types";
import { DefaultTagColor } from "../../utils";

const circleRadius = 5;
const XAXISOFFSET = 20;

export function TimelineView({ events, months }: { events: EventType[]; months: MonthType[] }) {
  const timelineContainer = useRef() as MutableRefObject<SVGSVGElement>;
  const container = useRef() as MutableRefObject<HTMLDivElement>;
  // const firstRender = useRef(true);
  useLayoutEffect(() => {
    if (
      timelineContainer.current &&
      events.length &&
      timelineContainer?.current?.clientWidth &&
      timelineContainer?.current?.clientHeight
    ) {
      const groupedEvents: Record<string, EventType[]> = groupBy(events, "start_year");
      const monthCount = months.length;
      const yearCount = Math.max(...(Object.keys(groupedEvents).map((key) => Number(key)) as number[]));
      const padding = 100;
      const width = (timelineContainer?.current?.clientWidth || 1) * 2 || 1;
      const height = timelineContainer?.current?.clientHeight || 1;
      const svg = d3.select(timelineContainer.current);

      const x = d3
        .scaleLinear()
        .domain([0, yearCount * monthCount * 2])
        .range([XAXISOFFSET, width / 2 - XAXISOFFSET]);
      const y = d3
        .scaleLinear()
        .domain([0, yearCount * 2])
        .range([height / 1.5, 0]);

      const axisBottom = d3
        .axisBottom(x)
        .ticks(yearCount * monthCount * 2)
        .tickSize(10)
        .tickFormat((d) => {
          return `${months[Number(d) % monthCount].title} ${Math.floor(Number(d) / monthCount) + 1}`;
        });

      // ! CHANGE TO ONLY BE EVENTS WITHOUT END DAY
      const points = events.map((e) => {
        // const eventMonth = months?.[e.start_month];
        // console.log(e);
        return {
          x: (e.start_year - 1) * monthCount + e.start_month + e.start_day * 0.01,
          y: e.start_year + 0.5,
          background_color: e.background_color || DefaultTagColor,
        };
      });
      svg
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height / 1.05})`)
        .call(axisBottom);

      const groupForCircles = svg.append("g").attr("id", "groupForCircles");
      points.forEach((e) => {
        groupForCircles
          .append("g")
          .append("circle")
          .attr("cx", x(e.x))
          .attr("cy", y(e.y))
          .attr("r", circleRadius)
          .style("fill", e.background_color);
      });

      const highlighter = svg
        .append("rect")
        .attr("class", "highlighter")
        .attr("height", height)
        .attr("width", width)
        .style("pointer-events", "all")
        .style("fill", "none")
        .on("mouseover", (e: MouseEvent) => {
          e.currentTarget.classList.add("stroke-blue-400", "w-[1px]", "absolute");
        })
        .on("mouseout", () => {});
      svg.on("mousemove", (e: MouseEvent) => {
        highlighter.attr("transform", `translate(${e.clientX + container.current.scrollLeft - padding + 20}, 0)`);
      });
    }

    return () => {
      d3.select(timelineContainer.current).select("#groupForCircles").remove();
      d3.select(timelineContainer.current).select(".axis--x").remove();
      d3.select(timelineContainer.current).select(".highlighter").remove();
    };
  }, [events]);

  return (
    <div ref={container} className="h-full w-full max-w-full overflow-x-auto overflow-y-hidden">
      <div className="h-full w-[200%]">
        {events.length ? <svg ref={timelineContainer} className="block h-full min-w-full bg-zinc-900" /> : null}
      </div>
    </div>
  );
}
