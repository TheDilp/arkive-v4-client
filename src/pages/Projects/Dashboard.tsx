import * as d3 from "d3";
import { useSetAtom } from "jotai";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Alert, EntityPreview, Icon, Select } from "../../components";
import { useBreakpoint, useGetProjectDashboard, useGetStats, useNavbarTitle } from "../../hooks";
import { AvailableEntityType, AvailableSubEntityType } from "../../types";
import {
  capitalizeFirstLetter,
  drawerAtom,
  getDefaultEntityIcon,
  getEntityLink,
  getParentEntityType,
  getPluralEntityType,
  getSentenceCase,
  SubEntityEnum,
} from "../../utils";

const graphEntityOptions = [
  "characters",
  "blueprints",
  "blueprint_instances",
  "documents",
  "maps",
  "map_pins",
  "graphs",
  "nodes",
  "calendars",
  "events",
  "dictionaries",
  "words",
  "random_tables",
  "tags",
  "images",
];

function getBarColor(i: number) {
  if (i === 0) return "fill-yellow-400";
  if (i === 1) return "fill-blue-400";
  if (i === 2) return "fill-blue-600";
  if (i === 3) return "fill-orange-400";
  if (i === 4) return "fill-red-800";
  if (i === 5) return "fill-red-600";
  if (i === 6) return "fill-green-600";
  if (i === 7) return "fill-green-500";
  if (i === 8) return "fill-gray-500";
  if (i === 9) return "fill-gray-300";
  if (i === 10) return "fill-lime-300";
  if (i === 11) return "fill-lime-400";
  if (i === 12) return "fill-violet-700";
  if (i === 13) return "fill-sky-700";
  if (i === 14) return "fill-sky-500";
  return "fill-emerald-400";
}

function createEntityStats(reff: MutableRefObject<HTMLDivElement>, data: Record<string, number>, mainEntities: string[] = []) {
  const width = reff.current.clientWidth;
  const height = reff.current.clientHeight;

  // Create SVG container
  const svg = d3.select(reff.current).append("svg").attr("width", width).attr("height", height).append("g");

  const entitiesToShow = Object.entries(data).filter(([entity]) => mainEntities.includes(entity));

  const x = d3
    .scaleBand()
    .domain(entitiesToShow.map(([entity, count]) => `${getSentenceCase(entity)} (${count})`))
    .range([20, width])
    .padding(0.125);

  const y = d3
    .scaleLinear()
    .domain([0, Math.max(...entitiesToShow.map(([, count]) => count))])
    .nice()
    .range([height - 10, 10]);

  const yAxis = d3
    .axisRight(y)
    .ticks(25)
    .tickSize(10)
    .tickFormat((d) => {
      return d.toString();
    });

  const yTicks = y.ticks();

  svg
    .selectAll(".horizontal-line")
    .data(yTicks)
    .enter()
    .append("line")
    .attr("class", "horizontal-line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .attr("stroke-dasharray", "2,2");

  // Create bars
  svg
    .selectAll(".bar")
    .data(entitiesToShow)
    .enter()
    .append("rect")
    .attr("class", (_, i) => getBarColor(i))
    .attr("x", (d) => x(`${getSentenceCase(d[0])} (${d[1]})` || "") || "")
    .attr("y", (d) => y(d[1]))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d[1] - 3));

  // Add X axis
  svg.append("g").attr("class", "x-axis").call(d3.axisBottom(x)).selectAll("text").attr("class", "axis-label");

  svg.append("g").attr("class", "y-axis").attr("transform", `translate(0,${0})`).call(yAxis);
}

