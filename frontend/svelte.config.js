import adapterAuto from '@sveltejs/adapter-auto';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess()],

  kit: {
    adapter:
      process.env.ADAPTER == 'node' ? adapterNode({ out: 'build' }) : adapterAuto({ out: 'build' }),
    alias: {
      "@/*": "./src/*",
    },
  }
};

export default config;
