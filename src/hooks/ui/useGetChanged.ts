import cloneDeep from "lodash.clonedeep";
import pick from "lodash.pick";
import set from "lodash.set";
import { useState } from "react";

import { HandleChangePropsType } from "../../types";

export function useHandleChange({ data, setData }: { data: any; setData: any }) {
  const [changedFields, setChangedFields] = useState<any[]>([]);
  const [changedData, setChangedData] = useState<any>();
  const handleChange = (newData: HandleChangePropsType) => {
    const changedFieldsUpdated = [...changedFields];
    const updatedData = cloneDeep(data);

    if (Array.isArray(newData)) {
      for (let index = 0; index < newData.length; index += 1) {
        const { name, value } = newData[index];
        if (!changedFields.includes(name)) {
          changedFieldsUpdated.push(name);
        }
        set(updatedData, name, value);
      }
    } else {
      const { name, value } = newData;
      if (!changedFields.includes(name)) {
        changedFieldsUpdated.push(name);
        setChangedFields(changedFieldsUpdated);
      }
      set(updatedData, name, value);
    }
    setData(updatedData);
    setChangedFields(changedFieldsUpdated);
    setChangedData(pick(updatedData, changedFieldsUpdated));
  };

  function resetChanges() {
    setChangedFields([]);
    setChangedData(null);
  }

  return { handleChange, changedData, resetChanges };
}
