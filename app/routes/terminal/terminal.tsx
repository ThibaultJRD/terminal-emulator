import { CanonicalLink, WebApplicationStructuredData } from '~/components/SEO';
import { TerminalErrorBoundary } from '~/routes/terminal/components/ErrorBoundary';
import { Terminal } from '~/routes/terminal/components/Terminal';

import type { Route } from './+types/terminal';

export function meta({}: Route.MetaArgs) {
  const title = 'Terminal Emulator - Interactive Web Terminal';
  const description =
    'Experience a fully-featured web terminal emulator with Unix commands, in-memory filesystem, command history, and vi text editor. Built with React Router v7, TypeScript, and beautiful Catppuccin theme for developers and terminal enthusiasts.';
  const keywords =
    'terminal emulator, web terminal, unix commands, bash, shell, filesystem, command line, developer tools, react, typescript, catppuccin, vim editor, interactive terminal, browser terminal';
  const author = 'Terminal Emulator';
  const canonicalUrl = 'https://terminal-emulator-nine.vercel.app/';
  const ogImageUrl = 'https://terminal-emulator-nine.vercel.app/og-terminal.png';

  return [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'author', content: author },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#1e1e2e' },

    // Open Graph / Facebook
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:site_name', content: 'Terminal Emulator' },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:image', content: ogImageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'Terminal Emulator - Interactive Web Terminal Interface' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:creator', content: '@terminal_emulator' },
    { name: 'twitter:image', content: ogImageUrl },
    { name: 'twitter:image:alt', content: 'Terminal Emulator - Interactive Web Terminal Interface' },

    // Additional meta tags
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: 'English' },
    { name: 'revisit-after', content: '7 days' },
    { name: 'format-detection', content: 'telephone=no' },

    // PWA-related meta tags
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'Terminal' },
  ];
}

export default function TerminalScreen() {
  return (
    <TerminalErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling logic
        console.error('Terminal route error:', error, errorInfo);

        // Could send to analytics or error reporting service
        // analytics.track('terminal_error', {
        //   error: error.message,
        //   stack: error.stack,
        //   componentStack: errorInfo.componentStack,
        // });
      }}
    >
      <CanonicalLink url="https://terminal-emulator-nine.vercel.app/" />
      <WebApplicationStructuredData
        name="Terminal Emulator"
        description="Experience a fully-featured web terminal emulator with Unix commands, in-memory filesystem, command history, and vi text editor. Built with React Router v7, TypeScript, and beautiful Catppuccin theme for developers and terminal enthusiasts."
        url="https://terminal-emulator-nine.vercel.app/"
        creator={{
          name: 'ThibaultJRD',
          url: 'https://github.com/ThibaultJRD',
        }}
        features={['Unix Commands', 'File System', 'Command History', 'Autocompletion', 'Text Editor']}
      />
      <Terminal />
    </TerminalErrorBoundary>
  );
}
