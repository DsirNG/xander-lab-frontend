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
                    DEFAULT: '#36f', // Blue theme color
                    50: '#e6f3ff',
                    100: '#cce7ff',
                    200: '#99ceff',
                    300: '#66b4ff',
                    400: '#339bff',
                    500: '#36f',
                    600: '#005ce6',
                    700: '#0047b3',
                    800: '#003380',
                    900: '#001f4d',
                },
                background: {
                    light: '#ffffff',
                },
                surface: {
                    light: '#f8fafc',
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