function createTagEntityStats(
  reff: MutableRefObject<HTMLDivElement>,
  data: Record<string, { color: string; count: number }>,
  isLg: boolean,
) {
  const width = reff.current.clientWidth;
  const height = reff.current.clientHeight - 20;

  // Create SVG container
  const svg = d3.select(reff.current).append("svg").attr("width", width).attr("height", height).append("g");

  const entitiesToShow = Object.entries(data);

  const x = d3
    .scaleBand()
    .domain(entitiesToShow.map(([entity, item]) => `${getSentenceCase(entity)} (${item.count})`))
    .range([40, width])
    .padding(0.125);
  const y = d3
    .scaleLinear()
    .domain([0, Math.max(...entitiesToShow.map(([, item]) => item.count))])
    .nice()
    .range([height - 10, 10]);

  const yTicks = y.ticks().filter((tick) => Number.isInteger(tick));
  const yAxis = d3
    .axisRight(y)
    .ticks(25)
    .tickSize(10)
    .tickValues(yTicks)
    .tickFormat((d) => {
      return d.toString();
    });

  svg
    .selectAll(".horizontal-line")
    .data(yTicks)
    .enter()
    .append("line")
    .attr("class", "horizontal-line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", (d) => y(d))
    .attr("y2", (d) => y(d))
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .attr("stroke-dasharray", "2,2");

  // Create bars
  svg
    .selectAll(".bar")
    .data(entitiesToShow)
    .enter()
    .append("rect")
    .attr("fill", (d) => d[1].color)
    .attr("x", (d) => x(`${getSentenceCase(d[0])} (${d[1].count})` || "") || "")
    .attr("y", (d) => y(d[1].count))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d[1].count - 0.25));

  // Add X axis
  svg
    .append("g")
    .attr("class", "x-axis")
    .call(d3.axisBottom(x))
    .attr("transform", `translate(0, ${height - 25})`)
    .selectAll("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(-20,-${200}), rotate(-90)`)
    .attr("font-size", isLg ? 26 : 14)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", isLg ? "1px" : "0.2px");
  svg.append("g").attr("class", "y-axis").attr("transform", `translate(0,${0})`).call(yAxis);
}

function createTagColorStats(reff: MutableRefObject<HTMLDivElement>, data: Record<string, number>) {
  const width = reff.current.clientWidth;
  const height = reff.current.clientHeight;
  const radius = Math.min(width, height) * 0.5;
  const svg = d3
    .select(reff.current)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // @ts-ignore
  const pie = d3.pie().value((d) => d[1]);

  // @ts-ignore
  const data_ready = pie(Object.entries(data));

  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  svg
    .selectAll("slices")
    .data(data_ready)
    .join("path")
    // @ts-ignore
    .attr("d", arc)
    // @ts-ignore
    .attr("fill", (d: { data: [string] }) => {
      return d.data[0];
    })
    .attr("stroke", "black")
    .style("stroke-width", "0.5px")
    .style("opacity", 1);

  svg
    .selectAll("slices")
    .data(data_ready)
    .join("text")
    .attr("fill", "#ffffff")
    // @ts-ignore
    .attr("transform", (d) => {
      // @ts-ignore
      const pos = arc.centroid(d);
      const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      return `translate(${pos}) rotate(${(midAngle * 180) / Math.PI + 270})`;
    })
    .style("text-anchor", "middle")
    .style("font-size", 15);
}

