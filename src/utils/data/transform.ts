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
