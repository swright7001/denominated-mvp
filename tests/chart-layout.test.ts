import assert from "node:assert/strict";
import test from "node:test";
import { comparisonChartInitialDimension } from "../src/lib/chart-layout";

test("comparison chart starts with positive stable dimensions", () => {
  assert.ok(comparisonChartInitialDimension.width > 0);
  assert.ok(comparisonChartInitialDimension.height > 0);
  assert.equal(
    comparisonChartInitialDimension.width /
      comparisonChartInitialDimension.height,
    2,
  );
});
