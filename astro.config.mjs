import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "server",
  devToolbar: {
    enabled: false,
  },
  adapter: netlify(),
  prefetch: true,
  redirects: {
    "/ch/00": "/",
    "/about": "/credits",
    "/ch/999": "/credits",
  },
  integrations: [mdx()],
});
