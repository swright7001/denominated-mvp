import test from "node:test";
import assert from "node:assert/strict";
import {
  buildClientErrorEvent,
  buildServerErrorEvent,
  getErrorDigest,
  getErrorKind,
} from "../src/lib/monitoring";

test("client monitoring accepts only bounded non-sensitive fields", () => {
  assert.deepEqual(
    buildClientErrorEvent({
      surface: "route",
      digest: "abc_123",
      email: "person@example.com",
      message: "calculator value was 41000",
      pathname: "/calculator?email=person@example.com",
    }),
    {
      event: "client_runtime_error",
      version: 1,
      surface: "route",
      digest: "abc_123",
    },
  );
});

test("client monitoring rejects unknown surfaces and unsafe digests", () => {
  assert.equal(buildClientErrorEvent({ surface: "checkout" }), null);
  assert.deepEqual(
    buildClientErrorEvent({ surface: "root", digest: "email@example.com" }),
    {
      event: "client_runtime_error",
      version: 1,
      surface: "root",
      digest: null,
    },
  );
});

test("server monitoring uses route templates and rejects request URLs", () => {
  assert.deepEqual(
    buildServerErrorEvent({
      digest: "digest-1",
      method: "POST",
      routePath: "/api/scenarios/[id]",
      routeType: "route",
      routerKind: "App Router",
    }),
    {
      event: "server_runtime_error",
      version: 1,
      digest: "digest-1",
      method: "POST",
      routePath: "/api/scenarios/[id]",
      routeType: "route",
      routerKind: "App Router",
    },
  );
  assert.equal(
    buildServerErrorEvent({
      routePath: "/calculator?email=person@example.com",
    }).routePath,
    null,
  );
});

test("error classification never returns the error message", () => {
  assert.equal(getErrorKind(new TypeError("secret value")), "TypeError");
  assert.equal(getErrorKind("secret value"), "UnknownError");
  assert.equal(getErrorDigest({ digest: "safe_digest" }), "safe_digest");
  assert.equal(getErrorDigest({ digest: "person@example.com" }), null);
});
