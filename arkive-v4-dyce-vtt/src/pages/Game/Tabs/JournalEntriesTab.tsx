import { useSetAtom } from "jotai";

import { Button } from "../../../../../components";
import { drawerAtom, IconEnum } from "../../../../../utils";

export function JournalEntriesTab() {
  const setDrawer = useSetAtom(drawerAtom);
  return (
    <div className="flex flex-col items-end gap-y-2 px-2 py-4">
      <div className="w-min">
        <Button
          icon={IconEnum.add}
          label="New"
          onClick={() => {
            setDrawer((prev) => ({
              ...prev,
              title: "Create journal entry",
              size: "half",
              type: "journal_entries",
              data: {},
            }));
          }}
          variant="info"
        />
      </div>
    </div>
  );
}
