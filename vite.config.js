import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, projectRoot, "VITE_");
    const apiProxyTarget =
        env.VITE_API_PROXY_TARGET?.trim() || "https://api.dinqor.cn";
    const appVersion = `${Date.now()}`;

    const versionManifestPlugin = {
        name: "version-manifest",
        generateBundle() {
            this.emitFile({
                type: "asset",
                fileName: "version.json",
                source: JSON.stringify({ version: appVersion }),
            });
        },
    };

    return {
        plugins: [react(), versionManifestPlugin],
        define: {
            "import.meta.env.VITE_APP_VERSION": JSON.stringify(appVersion),
        },
        test: {
            environment: "jsdom",
            setupFiles: "./src/test/setup.js",
            include: ["src/**/*.test.{jsx,tsx}"],
            css: false,
        },
        resolve: {
            alias: {
                "@": path.resolve(projectRoot, "./src"),
                "@components": path.resolve(projectRoot, "./src/components"),
                "@features": path.resolve(projectRoot, "./src/features"),
                "@hooks": path.resolve(projectRoot, "./src/hooks"),
                "@utils": path.resolve(projectRoot, "./src/utils"),
                "@config": path.resolve(projectRoot, "./src/config"),
                "@api": path.resolve(projectRoot, "./src/api"),
                "@locales": path.resolve(projectRoot, "./src/locales"),
                "@styles": path.resolve(projectRoot, "./src/styles"),
                "@types": path.resolve(projectRoot, "./src/types"),
                "@router": path.resolve(projectRoot, "./src/router"),
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes("node_modules")) {
                            if (id.includes("@babel/standalone"))
                                return "vendor-compiler";
                            if (id.includes("react-syntax-highlighter"))
                                return "vendor-highlight";
                            if (
                                id.includes("react-markdown") ||
                                id.includes("remark-gfm")
                            )
                                return "vendor-markdown";
                            if (id.includes("framer-motion"))
                                return "vendor-motion";
                            if (
                                id.includes("react-dom") ||
                                id.includes("react-router") ||
                                id.includes("react-i18next") ||
                                id.includes("i18next")
                            )
                                return "vendor-react";
                            if (id.includes("lucide-react"))
                                return "vendor-icons";
                            if (id.includes("axios")) return "vendor-http";
                        }
                    },
                },
            },
        },
        server: {
            host: "0.0.0.0",
            port: 3000,
            proxy: {
                "/api": {
                    target: apiProxyTarget,
                    changeOrigin: true,
                    // rewrite: (path) => path.replace(/^\/api/, ''),
                },
                "/studio-api": {
                    target: "https://api.dinqor.cn",
                    changeOrigin: true,
                    secure: false,
                    timeout: 600000, // 10 minutes for large file uploads
                    proxyTimeout: 600000,
                    // rewrite: (path) => path.replace(/^\/studio-api/, '/api'),
                },
                "/studio-preview": {
                    target: "http://localhost:30003",
                    changeOrigin: true,
                    // rewrite: (path) => path.replace(/^\/studio-preview/, '/preview'),
                },
            },
        },
    };
});
