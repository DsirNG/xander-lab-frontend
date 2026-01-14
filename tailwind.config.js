/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1', // Indigo 500
                    dark: '#4338ca', // Indigo 700
                },
                background: {
                    light: '#ffffff',
                    dark: '#0f172a', // Slate 900
                },
                surface: {
                    light: '#f8fafc',
                    dark: '#1e293b', // Slate 800
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            }
        },
    },
    plugins: [],
}
