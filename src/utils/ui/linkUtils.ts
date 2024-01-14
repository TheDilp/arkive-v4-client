export function getEntityLink(
  project_id: string,
  name: string,
  item_id: string,
  parent_id?: string | null,
  isPublic?: boolean,
) {
  if (name === "") return "#";
  const linkRoot = isPublic ? "public" : "projects";
  if (name === "characters") {
    return `/${linkRoot}/${project_id}/characters/${parent_id || item_id}${parent_id ? `/${item_id}` : ""}/resources`;
  }
  if (name === "blueprint_instances") {
    return `/${linkRoot}/${project_id}/blueprints/${parent_id || item_id}${parent_id ? `/${item_id}` : ""}/resources`;
  }
  let link_type = "";
  if (name === "alter_names") link_type = "documents";
  if (name === "words") link_type = "dictionaries";
  if (name === "map_pins" || name === "character_map_pins") link_type = "maps";
  if (name === "nodes" || name === "edges" || name === "graphs") link_type = "graphs";
  if (name === "events") link_type = "calendars";
  if (name === "documents" || name === "maps" || name === "calendars" || name === "dictionaries" || name === "blueprints")
    link_type = name;
  if (link_type) return `/${linkRoot}/${project_id}/${link_type}/${parent_id || item_id}${parent_id ? `/${item_id}` : ""}`;

  return "#";
}

export function getLinkToItem(project_id: string, type: string, id: string, is_folder?: boolean) {
  return `/projects/${project_id}/${type}/${is_folder ? "folder/" : ""}${id}`;
}

export function getMentionLink(
  id: string,
  type: string,
  project_id: string,
  is_public: boolean,
  isPublic?: boolean,
  parent_id?: string,
) {
  if (isPublic && !is_public) return "#";
  return getEntityLink(project_id, type, id, parent_id, isPublic);
}
