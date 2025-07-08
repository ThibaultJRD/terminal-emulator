import { CanonicalLink, WebApplicationStructuredData } from '~/components/SEO';
import { TerminalErrorBoundary } from '~/routes/terminal/components/ErrorBoundary';
import { Terminal } from '~/routes/terminal/components/Terminal';

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
      <title>Terminal Emulator - Interactive Web Terminal</title>
      <meta
        name="description"
        content="Experience a fully-featured web terminal emulator with Unix commands, in-memory filesystem, command history, and vi text editor. Built with React Router v7, TypeScript, and beautiful Catppuccin theme for developers and terminal enthusiasts."
      />
      <meta
        name="keywords"
        content="terminal emulator, web terminal, unix commands, bash, shell, filesystem, command line, developer tools, react, typescript, catppuccin, vim editor, interactive terminal, browser terminal"
      />
      <meta name="author" content="Terminal Emulator" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1e1e2e" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="Terminal Emulator - Interactive Web Terminal" />
      <meta
        property="og:description"
        content="Experience a fully-featured web terminal emulator with Unix commands, in-memory filesystem, command history, and vi text editor. Built with React Router v7, TypeScript, and beautiful Catppuccin theme for developers and terminal enthusiasts."
      />
      <meta property="og:site_name" content="Terminal Emulator" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content="https://terminal-emulator-nine.vercel.app/" />
      <meta property="og:image" content="https://terminal-emulator-nine.vercel.app/og-terminal.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Terminal Emulator - Interactive Web Terminal Interface" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Terminal Emulator - Interactive Web Terminal" />
      <meta
        name="twitter:description"
        content="Experience a fully-featured web terminal emulator with Unix commands, in-memory filesystem, command history, and vi text editor. Built with React Router v7, TypeScript, and beautiful Catppuccin theme for developers and terminal enthusiasts."
      />
      <meta name="twitter:creator" content="@terminal_emulator" />
      <meta name="twitter:image" content="https://terminal-emulator-nine.vercel.app/og-terminal.png" />
      <meta name="twitter:image:alt" content="Terminal Emulator - Interactive Web Terminal Interface" />

      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="format-detection" content="telephone=no" />

      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Terminal" />

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
