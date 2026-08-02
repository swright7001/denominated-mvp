import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../src/app/api/share-image/route";

test("share image route requires a public scenario", async () => {
  const response = await GET(
    new Request("https://denominated.test/api/share-image"),
  );

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: "Provide public calculator scenario parameters.",
  });
});

test("share image route returns a cacheable social PNG", async () => {
  const response = await GET(
    new Request(
      "https://denominated.test/api/share-image?item=Rent&currency=USD&price=2000&btc=100000&years=5&inflation=3&growth=15&type=monthly",
    ),
  );
  const image = new Uint8Array(await response.arrayBuffer());

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.match(response.headers.get("cache-control") ?? "", /s-maxage=86400/);
  assert.deepEqual([...image.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("share image route renders an accepted 90-character unbroken item name", async () => {
  const itemName = "W".repeat(90);
  const params = new URLSearchParams({
    item: itemName,
    currency: "USD",
    price: "2000",
    btc: "100000",
    years: "5",
    inflation: "3",
    growth: "15",
    type: "monthly",
  });
  const response = await GET(
    new Request(`https://denominated.test/api/share-image?${params}`),
  );
  const image = new Uint8Array(await response.arrayBuffer());

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "image/png");
  assert.deepEqual([...image.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
});

test("share image route rejects unbounded render inputs", async () => {
  const response = await GET(
    new Request(
      "https://denominated.test/api/share-image?item=Rent&price=2000&btc=100000&years=1000000&inflation=3&growth=15&type=monthly",
    ),
  );

  assert.equal(response.status, 400);
});
