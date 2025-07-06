# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based terminal emulator built with React Router v7, TypeScript, and TailwindCSS. The application features an in-memory file system, basic Unix commands, command history, autocompletion, and a beautiful Catppuccin Mocha theme.

## Development Commands

- `npm run dev` - Start development server with HMR (usually at <http://localhost:5173>)
- `npm run build` - Create production build
- `npm run start` - Start production server (serves from build/server/index.js)
- `npm run typecheck` - Generate React Router types and run TypeScript compiler
- `npm test` - Run comprehensive test suite (unit and integration tests)

## Configuration

### Environment Variables

- `VITE_FILESYSTEM_MODE` - Configure which filesystem structure to use at deployment time
  - `default` - Unix-like filesystem with /home, /etc, /var, etc. (default if not set)
  - `portfolio` - Portfolio-focused structure with /about, /projects, /contact, /blog

### Filesystem Mode Selection

The filesystem mode is determined at deployment time using the `VITE_FILESYSTEM_MODE` environment variable. If not set, it defaults to 'default' mode. This ensures consistent filesystem structure across all users for a given deployment.

## Architecture

### Framework

- **React Router v7** with CSR mode (better for terminal emulator state management)
- **TypeScript** with strict mode enabled
- **TailwindCSS v4** with custom Catppuccin theme
- **Vite** as build tool

### Project Structure

```
app/
├── root.tsx                 # Root layout component
├── routes.ts                # Route configuration
├── routes/
│   └── terminal/
│       ├── terminal.tsx     # Main terminal route
│       ├── components/
│       │   └── Terminal.tsx # Main terminal component
│       ├── types/
│       │   └── filesystem.ts # TypeScript types for filesystem
│       └── utils/
│           ├── filesystem.ts    # In-memory filesystem utilities
│           ├── commands.ts      # Terminal command implementations
│           ├── commandParser.ts # Command parsing with redirection support
│           ├── optionParser.ts  # Unix-style option parsing (e.g., -la, -rf)
│           ├── autocompletion.ts # Tab completion system
│           └── markdown.ts      # Markdown rendering with Catppuccin
├── test/                    # Comprehensive test suite
│   ├── utils/              # Unit tests for utilities
│   └── integration/        # Integration tests for commands
└── app.css                 # Global styles with Catppuccin theme
```

### Terminal Features

- **Commands**: cd, ls, pwd, touch, cat, mkdir, rm, rmdir, clear, help, echo, wc, reset-fs
- **Command Options**: Advanced option parsing supporting combined flags
  - `ls -a` (show hidden), `-l` (long format), `-la` (combined)
  - `mkdir -p` (create parent directories)
  - `rm -r` (recursive), `-f` (force), `-rf` (combined)
- **File System**: In-memory hierarchical filesystem with configurable structure
- **Redirection**: Full I/O redirection support
  - `command > file` - Write output to file (overwrite)
  - `command >> file` - Append output to file
  - `command < file` - Read input from file
  - `command << delimiter` - Heredoc input (simplified)
- **History**: Arrow key navigation through command history
- **Autocompletion**: Tab completion for commands, file paths, and redirection
- **Markdown Rendering**: cat command renders .md files with Catppuccin-styled formatting
- **Theme**: Catppuccin Mocha colorscheme with monospace font

### Key Patterns

- CSR mode is used instead of SSR for better terminal state management
- All TypeScript imports use `type` imports where appropriate due to `verbatimModuleSyntax`
- Use `~/*` path alias for absolute imports (pre-configured by React Router)
- Filesystem state is managed in React component state
- Commands return structured output (string or OutputSegment[]) for rich formatting
- Markdown files are parsed and rendered with Catppuccin theme colors
- Autocompletion handles command names, file paths, and redirection operators
- Modular command system with separate parsers for commands, options, and redirection
- Path resolution supports both relative and absolute paths throughout the system
- Option parsing follows Unix conventions (short flags, combined flags, long options)

### Catppuccin Theme

The application uses Catppuccin Mocha theme colors defined in `app.css`:

- Background: `--color-ctp-base` (#1e1e2e)
- Text: `--color-ctp-text` (#cdd6f4)
- Prompt: `--color-ctp-green` (#a6e3a1)
- Errors: `--color-ctp-red` (#f38ba8)
- Directories: `--color-ctp-blue` (#89b4fa)

## Testing

The project includes a comprehensive test suite using Vitest:

### Test Structure

- **Unit Tests**: Test individual utilities and parsers
  - `test/utils/filesystem.test.ts` - Filesystem operations
  - `test/utils/commandParser.test.ts` - Command parsing with redirection
  - `test/utils/optionParser.test.ts` - Unix-style option parsing
  - `test/utils/commands.test.ts` - Individual command implementations
  - `test/utils/autocompletion.test.ts` - Tab completion functionality

- **Integration Tests**: Test complete command workflows
  - `test/integration/commandExecution.test.ts` - End-to-end command execution
  - Tests redirection, complex scenarios, and error handling

### Running Tests

```bash
npm test          # Run all tests
npm test -- --watch  # Run tests in watch mode
npm test -- --coverage  # Run tests with coverage report
```

### Test Coverage

- Commands: All commands tested with various options and edge cases
- Parsing: Command parsing, option parsing, and redirection operators
- Filesystem: File operations, path resolution, and directory navigation
- Autocompletion: Command completion, path completion, and redirection completion
- Integration: Complex workflows, error scenarios, and real-world usage patterns

## Development Notes

- Always run `npm run typecheck` after making changes to ensure TypeScript compliance
- Run `npm test` to ensure all functionality works correctly
- The filesystem is initialized with a default structure but can be customized in `routes/terminal/utils/filesystem.ts`
- Command implementations follow Unix-like behavior and error messages
- Tab completion supports single completion, multiple options, and redirection contexts
- Markdown rendering supports headers, bold/italic, code blocks, links, lists, blockquotes, and horizontal rules
- The cat command automatically detects .md files and applies syntax highlighting with Catppuccin colors
- Redirection operators are parsed before command execution and handle both string and array outputs
- Option parsing supports both individual flags (-a -l) and combined flags (-al)
- Path resolution works consistently across all commands and supports nested directory structures
