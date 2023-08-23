import { expect, test } from "vitest";

import { baseURLS } from "../enums";
import { FetchFunction } from "./FetchFunction";

test("test server connection", async () => {
  const res = await FetchFunction({ url: `${baseURLS.baseServer}/health_check`, method: "GET" });
  expect(res).toMatchObject({ basecheck: true, ok: true });
});
