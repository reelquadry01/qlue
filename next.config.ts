import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// Cloudflare Pages serves the `out/` folder produced by `output: 'export'`.
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Pin Turbopack to the repo so builds never pick up package files from a
  // parent directory (surfaced as a warning when building outside the repo).
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
