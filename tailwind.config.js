/** Compatibility config. Visual values live in src/styles/index.css @theme. */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                accent: {
                    50: "var(--color-accent-50)",
                    100: "var(--color-accent-100)",
                    200: "var(--color-accent-200)",
                    300: "var(--color-accent-300)",
                    400: "var(--color-accent-400)",
                    500: "var(--color-accent-500)",
                    600: "var(--color-accent-600)",
                    700: "var(--color-accent-700)",
                    800: "var(--color-accent-800)",
                    900: "var(--color-accent-900)",
                    DEFAULT: "var(--color-accent)",
                    soft: "var(--color-accent-soft)",
                    muted: "var(--color-accent-muted)",
                    fg: "var(--color-accent-fg)",
                },
                primary: {
                    50: "var(--color-primary-50)",
                    100: "var(--color-primary-100)",
                    200: "var(--color-primary-200)",
                    300: "var(--color-primary-300)",
                    400: "var(--color-primary-400)",
                    500: "var(--color-primary-500)",
                    600: "var(--color-primary-600)",
                    700: "var(--color-primary-700)",
                    800: "var(--color-primary-800)",
                    900: "var(--color-primary-900)",
                    DEFAULT: "var(--color-primary)",
                },
                ink: {
                    DEFAULT: "var(--color-ink)",
                    secondary: "var(--color-ink-secondary)",
                    muted: "var(--color-ink-muted)",
                    faint: "var(--color-ink-faint)",
                },
                canvas: "var(--color-canvas)",
                surface: {
                    DEFAULT: "var(--color-surface)",
                    muted: "var(--color-surface-muted)",
                    light: "var(--color-surface-light)",
                },
                border: {
                    DEFAULT: "var(--color-border)",
                    strong: "var(--color-border-strong)",
                },
                background: {
                    light: "var(--color-background-light)",
                },
                success: {
                    DEFAULT: "var(--color-success)",
                    soft: "var(--color-success-soft)",
                    fg: "var(--color-success-fg)",
                },
                warning: {
                    DEFAULT: "var(--color-warning)",
                    soft: "var(--color-warning-soft)",
                    fg: "var(--color-warning-fg)",
                },
                danger: {
                    DEFAULT: "var(--color-danger)",
                    soft: "var(--color-danger-soft)",
                    fg: "var(--color-danger-fg)",
                },
                info: {
                    DEFAULT: "var(--color-info)",
                    soft: "var(--color-info-soft)",
                    fg: "var(--color-info-fg)",
                },
            },
            fontFamily: {
                sans: ["var(--font-sans)"],
                chat: ["var(--font-chat)"],
                mono: ["var(--font-mono)"],
            },
            fontSize: {
                display: [
                    "1.5rem",
                    {
                        lineHeight: "1.3",
                        fontWeight: "700",
                    },
                ],
                heading: [
                    "1.125rem",
                    {
                        lineHeight: "1.35",
                        fontWeight: "700",
                    },
                ],
                title: [
                    "1rem",
                    {
                        lineHeight: "1.4",
                        fontWeight: "600",
                    },
                ],
                body: [
                    "0.875rem",
                    {
                        lineHeight: "1.5",
                        fontWeight: "400",
                    },
                ],
                caption: [
                    "0.75rem",
                    {
                        lineHeight: "1.45",
                        fontWeight: "400",
                    },
                ],
                micro: [
                    "0.6875rem",
                    {
                        lineHeight: "1.4",
                        fontWeight: "400",
                    },
                ],
            },
            borderRadius: {
                control: "var(--radius-control)",
                card: "var(--radius-card)",
                panel: "var(--radius-panel)",
                dialog: "var(--radius-dialog)",
                menu: "var(--radius-menu)",
                "menu-item": "var(--radius-menu-item)",
            },
            boxShadow: {
                float: "var(--shadow-float)",
                dialog: "var(--shadow-dialog)",
            },
        },
    },
    plugins: [],
};
