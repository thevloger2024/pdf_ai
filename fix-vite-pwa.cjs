const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');

const oldPWA = `VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        includeAssets: ['icon.svg'],
        manifest: {`;

const newPWA = `VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
        },
        includeAssets: ['icon.svg'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mjs,wasm}'],
          maximumFileSizeToCacheInBytes: 10485760, // 10MB to cover large chunks and PDF workers
          runtimeCaching: [
            {
              urlPattern: /^https:\\/\\/fonts\\.(?:googleapis|gstatic)\\.com\\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        manifest: {`;

content = content.replace(oldPWA, newPWA);

fs.writeFileSync('vite.config.ts', content, 'utf8');
