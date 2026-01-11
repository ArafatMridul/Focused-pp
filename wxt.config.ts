import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ["@wxt-dev/module-react"],
    manifest: {
        name: "WXT + React",
        version: "1.0.0",
        description: "WXT + React",
        permissions: ["storage", "tabs", "activeTab"],
        host_permissions: ["<all_urls>"],
        background: {
            service_worker: "entrypoints/background.ts",
            type: "module",
        },
    },
});
