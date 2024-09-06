import { PermissionType } from "../../types";

export function deleteObjectProps(obj: { [key: string]: any }, keys: string[]) {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
}

export function deleteObjectPropsRecursive(obj: { [key: string]: any }, keys: string[]): object {
  if (Array.isArray(obj)) return obj.map((item) => deleteObjectPropsRecursive(item, keys));

  if (typeof obj === "object" && obj !== null) {
    return Object.keys(obj).reduce((previousValue, key) => {
      return keys.includes(key)
        ? previousValue
        : { ...previousValue, [key.toLowerCase()]: deleteObjectPropsRecursive(obj[key], keys) };
    }, {});
  }
  return obj;
}

export function closestDivisibleBy50(x: number, y: number): [number, number] {
  const closestX = Math.round(x / 50) * 50;
  const closestY = Math.round(y / 50) * 50;

  return [closestX, closestY];
}

export function permissionsByEntity(permissions: PermissionType[]) {
  const formatted = permissions.reduce(
    (accumulator: Record<string, { title: string; permissions: PermissionType[] }>, permission) => {
      let entity = permission.title.split(" ")[1].toLowerCase(); // Extracting the entity from the title

      // Actual main entities will be in plural
      // If they are in singular then they must be one of the following
      if (entity === "blueprint") {
        entity = "blueprint_instances";
      } else if (entity === "random") {
        entity = "random_tables";
      } else if (entity === "character") {
        entity = "character_fields_templates";
      } else if (entity === "map") {
        entity = "map_pins";
      }
      if (!accumulator[entity]) {
        accumulator[entity] = { title: entity, permissions: [] };
      }
      accumulator[entity].permissions.push(permission);
      return accumulator;
    },
    {}
  );

  return Object.values(formatted);
}

export function toIsoUtc(dateString: string) {
  return `${dateString}:00Z`;
}