export function Dashboard() {
  const [selectedEntities, setSelectedEntities] = useState([
    "characters",
    "blueprints",
    "blueprint_instances",
    "documents",
    "maps",
    "graphs",
    "calendars",
    "events",
    "dictionaries",
    "random_tables",
    "tags",
    "images",
    "map_pins",
    "nodes",
    "words",
  ]);
  const { project_id } = useParams();
  const { data: dashboard } = useGetProjectDashboard(project_id as string);

  const characterStatRef = useRef() as MutableRefObject<HTMLDivElement>;
  const tagEntityStatRef = useRef() as MutableRefObject<HTMLDivElement>;
  const tagColorStatRef = useRef() as MutableRefObject<HTMLDivElement>;
  const { isLg } = useBreakpoint();
  const { data: stats } = useGetStats(project_id);

  useEffect(() => {
    if (stats?.data && characterStatRef.current && tagColorStatRef.current && tagEntityStatRef.current) {
      createEntityStats(characterStatRef, stats.data, selectedEntities);
      createTagColorStats(tagColorStatRef, stats.data?.tag_colors || {});
      createTagEntityStats(tagEntityStatRef, stats.data?.tag_entities, isLg);
      return () => {
        d3.select(characterStatRef.current).select("svg").remove();
        d3.select(tagEntityStatRef.current).select("svg").remove();
        d3.select(tagColorStatRef.current).select("svg").remove();
      };
    }
    return () => {};
  }, [stats, selectedEntities]);

  const setDrawer = useSetAtom(drawerAtom);

  useNavbarTitle("Dashboard", true);

  return (
    <div className="flex max-h-full flex-col gap-y-2 overflow-auto">
      <h2 className="pb-2 font-merriweather text-xl">Continue working on...</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
        {(dashboard?.data || []).map((d, i, arr) => (
          <div
            key={d.name}
            className={`${
              i === arr.length - 1 ? "col-span-1 md:col-span-2 lg:col-span-1" : "col-span-1"
            } flex min-h-[18rem] flex-col items-center justify-start rounded bg-zinc-900 p-2 shadow-md`}>
            <h3 className="flex w-full items-center justify-center gap-x-0.5 self-start border-b border-zinc-700 pb-2 font-lato text-2xl font-bold">
              <Icon icon={getDefaultEntityIcon(d.name as AvailableEntityType)} />
              <Link
                className="transition-all duration-150 hover:text-blue-300"
                to={`/projects/${project_id}/${
                  SubEntityEnum.includes(d.name) ? getParentEntityType(d.name as AvailableSubEntityType) : d.name
                }`}>
                {capitalizeFirstLetter(getPluralEntityType(d.name as AvailableEntityType))}
              </Link>
            </h3>
            <ul className="flex w-full flex-1 flex-col items-center justify-start py-4 text-lg">
              {d.result.length ? (
                d.result.map((r) => (
                  <li key={r.id} className="w-full [&>div>span>div:has(button)]:ml-auto">
                    <EntityPreview
                      hasNoBackground
                      icon={"icon" in r ? r.icon : getDefaultEntityIcon(d.name as AvailableEntityType | AvailableSubEntityType)}
                      id={r.id}
                      image_id={"portrait_id" in r ? r.portrait_id : null}
                      link={getEntityLink(
                        project_id as string,
                        d.name as AvailableEntityType,
                        r.id,
                        "parent_id" in r ? r?.parent_id : undefined,
                      )}
                      previewAction={() =>
                        setDrawer((prev) => ({
                          ...prev,
                          title: "Preview",
                          data: {
                            id: r.id,
                            parent_id: "parent_id" in r ? r?.parent_id ?? undefined : undefined,
                            entity_type: d.name as AvailableEntityType,
                            isReadOnly: d.name === "events",
                          },
                          type: "entity_preview",
                          size: "half",
                        }))
                      }
                      title={r.title}
                      type={d.name as AvailableEntityType}
                    />
                  </li>
                ))
              ) : (
                <div className="w-full">
                  <Alert label="There is no content." variant="info-bordered" />
                </div>
              )}
            </ul>
          </div>
        ))}
      </div>
      <h2 className="pb-2 font-merriweather text-xl">Statistics</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-1 flex min-h-[48rem] flex-col items-center justify-start rounded bg-zinc-900 p-2 shadow-md md:col-span-2 lg:col-span-4">
          <h3 className="relative flex w-full items-center justify-center gap-x-0.5 self-start border-b border-zinc-700 pb-2 font-lato text-2xl font-bold">
            <span>Entity stats</span>
            <div className="absolute right-0 max-w-48 text-base font-normal">
              <Select
                isMultiple
                name="selectedEntities"
                onChange={({ value }) => setSelectedEntities(value as string[])}
                options={graphEntityOptions.map((opt) => ({ label: getSentenceCase(opt), value: opt }))}
                value={selectedEntities}
              />
            </div>
          </h3>
          <div ref={characterStatRef} className="h-full max-h-full w-full max-w-full overflow-hidden p-2" />
        </div>
        <div className="col-span-1 flex h-[48rem] max-h-[48rem] flex-col items-center justify-start rounded bg-zinc-900 p-2 shadow-md md:col-span-2 lg:col-span-4">
          <h3 className="relative flex w-full items-center justify-center gap-x-0.5 self-start border-b border-zinc-700 pb-2 font-lato text-2xl font-bold">
            <span>Tag stats</span>
          </h3>
          <div ref={tagEntityStatRef} className="h-full max-h-full w-full max-w-full overflow-auto" />
        </div>
        <div className="col-span-1 flex min-h-[24rem] flex-col items-center justify-start rounded bg-zinc-900 px-2 shadow-md md:col-span-2 lg:col-span-2 lg:min-h-[48rem]">
          <h3 className="flex w-full items-center justify-center gap-x-0.5 self-start border-b border-zinc-700 pb-2 font-lato text-2xl font-bold">
            Tags by color
          </h3>
          <div ref={tagColorStatRef} className="h-full max-h-full w-full max-w-full overflow-hidden p-2" />
        </div>
      </div>
    </div>
  );
}
