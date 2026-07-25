/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                accent: {
                    DEFAULT: '#0284c7',
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    soft: '#f0f9ff',
                    muted: '#e0f2fe',
                    fg: '#0369a1',
                },
                // legacy alias → accent
                primary: {
                    DEFAULT: '#0284c7',
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                ink: {
                    DEFAULT: '#0f172a',
                    secondary: '#334155',
                    muted: '#64748b',
                    faint: '#94a3b8',
                },
                canvas: '#ffffff',
                surface: {
                    DEFAULT: '#f8fafc',
                    muted: '#f1f5f9',
                    light: '#f8fafc',
                },
                border: {
                    DEFAULT: '#e2e8f0',
                    strong: '#cbd5e1',
                },
                background: {
                    light: '#ffffff',
                },
                success: {
                    DEFAULT: '#059669',
                    soft: '#ecfdf5',
                    fg: '#047857',
                },
                warning: {
                    DEFAULT: '#d97706',
                    soft: '#fffbeb',
                    fg: '#b45309',
                },
                danger: {
                    DEFAULT: '#e11d48',
                    soft: '#fff1f2',
                    fg: '#be123c',
                },
                info: {
                    DEFAULT: '#0284c7',
                    soft: '#f0f9ff',
                    fg: '#0369a1',
                },
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            fontSize: {
                display: ['1.75rem', { lineHeight: '1.25' }],
                title: ['1.125rem', { lineHeight: '1.4' }],
                body: ['0.875rem', { lineHeight: '1.5' }],
                caption: ['0.75rem', { lineHeight: '1.45' }],
                micro: ['0.6875rem', { lineHeight: '1.4' }],
            },
        },
    },
    plugins: [],
}
