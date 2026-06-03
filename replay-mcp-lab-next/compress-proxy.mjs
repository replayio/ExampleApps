
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { createGzip } from "node:zlib";
import { request as httpRequest } from "node:http";
import WebSocket from "ws";

const UPSTREAM_PORT = 4312;
const PROXY_PORT = 4311;
const COMPRESSIBLE = /^(text|application)\/(javascript|json|html|css|xml|plain)/;

const server = createServer((req, res) => {
  const opts = {
    hostname: "127.0.0.1",
    port: UPSTREAM_PORT,
    path: req.url,
    method: req.method,
    headers: Object.assign({}, req.headers, {
      host: "127.0.0.1:" + UPSTREAM_PORT,
      "accept-encoding": "identity"
    }),
  };

  const proxy = httpRequest(opts, (upstream) => {
    const ct = upstream.headers["content-type"] || "";
    const ae = req.headers["accept-encoding"] || "";
    const compress = COMPRESSIBLE.test(ct) && ae.includes("gzip");
    const hdrs = Object.assign({}, upstream.headers);
    delete hdrs["content-length"];

    if (compress) {
      hdrs["content-encoding"] = "gzip";
      hdrs["vary"] = "Accept-Encoding";
      res.writeHead(upstream.statusCode, hdrs);
      upstream.pipe(createGzip()).pipe(res);
    } else {
      res.writeHead(upstream.statusCode, hdrs);
      upstream.pipe(res);
    }
  });

  proxy.on("error", (e) => {
    if (!res.headersSent) { res.writeHead(502); res.end(); }
  });

  req.pipe(proxy);
});

// Forward WebSocket upgrades (needed for Next.js HMR)
server.on("upgrade", (req, socket, head) => {
  const key = req.headers["sec-websocket-key"];
  const accept = createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
    .digest("base64");

  const upstreamWs = new WebSocket(
    "ws://127.0.0.1:" + UPSTREAM_PORT + req.url,
    { headers: Object.assign({}, req.headers, { host: "127.0.0.1:" + UPSTREAM_PORT }) }
  );

  upstreamWs.on("open", () => {
    socket.write(
      "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" +
      "Connection: Upgrade\r\n" +
      "Sec-WebSocket-Accept: " + accept + "\r\n\r\n"
    );
    // Raw socket passthrough after handshake
    const raw = upstreamWs._socket;
    socket.pipe(raw);
    raw.pipe(socket);
    socket.on("error", () => { try { raw.destroy(); } catch(_){} });
    raw.on("error", () => { try { socket.destroy(); } catch(_){} });
  });

  upstreamWs.on("error", (e) => {
    console.error("WS upgrade error:", e.message);
    socket.destroy();
  });
});

server.listen(PROXY_PORT, "127.0.0.1", () => {
  console.log("Compression+WS proxy ready on port " + PROXY_PORT);
});
