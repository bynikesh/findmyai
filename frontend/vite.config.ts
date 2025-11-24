import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: ['devserver-main--findmyaixyz.netlify.app'],
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL ?? 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
    },
})
