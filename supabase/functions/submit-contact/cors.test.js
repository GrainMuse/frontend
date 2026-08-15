import assert from "node:assert/strict";
import test from "node:test";
import { preflightResponse } from "./cors.js";

test("returns a successful browser preflight with the required CORS headers", async () => {
  const origin = "https://grainmuse.net";
  const response = preflightResponse(origin);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(response.headers.get("access-control-allow-methods"), "POST, OPTIONS");
  assert.match(
    response.headers.get("access-control-allow-headers"),
    /authorization.*apikey.*content-type/,
  );
  assert.equal(response.headers.get("vary"), "Origin");
  assert.equal(await response.text(), "ok");
});
