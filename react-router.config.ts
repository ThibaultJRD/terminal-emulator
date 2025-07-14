import type { Config } from '@react-router/dev/config';

import { vercelPreset } from '@vercel/react-router/vite';

export default {
  ssr: true,
  prerender: ['/', '/portfolio', '/tutorial'],
  presets: [vercelPreset()],
} satisfies Config;
