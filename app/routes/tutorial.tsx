import { CanonicalLink, WebApplicationStructuredData } from '~/components/SEO';
import { TerminalErrorBoundary } from '~/routes/terminal/components/ErrorBoundary';
import { Terminal } from '~/routes/terminal/components/Terminal';

export default function TutorialScreen() {
  return (
    <TerminalErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling logic
        console.error('Tutorial route error:', error, errorInfo);

        // Could send to analytics or error reporting service
        // analytics.track('tutorial_error', {
        //   error: error.message,
        //   stack: error.stack,
        //   componentStack: errorInfo.componentStack,
        // });
      }}
    >
      <title>Terminal Tutorial - Interactive Unix Command Learning | How ls, cd, vi Works</title>
      <meta
        name="description"
        content="Learn Unix terminal commands interactively! Complete tutorial to master ls, cd, mkdir, vi, pipes, grep and more. Perfect terminal tutorial for beginners and advanced users wanting to improve their command line skills."
      />
      <meta
        name="keywords"
        content="terminal tutorial, unix tutorial, bash tutorial, command line tutorial, learn terminal, how ls works, how cd works, how vi works, unix commands, shell tutorial, vi editor tutorial, terminal basics, interactive learning, command line training, tuto terminal, unix tuto, tutoriel terminal"
      />
      <meta name="author" content="Terminal Tutorial" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#1e1e2e" />

      <meta property="og:type" content="website" />
      <meta property="og:title" content="Terminal Tutorial - Interactive Unix Command Learning | Master ls, cd, vi & More" />
      <meta
        property="og:description"
        content="Learn Unix terminal commands interactively! Complete tutorial to master ls, cd, mkdir, vi, pipes, grep and more. Perfect terminal tutorial for beginners and advanced users wanting to improve their command line skills."
      />
      <meta property="og:site_name" content="Terminal Tutorial" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content="https://terminal-emulator-nine.vercel.app/tutorial" />
      <meta property="og:image" content="https://terminal-emulator-nine.vercel.app/og-tutorial.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Terminal Tutorial - Interactive Unix Command Learning Interface" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Terminal Tutorial - Interactive Unix Command Learning | Master ls, cd, vi & More" />
      <meta
        name="twitter:description"
        content="Learn Unix terminal commands interactively! Complete tutorial to master ls, cd, mkdir, vi, pipes, grep and more. Perfect terminal tutorial for beginners and advanced users wanting to improve their command line skills."
      />
      <meta name="twitter:creator" content="@terminal_tutorial" />
      <meta name="twitter:image" content="https://terminal-emulator-nine.vercel.app/og-tutorial.png" />
      <meta name="twitter:image:alt" content="Terminal Tutorial - Interactive Unix Command Learning Interface" />

      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="format-detection" content="telephone=no" />

      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Tutorial" />

      <CanonicalLink url="https://terminal-emulator-nine.vercel.app/tutorial" />
      <WebApplicationStructuredData
        name="Terminal Tutorial"
        description="Learn Unix terminal commands interactively! Complete tutorial to master ls, cd, mkdir, vi, pipes, grep and more. Perfect terminal tutorial for beginners and advanced users wanting to improve their command line skills."
        url="https://terminal-emulator-nine.vercel.app/tutorial"
        creator={{
          name: 'ThibaultJRD',
          url: 'https://thibault.iusevimbtw.com',
        }}
        features={['Interactive Lessons', 'Unix Commands', 'Step-by-step Learning', 'Hands-on Practice', 'Progress Tracking']}
      />
      <Terminal mode="tutorial" />
    </TerminalErrorBoundary>
  );
}
