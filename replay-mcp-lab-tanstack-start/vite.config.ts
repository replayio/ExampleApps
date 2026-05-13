import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { createLabApiResponse } from "@replayio/mcp-lab-core/api";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin } from "vite";

function labApiPlugin(): Plugin {
  return {
    name: "replay-mcp-lab-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url ?? "/", "http://localhost");
        if (!requestUrl.pathname.startsWith("/api/lab/")) {
          next();
          return;
        }

        const scenario = requestUrl.pathname.split("/").filter(Boolean).pop() ?? "summary";
        const response = await createLabApiResponse(scenario, requestUrl.toString());
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 4312,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    labApiPlugin(),
    tanstackStart({
      srcDirectory: "src",
    }),
    react(),
    nitro(),
  ],
});
