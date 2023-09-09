import { randPhrase } from "@ngneat/falso";
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
    Math.floor(Math.random() * Math.random() * (Math.random() * 1000)) + Math.floor(Math.random() * (50 - randomstart_year));
  const randomColor = getRandomColor();
  const newEvent = {
    id: i.toString(),
    start_year: randomstart_year,
    end_year: randomend_year,
    label: randPhrase(),
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

function getEventWidth(start_year: number = 0, end_year: number = 0) {
  if (end_year) return `${50 * ((end_year || 1) - (start_year || 0))}px`;
  return 20;
}

function getMonthOffset(start_month: number = 0, month_count: number = 1) {
  return (50 * start_month) / month_count;
}

const eventHeight = 32;

export function TimelineView({ events, month_count }: { events: EventType[]; month_count: number }) {
  const positionedEvents = (events || []).sort((a, b) => a.start_year - b.start_year);
  const setDrawer = useSetAtom(drawerAtom);
  const ref = useRef() as MutableRefObject<HTMLDivElement>;
  const scrollingRef = useRef<number>();
  const scrollToFn: VirtualizerOptions<any, any>["scrollToFn"] = useCallback((offset, canSmooth, instance) => {
    const duration = 1000;
    const start = ref?.current?.scrollTop;
    const startTime = Date.now();
    scrollingRef.current = startTime;

    const run = () => {
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
    };

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
            positionedEvents[virtualRow.index]?.start_year || 0,
            positionedEvents[virtualRow.index]?.end_year || 0,
          );

          return (
            <div
              key={virtualRow.index}
              className="group flex cursor-pointer items-start"
              style={{
                height: virtualRow.size,
                position: "absolute",
                transform: `translate(${
                  50 * (positionedEvents[virtualRow.index]?.start_year || 0) +
                  getMonthOffset(positionedEvents[virtualRow.index].start_month, month_count)
                }px, ${virtualRow.start}px)`,
              }}>
              <Tooltip
                allowedPlacements={["left", "left-end", "left-start", "right", "right-end", "right-start"]}
                content={positionedEvents[virtualRow.index].title}
                variant="secondary">
                <div
                  className={`max-h-full shadow ${width === 20 ? "rounded-sm" : "rounded-md px-2"}`}
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
                    height: width === 20 ? width : "85%",
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
                  {width === 20 ? null : (
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
