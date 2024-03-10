export function createOrEditPermission(
  create: boolean | undefined,
  edit: boolean | undefined,
  is_owner: boolean | undefined,
  id: string | undefined,
): boolean {
  if (is_owner) return true;
  if (create && !id) return true;
  if (edit && id) return true;
  return false;
}
