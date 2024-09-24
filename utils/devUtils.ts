import ls from "localstorage-slim";

function toNumber(p: string): number {
  return Number(p);
}
export function semverCompare(a: string, b: string): boolean {
  const a_params = a.split(".").map(toNumber);
  const b_params = b.split(".").map(toNumber);

  if (a_params[0] > b_params[0]) return true;
  if (a_params[0] < b_params[0]) return false;
  if (a_params[1] > b_params[1]) return true;
  if (a_params[1] < b_params[1]) return false;
  if (a_params[2] > b_params[2]) return true;
  if (a_params[2] < b_params[2]) return false;
  return false;
}

export function clearLS(keys: string[]) {
  if (keys.length === 0) {
    ls.clear();
    return;
  }
  for (let index = 0; index < keys.length; index++) {
    ls.remove(keys[index]);
  }
}
