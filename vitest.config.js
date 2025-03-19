// Configure Vitest (https://vitest.dev/config/)

import { defineConfig, loadEnv } from 'vite'

export default defineConfig({
    test: {
        globals: true,
        include: ['test/**/*.js'],
        environment: 'node',
        env: loadEnv('', process.cwd(), '')
    },
    clearMocks: true,
    mockReset: true,
    restoreMocks: true
});
