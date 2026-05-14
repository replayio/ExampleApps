import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const staticExport = process.env.NEXT_OUTPUT === "export";

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: basePath || undefined,
  basePath: basePath || undefined,
  images: {
    unoptimized: staticExport,
  },
  output: staticExport ? "export" : undefined,
  productionBrowserSourceMaps: process.env.SOURCE_MAPS === "true",
  reactStrictMode: true,
  trailingSlash: staticExport,
  transpilePackages: ["@replayio/mcp-lab-core"],
  turbopack: {
    root,
  },
};

export default nextConfig;
