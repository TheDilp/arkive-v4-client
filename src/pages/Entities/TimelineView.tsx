import * as d3 from "d3";
import groupBy from "lodash.groupby";
import { MutableRefObject, useLayoutEffect, useRef } from "react";

import { EventType, MonthType } from "../../types";

const circleRadius = 5;

export function TimelineView({ events, months }: { events: EventType[]; months: MonthType[] }) {
  const timelineContainer = useRef() as MutableRefObject<SVGSVGElement>;
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

      // Converts the month number to the timeline which has ticks that go from 1 - 10
      // which is needed if the number of months is not exactly 10
      const monthConversionFactor = monthCount / 10;

      const width = (timelineContainer?.current?.clientWidth || 1) * 2 || 1;
      const height = timelineContainer?.current?.clientHeight || 1;
      const svg = d3.select(timelineContainer.current);

      const x = d3
        .scaleLinear()
        .domain([0, yearCount])
        .range([0, width / 1.5]);
      const y = d3
        .scaleLinear()
        .domain([0, yearCount])
        .range([height / 1.5, 0]);

      const axisBottom = d3
        .axisBottom(x)
        .ticks(monthCount * yearCount)
        .tickFormat((d) => {
          return `${months[(Number(d) * 10) % monthCount].title} ${Math.floor((Number(d) * 10) / monthCount + 1)}`;
        });

      const points = events.map((e) => ({
        x: e.start_year * monthConversionFactor + e.start_day * 0.01,
        y: e.start_year,
      }));

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
          .style("fill", "purple");
      });
    }

    return () => {
      d3.select(timelineContainer.current).select("#groupForCircles").remove();
      d3.select(timelineContainer.current).select(".axis--x").remove();
    };
  }, [events]);

  return (
    <div className="h-full w-full max-w-full overflow-x-auto overflow-y-hidden">
      <div className="h-full w-[200%] ">
        {events.length ? <svg ref={timelineContainer} className="block h-full min-w-full bg-zinc-900 p-2" /> : null}
      </div>
    </div>
  );
}
