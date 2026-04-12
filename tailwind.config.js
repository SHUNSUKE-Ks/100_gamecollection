/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'biribiri': 'biribiri 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) infinite both',
            },
            keyframes: {
                biribiri: {
                    '0%, 100%': { transform: 'translate(0, 0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translate(-2px, -2px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translate(2px, 2px)' },
                }
            }
        },
    },
    plugins: [],
}
