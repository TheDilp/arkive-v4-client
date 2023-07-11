import cloneDeep from "lodash.clonedeep";
import pick from "lodash.pick";
import set from "lodash.set";
import { useState } from "react";

export function useHandleChange({ data, setData }: { data: any; setData: any }) {
  const [changedFields, setChangedFields] = useState<any[]>([]);
  const [changedData, setChangedData] = useState<any>();
  const handleChange = ({ name, value }: { name: string; value: any | any[] }) => {
    const changedFieldsUpdated = [...changedFields];
    if (!changedFields.includes(name)) {
      changedFieldsUpdated.push(name);
      setChangedFields(changedFieldsUpdated);
    }

    const updatedData = cloneDeep(data);
    set(updatedData, name, value);
    setData(updatedData);

    setChangedData(pick(updatedData, changedFieldsUpdated));
  };

  function resetChanges() {
    setChangedFields([]);
    setChangedData(null);
  }

  return { handleChange, changedData, resetChanges };
}
