export function removeFalsy(object: { [key: string]: any }) {
  return Object.keys(object).reduce((accumulator: { [key: string]: any }, key) => {
    if (object[key]) {
      accumulator[key] = object[key];
    }

    return accumulator;
  }, {});
}

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
