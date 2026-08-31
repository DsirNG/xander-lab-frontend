import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores([
        "**/dist/**",
        "**/node_modules/**",
        "xander-lab-miniprogram/**",
    ]),
    {
        files: ["src/**/*.{js,jsx}"],
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: "latest",
                ecmaFeatures: { jsx: true },
                sourceType: "module",
            },
        },
        settings: {
            react: { version: "19.0" },
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "no-unused-vars": [
                "error",
                { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_" },
            ],
            "react/prop-types": "off",
            // Existing responsive/layout effects intentionally close transient UI.
            // These synchronize UI with media-query and route changes.
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/purity": "error",
            "react/display-name": "error",
            "react/no-unescaped-entities": "error",
            "react/jsx-no-comment-textnodes": "error",
        },
    },
    {
        files: ["src/**/*.test.{js,jsx}", "src/test/**/*.js"],
        languageOptions: {
            globals: globals.browser,
        },
    },
    {
        files: [
            "scripts/**/*.js",
            "vite.config.js",
            "postcss.config.js",
            "tailwind.config.js",
            "seo-tools.mjs",
        ],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.node,
            parserOptions: { sourceType: "module" },
        },
        rules: {
            ...js.configs.recommended.rules,
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["bing-push.js", "bing-submit.js"],
        languageOptions: {
            ecmaVersion: "latest",
            globals: globals.node,
            parserOptions: { sourceType: "commonjs" },
        },
        rules: {
            ...js.configs.recommended.rules,
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
]);
