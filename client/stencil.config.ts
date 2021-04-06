import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { postcss } from '@stencil/postcss';
import autoprefixer from 'autoprefixer';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import tailwindcss from 'tailwindcss';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.scss',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      // comment the following line to disable service workers in production
      serviceWorker: null,
      baseUrl: 'https://myapp.local/',
      prerenderConfig: './prerender.config.ts',
    },
  ],
  devServer: {
    reloadStrategy: 'pageReload',
  },
  plugins: [
    sass(),
    postcss({
      plugins: [tailwindcss('./tailwind.config.js'), autoprefixer()],
    }),
  ],
  rollupPlugins: {
    after: [nodePolyfills()],
  },
};
