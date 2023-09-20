export function getSearchLink(project_id: string, name: string, item_id: string, parent_id?: string) {
  let link_type = "";
  if (name === "alter_names") link_type = "documents";
  if (name === "map_pins" || name === "character_map_pins") link_type = "maps";
  if (name === "nodes" || name === "edges" || name === "boards") link_type = "graphs";
  if (name === "events") link_type = "calendars";
  if (name === "characters" || name === "documents" || name === "maps") link_type = name;
  if (link_type) return `/projects/${project_id}/${link_type}/${parent_id || item_id}${parent_id ? `/${item_id}` : ""}`;

  return "#";
}
