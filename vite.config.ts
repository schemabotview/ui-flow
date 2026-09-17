import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// One config, two jobs:
//   `npm run dev`   — serves index.html + dev/, the fixture harness (imports src/ directly, so HMR)
//   `npm run build` — library build: dist/index.js, then tsc emits dist/index.d.ts
//
// `external` is load-bearing. Bundling react or @xyflow/react would put a second copy inside the
// package and break hooks in every consuming app. Port 5174 leaves 5173 free for a content repo,
// since the two run side by side.
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index' },
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', '@xyflow/react', 'lucide-react'],
    },
  },
})
