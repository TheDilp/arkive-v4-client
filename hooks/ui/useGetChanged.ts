import { useAtom } from "jotai";
import cloneDeep from "lodash.clonedeep";
import set from "lodash.set";
import { useState } from "react";

import { HandleChangePropsType } from "../../types";
import { hasChangedDataAtom } from "../../utils";

export function useHandleChange({ data, setData, ignoreDataChange }: { data: any; setData: any; ignoreDataChange?: boolean }): {
  handleChange: (props: HandleChangePropsType) => void;
  changedData: boolean;
  resetChanges: () => void;
} {
  const [changedData, setHasChangedData] = useAtom(hasChangedDataAtom);
  const [changedFields, setChangedFields] = useState<any[]>([]);
  const updatedData = cloneDeep(data);
  function handleChange(newData: HandleChangePropsType) {
    const changedFieldsUpdated = [...changedFields];

    if (Array.isArray(newData)) {
      for (let index = 0; index < newData.length; index += 1) {
        const { name, value } = newData[index];
        const formattedName = name;

        if (!changedFields.includes(formattedName)) {
          changedFieldsUpdated.push(formattedName);
        }
        set(updatedData, name, value);
      }
    } else {
      const { name, value } = newData;
      const formattedName = name.includes("[") || name.includes("]") ? name.split("[")[0] : name;

      if (!changedFields.includes(formattedName)) {
        changedFieldsUpdated.push(formattedName);
        setChangedFields(changedFieldsUpdated);
      }
      set(updatedData, name, value);
    }

    setData(updatedData);
    setChangedFields(changedFieldsUpdated);

    if (!changedData && !ignoreDataChange) setHasChangedData(true);
  }

  function resetChanges() {
    setChangedFields([]);
    setHasChangedData(false);
  }

  return { handleChange, changedData, resetChanges };
}
