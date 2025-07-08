import type { Config } from '@react-router/dev/config';

import { vercelPreset } from '@vercel/react-router/vite';

export default {
  // Config options...
  // CSR mode is better for terminal emulator with complex state management
  ssr: false,
  presets: [vercelPreset()],
} satisfies Config;
