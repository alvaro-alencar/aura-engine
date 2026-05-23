import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createAuraEngine, type AmbienceDecision, type AuraSignal, type AuraState } from "../../core/src";

const aura = createAuraEngine();
const port = Number(process.env.PORT ?? 8787);
const sseClients = new Set<ServerResponse>();

interface AuraUpdateEvent {
  protocol: "aura.v1";
  type: "aura.update" | "aura.reset" | "aura.heartbeat";
  state?: AuraState;
  decision?: AmbienceDecision;
  timestamp: number;
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendSse(res: ServerResponse, event: AuraUpdateEvent) {
  res.write(`event: ${event.type}\n`);
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function broadcast(event: AuraUpdateEvent) {
  for (const client of sseClients) {
    sendSse(client, event);
  }
}

function openEventStream(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, {
    "content-type": "text/event-stream; charset=utf-8",
    "cache-control": "no-cache, no-transform",
    connection: "keep-alive",
    "access-control-allow-origin": "*"
  });

  sseClients.add(res);

  sendSse(res, {
    protocol: "aura.v1",
    type: "aura.heartbeat",
    state: aura.getState(),
    timestamp: Date.now()
  });

  req.on("close", () => {
    sseClients.delete(res);
  });
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
      sendJson(res, 200, { ok: true, protocol: "aura.v1", streaming: true });
      return;
    }

    if (req.method === "GET" && req.url === "/state") {
      sendJson(res, 200, aura.getState());
      return;
    }

    if (req.method === "GET" && req.url === "/events") {
      openEventStream(req, res);
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
      const event: AuraUpdateEvent = {
        protocol: "aura.v1",
        type: "aura.update",
        state: aura.getState(),
        decision,
        timestamp: Date.now()
      };

      broadcast(event);
      sendJson(res, 200, { state: aura.getState(), decision });
      return;
    }

    if (req.method === "POST" && req.url === "/reset") {
      aura.reset();
      const event: AuraUpdateEvent = {
        protocol: "aura.v1",
        type: "aura.reset",
        state: aura.getState(),
        timestamp: Date.now()
      };

      broadcast(event);
      sendJson(res, 200, { ok: true, state: aura.getState() });
      return;
    }

    sendJson(res, 404, {
      error: "not_found",
      availableRoutes: [
        "GET /health",
        "GET /state",
        "GET /events",
        "POST /decide",
        "POST /update",
        "POST /reset"
      ]
    });
  } catch (error) {
    sendJson(res, 500, {
      error: "internal_error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

setInterval(() => {
  broadcast({
    protocol: "aura.v1",
    type: "aura.heartbeat",
    state: aura.getState(),
    timestamp: Date.now()
  });
}, 30000).unref();

server.listen(port, () => {
  console.log(`Aura Engine HTTP adapter listening on http://localhost:${port}`);
});
