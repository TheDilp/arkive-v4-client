import { elementScroll, useVirtualizer, VirtualizerOptions } from "@tanstack/react-virtual";
import { useSetAtom } from "jotai";
import { MutableRefObject, useCallback, useRef } from "react";

import { Tooltip } from "../../components";
import { EventType } from "../../types";
import { DefaultTagColor, drawerAtom } from "../../utils";

type TimelineDataItem = {
  id: string;
  start_year: number;
  end_year: number;
  label: string;
  color: string;
  top?: number;
  parent_id?: string;
  children: TimelineDataItem[];
};

const data: TimelineDataItem[] = [];

function getRandomColor() {
  const colors = ["red", "green", "blue", "yellow", "orange", "purple", "pink", "brown"];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

for (let i = 0; i <= 250; i += 1) {
  const randomstart_year = Math.floor(Math.random() * Math.random() * Math.random() * 1000);
  const randomend_year =
    Math.floor(Math.random() * Math.random() * (Math.random() * 1000)) + Math.floor(Math.random() * (20 - randomstart_year));
  const randomColor = getRandomColor();
  const newEvent = {
    id: i.toString(),
    start_year: randomstart_year,
    end_year: randomend_year,
    label: "test",
    color: randomColor,
    children: [],
  };
  if (i > 1 && data?.[i - 1]) {
    if (data[i - 1].end_year * 10 > newEvent.start_year * 10 && data[i - 1].end_year * 10 > newEvent.end_year * 10) {
      data.push({
        id: i.toString(),
        start_year: randomstart_year,
        end_year: randomend_year,
        label: `Event ${i}`,
        color: randomColor,
        children: [],
        parent_id: data[i - 1].id,
      });
    } else {
      data.push({
        id: i.toString(),
        start_year: randomstart_year,
        end_year: randomend_year,
        label: `Event ${i}`,
        color: randomColor,
        children: [],
      });
    }
  } else {
    data.push({
      id: i.toString(),
      start_year: randomstart_year,
      end_year: randomend_year,
      label: `Event ${i}`,
      color: randomColor,
      children: [],
    });
  }
}

function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * t - 1 * t * t * t * t;
}

function getEventWidth(
  start_month: number,
  end_month: number,
  number_of_months: number,
  start_year: number,
  end_year: number,
  month_ratio: number,
) {
  if (!end_year || (!end_month && end_month !== 0)) {
    return month_ratio;
  }
  const first_year_duration = number_of_months - start_month;
  const last_year_duration = end_month + 1;
  const year_difference = end_year - start_year;
  const total_months =
    year_difference > 1
      ? first_year_duration + last_year_duration + year_difference * number_of_months
      : first_year_duration + last_year_duration;

  return `${month_ratio * total_months}px`;
}

function getMonthOffset(start_month: number = 0, month_count: number = 1) {
  return (20 * start_month) / month_count;
}

const eventHeight = 32;

export function TimelineView({ events, month_count }: { events: EventType[]; month_count: number }) {
  const positionedEvents = (events || []).sort((a, b) => {
    if (a.start_year === b.start_year) {
      if (!a.end_year && !!b.end_year) return -1;
      if (!!a.end_year && !b.end_year) return 1;
      if (!!a.end_year && !!b.end_year) {
        if (a.end_year < b.end_year) return -1;
        if (a.end_year > b.end_year) return 1;
        if (a.start_month === b.start_month) {
          if (!a.end_month && !!b.end_month) return 1;
          if (!!a.end_month && !b.end_month) return -1;
          if (!!a.end_month && !!b.end_month) return a.end_month - b.end_month;
          return 0;
        }
        return a.start_month - b.start_month;
      }
      return 0;
    }
    return a.start_year - b.start_year;
  });
  const month_ratio = (5 * month_count) / 12;
  const setDrawer = useSetAtom(drawerAtom);
  const ref = useRef() as MutableRefObject<HTMLDivElement>;
  const scrollingRef = useRef<number>();
  const scrollToFn: VirtualizerOptions<any, any>["scrollToFn"] = useCallback((offset, canSmooth, instance) => {
    const duration = 1000;
    const start = ref?.current?.scrollTop;
    const startTime = Date.now();
    scrollingRef.current = startTime;

    function run() {
      if (scrollingRef.current !== startTime) return;
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = easeInOutQuint(Math.min(elapsed / duration, 1));
      const interpolated = start + (offset - start) * progress;

      if (elapsed < duration) {
        elementScroll(interpolated, canSmooth, instance);
        requestAnimationFrame(run);
      } else {
        elementScroll(interpolated, canSmooth, instance);
      }
    }

    requestAnimationFrame(run);
  }, []);

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => ref.current,
    estimateSize: () => eventHeight,
    count: positionedEvents.length,
    overscan: 40,
    scrollToFn,
  });
  return (
    <div ref={ref} className="h-[calc(100%-6rem)] overflow-auto pb-40">
      <div
        className="flex w-full max-w-full flex-col gap-y-2 px-4"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const width = getEventWidth(
            positionedEvents[virtualRow.index]?.start_month,
            positionedEvents[virtualRow.index]?.end_month || 0,
            month_count,
            positionedEvents[virtualRow.index]?.start_year || 0,
            positionedEvents[virtualRow.index]?.end_year || 0,
            month_ratio,
          );

          return (
            <div
              key={virtualRow.index}
              className="group flex cursor-pointer items-start"
              style={{
                height: virtualRow.size,
                position: "absolute",
                transform: `translate(${
                  20 * (positionedEvents[virtualRow.index]?.start_year || 0) +
                  getMonthOffset(positionedEvents[virtualRow.index].start_month, month_count)
                }px, ${virtualRow.start}px)`,
              }}>
              <Tooltip
                allowedPlacements={["left", "left-end", "left-start", "right", "right-end", "right-start"]}
                content={positionedEvents[virtualRow.index].title}
                variant="secondary">
                <div
                  className={`max-h-full shadow ${width === month_ratio ? "rounded-sm" : "rounded-md px-2"}`}
                  onClick={() =>
                    setDrawer((prev) => ({
                      ...prev,
                      title: "Edit event",
                      type: "events",
                      data: { id: positionedEvents[virtualRow.index].id },
                      size: "lg",
                    }))
                  }
                  onKeyDown={() => {}}
                  role="button"
                  style={{
                    height: width === month_ratio ? width : "85%",
                    position: "relative",
                    backgroundColor: positionedEvents[virtualRow.index]?.background_color || DefaultTagColor,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    minWidth: width,
                    maxWidth: width,
                    width,
                    backgroundImage: positionedEvents[virtualRow.index]?.image_id
                      ? `url(${positionedEvents[virtualRow.index]?.image_id}`
                      : "",
                  }}
                  tabIndex={-1}>
                  {width === month_ratio ? null : (
                    <div className="flex w-full max-w-full items-center font-lato">
                      <span className="truncate">
                        {positionedEvents[virtualRow.index].title}({positionedEvents[virtualRow.index].start_year} -&nbsp;
                        {positionedEvents[virtualRow.index].end_year})
                      </span>
                    </div>
                  )}
                </div>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </div>
  );
}
