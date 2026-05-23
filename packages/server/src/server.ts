import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createAuraEngine, type AuraSignal } from "../../core/src";

const aura = createAuraEngine();
const port = Number(process.env.PORT ?? 8787);

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      sendJson(res, 204, {});
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, { ok: true, protocol: "aura.v1" });
      return;
    }

    if (req.method === "GET" && req.url === "/state") {
      sendJson(res, 200, aura.getState());
      return;
    }

    if (req.method === "POST" && req.url === "/decide") {
      const signal = (await readJson(req)) as AuraSignal;
      sendJson(res, 200, aura.decide(signal));
      return;
    }

    if (req.method === "POST" && req.url === "/update") {
      const signal = (await readJson(req)) as AuraSignal;
      const decision = aura.update(signal);
      sendJson(res, 200, { state: aura.getState(), decision });
      return;
    }

    if (req.method === "POST" && req.url === "/reset") {
      aura.reset();
      sendJson(res, 200, { ok: true, state: aura.getState() });
      return;
    }

    sendJson(res, 404, {
      error: "not_found",
      availableRoutes: ["GET /health", "GET /state", "POST /decide", "POST /update", "POST /reset"]
    });
  } catch (error) {
    sendJson(res, 500, {
      error: "internal_error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

server.listen(port, () => {
  console.log(`Aura Engine HTTP adapter listening on http://localhost:${port}`);
});
