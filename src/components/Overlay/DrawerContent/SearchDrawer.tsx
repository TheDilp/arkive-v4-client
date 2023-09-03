import { useState } from "react";

import { Search } from "../../Form";

export function SearchDrawer() {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div className="flex flex-col gap-y-2">
      <Search
        name="searchTerm"
        onChange={({ value }) => setSearchTerm(value)}
        placeholder="Press enter to search entites"
        searchEntity="all"
        value={searchTerm}
      />
    </div>
  );
}
