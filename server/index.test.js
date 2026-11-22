import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "./index.js";

const validTemplate = {
  title: "Weekly supply audit",
  description: "A repeatable stock and quality review.",
  targetAudience: "Field officers",
  steps: [
    {
      title: "Review stock",
      description: "Compare physical stock with the ledger.",
      role: "Field officer",
      tools: ["Stock sheet"],
    },
  ],
};

async function withServer(options, callback) {
  const server = createApp(options).listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const baseUrl = "http://127.0.0.1:" + address.port;
  try {
    await callback(baseUrl);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
}

test("health endpoint is available without exposing Gemini configuration", async () => {
  await withServer({ generate: async () => validTemplate }, async (baseUrl) => {
    const response = await fetch(baseUrl + "/api/health");
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: "ok" });
    assert.equal(response.headers.get("x-powered-by"), null);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  });
});

test("generation endpoint validates input and calls the server-side generator", async () => {
  let receivedPrompt = "";
  await withServer(
    {
      generate: async (prompt) => {
        receivedPrompt = prompt;
        return validTemplate;
      },
    },
    async (baseUrl) => {
      const empty = await fetch(baseUrl + "/api/generate-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "  " }),
      });
      assert.equal(empty.status, 400);

      const oversized = await fetch(baseUrl + "/api/generate-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "x".repeat(2001) }),
      });
      assert.equal(oversized.status, 400);

      const response = await fetch(baseUrl + "/api/generate-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "  audit field supplies  " }),
      });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), validTemplate);
      assert.equal(receivedPrompt, "audit field supplies");
    }
  );
});

test("generation endpoint rejects unapproved browser origins", async () => {
  await withServer(
    {
      allowedOrigins: ["https://fortify.example"],
      generate: async () => validTemplate,
    },
    async (baseUrl) => {
      const response = await fetch(baseUrl + "/api/generate-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://attacker.example",
        },
        body: JSON.stringify({ prompt: "Create a process" }),
      });
      assert.equal(response.status, 403);
    }
  );
});

test("generation endpoint rate limits repeated requests", async () => {
  await withServer(
    { rateLimit: 1, windowMs: 60_000, generate: async () => validTemplate },
    async (baseUrl) => {
      const send = () =>
        fetch(baseUrl + "/api/generate-process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: "Create a process" }),
        });
      assert.equal((await send()).status, 200);
      const limited = await send();
      assert.equal(limited.status, 429);
      assert.ok(Number(limited.headers.get("retry-after")) > 0);
    }
  );
});

test("generation endpoint rejects malformed model output", async () => {
  await withServer(
    { generate: async () => ({ title: "Missing required fields", steps: [] }) },
    async (baseUrl) => {
      const response = await fetch(baseUrl + "/api/generate-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Create a process" }),
      });
      assert.equal(response.status, 502);
      assert.match((await response.json()).error, /could not be generated/i);
    }
  );
});

test("generation endpoint reports missing server configuration without exposing secrets", async () => {
  const previous = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    await withServer({}, async (baseUrl) => {
      const response = await fetch(baseUrl + "/api/generate-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Create a process" }),
      });
      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error: "Gemini is not configured on the server.",
      });
    });
  } finally {
    if (previous === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previous;
  }
});
