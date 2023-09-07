import { randPhrase } from "@ngneat/falso";
import { elementScroll, useVirtualizer, VirtualizerOptions } from "@tanstack/react-virtual";
import { useSetAtom } from "jotai";
import ls from "localstorage-slim";
import { MutableRefObject, useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { Button, Select } from "../../components";
import { TimelineDirectionType, TimelineViewType } from "../../types";
import { drawerAtom, IconEnum } from "../../utils";

type TimelineDataItem = {
  id: string;
  startYear: number;
  endYear: number;
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
  const randomStartYear = Math.floor(Math.random() * Math.random() * Math.random() * 1000);
  const randomEndYear =
    Math.floor(Math.random() * Math.random() * (Math.random() * 1000)) + Math.floor(Math.random() * (100 - randomStartYear));
  const randomColor = getRandomColor();
  const newEvent = {
    id: i.toString(),
    startYear: randomStartYear,
    endYear: randomEndYear,
    label: randPhrase(),
    color: randomColor,
    children: [],
  };
  if (i > 1 && data?.[i - 1]) {
    if (data[i - 1].endYear * 10 > newEvent.startYear * 10 && data[i - 1].endYear * 10 > newEvent.endYear * 10) {
      data.push({
        id: i.toString(),
        startYear: randomStartYear,
        endYear: randomEndYear,
        label: `Event ${i}`,
        color: randomColor,
        children: [],
        parent_id: data[i - 1].id,
      });
    } else {
      data.push({
        id: i.toString(),
        startYear: randomStartYear,
        endYear: randomEndYear,
        label: `Event ${i}`,
        color: randomColor,
        children: [],
      });
    }
  } else {
    data.push({
      id: i.toString(),
      startYear: randomStartYear,
      endYear: randomEndYear,
      label: `Event ${i}`,
      color: randomColor,
      children: [],
    });
  }
}

function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * t - 1 * t * t * t * t;
}

function getEventWidth(startYear: number = 0, endYear: number = 0) {
  return 10 * ((endYear || 0) - (startYear || 0));
}

function getEventPosition(item: TimelineDataItem, index: number, array: TimelineDataItem[]) {
  let top = 0;
  let i = index - 1;
  let parent_count = 0;
  while (i <= index - 1 && i > -1) {
    if (array[i].startYear * 10 >= array[index].endYear * 10 || array[i].endYear * 10 <= array[index].startYear * 10) {
      parent_count += 1;
    } else break;
    i -= 1;
  }

  top = parent_count ? (array[i]?.top || 0) + parent_count * 32 : 0;
  parent_count = 0;

  return { ...item, top };
}

const positionedData = data
  .filter((i) => i.endYear - i.startYear >= 8)
  .sort((a, b) => a.startYear - b.startYear)
  .map(getEventPosition);

const eventHeight = 32;

export function TimelineView() {
  const { project_id } = useParams();
  const [view, setView] = useState<TimelineViewType>("gantt");
  const [direction, setDirection] = useState<TimelineDirectionType>(null);

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
    count: positionedData.length,
    overscan: 40,
    scrollToFn,
  });

  return (
    <div>
      <div className="sticky top-0 flex w-full items-center justify-end gap-x-2 pb-2">
        <div className="w-32">
          <Select
            name="view"
            onChange={({ value }) => {
              setView(value as TimelineViewType);
              ls.set("timeline_view", value);
            }}
            options={[
              { label: "Gantt", value: "gantt", icon: IconEnum.timeline_gantt },
              { label: "Card", value: "card", icon: IconEnum.card },
              { label: "Simple", value: "simple", icon: IconEnum.timeline },
            ]}
            placeholder="View"
            value={view}
          />
        </div>
        <div className="w-36">
          <Select
            isDisabled={view === "gantt"}
            name="direction"
            onChange={({ value }) => {
              setDirection(value as TimelineDirectionType);
              ls.set("timeline_direction", value);
            }}
            options={[
              { label: "Horizontal", value: "horizontal", icon: IconEnum.horizontal },
              { label: "Vertical", value: "vertical", icon: IconEnum.vertical },
            ]}
            placeholder="Direction"
            value={direction}
          />
        </div>
        <div className="w-fit">
          <Button
            icon={IconEnum.add}
            label="Create new event"
            onClick={() =>
              setDrawer((prev) => ({
                ...prev,
                data: { project_id },
                title: "Create new event",
                type: "characters",
                size: "lg",
              }))
            }
          />
        </div>
      </div>
      <div>
        <div ref={ref} className="h-fit max-h-screen overflow-auto pb-40">
          <div
            className="flex w-full max-w-full flex-col gap-y-2 px-4"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => (
              <div
                key={virtualRow.index}
                className="group flex cursor-pointer items-start"
                style={{
                  height: virtualRow.size,
                  position: "absolute",
                  transform: `translate(${10 * (positionedData[virtualRow.index]?.startYear || 0)}px, ${
                    virtualRow.start - (positionedData[virtualRow.index]?.top || 0)
                  }px)`,
                }}>
                <div
                  className="max-h-full truncate rounded-md px-2 shadow "
                  style={{
                    height: "85%",
                    position: "relative",
                    backgroundColor: positionedData[virtualRow.index]?.color,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    minWidth: getEventWidth(
                      positionedData[virtualRow.index]?.startYear || 0,
                      positionedData[virtualRow.index]?.endYear || 0,
                    ),
                    backgroundImage:
                      virtualRow.index % 7 === 0
                        ? "url(https://images.unsplash.com/photo-1542401886-65d6c61db217?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80)"
                        : "",
                  }}>
                  <h4 className="flex w-full items-center truncate font-lato">{positionedData[virtualRow.index].label}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
