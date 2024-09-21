import {
  CharacterFilter,
  CharacterFilterField,
  CharacterType,
  FieldTypes,
  RequestFilterType,
  TableDispatch,
} from "../../types";
import { getFieldValueFromType } from "./entityUtils";

export function sortCharacters(a: Pick<CharacterType, "full_name">, b: Pick<CharacterType, "full_name">) {
  if (a.full_name !== undefined && b.full_name === undefined) return -1;
  if (a.full_name === undefined && b.full_name !== undefined) return 1;
  if (!!a.full_name && !!b.full_name) {
    if (a.full_name < b.full_name) return -1;
    if (a.full_name > b.full_name) return 1;
    return 0;
  }
  return 0;
}

function formatCharacterFilter(field: CharacterFilterField): RequestFilterType {
  return {
    id: field.field_id || field.field_type,
    field: getFieldValueFromType(field.field_type as FieldTypes) || field.field_type || "",
    operator: field.filter.operator,
    header_name: field?.filter?.header_name || field.title,
    value: field.filter.value,
    relationalData: { character_field_id: field.field_id, label: field?.filter?.relationalData?.label },
  };
}

export function applyCharacterFilter(filters: CharacterFilter[], dispatch: TableDispatch<CharacterType>) {
  const andFields = filters.flatMap((f) => f.fields.and);
  const orFields = filters.flatMap((f) => f.fields.or);

  const and = andFields.map(formatCharacterFilter);
  const or = orFields.map(formatCharacterFilter);
  dispatch({ type: "setRelationFilters", payload: { and, or } });
}
