import { defineConfig } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'module';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: { 
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'lionn-common',
      fileName: 'lionn-common'
    },
    //target: 'node20',
    rollupOptions: {
      external: [...builtinModules, /^node:/],
    },
    sourcemap: true,
    outDir: 'dist',
  },
  resolve: {
    alias: {
      src: resolve('src/'),
      public: resolve(__dirname, '/public/'),
    },
  },
  plugins: [dts()],
});
