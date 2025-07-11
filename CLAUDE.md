# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands

```bash
# Development with hot reload
yarn dev

# Build for production
yarn build

# Start production server (for Vercel)
yarn start

# Start production server (for local testing)
yarn start:local

# Run all tests
yarn test:run

# Run tests in watch mode
yarn test

# Run tests with coverage
yarn test:coverage

# TypeScript type checking
yarn typecheck

# Format code
yarn format

# Check formatting
yarn format:check

# Audit dependencies
yarn audit
```

### Testing Commands

- `yarn test` - Watch mode for development
- `yarn test:run` - Single run for CI/CD
- `yarn test:coverage` - Generate coverage reports
- `yarn test:ui` - Interactive test UI

## Project Architecture

### Core Structure

This is a React Router v7 terminal emulator built with TypeScript and TailwindCSS. The application simulates a Unix-like terminal with two filesystem modes: default and portfolio.

### Key Components

- **Terminal.tsx** (`app/routes/terminal/components/`) - Main terminal interface with state management
- **TextEditor.tsx** - Vim-inspired modal text editor (INSERT/NORMAL modes)
- **FileSystem** (`app/routes/terminal/utils/filesystem.ts`) - In-memory hierarchical filesystem with security validation
- **Commands** (`app/routes/terminal/utils/commands.ts`) - Unix command implementations with exit codes
- **Command Parser** (`app/routes/terminal/utils/commandParser.ts`) - Handles I/O redirection and command chaining
- **Persistence** (`app/routes/terminal/utils/persistence.ts`) - Browser localStorage with mode-specific storage

### Route Configuration

- `/` - Default Unix-like filesystem
- `/portfolio` - Interactive portfolio filesystem
- Routes configured in `react-router.config.ts` with prerendering enabled

### Filesystem Modes

The application supports multiple filesystem modes defined in `app/constants/defaultFilesystems.ts`:

- **Default**: Traditional Unix-like structure with `/home/user/`, `/etc/`, `/var/log/`
- **Portfolio**: Professional portfolio with `~/about/`, `~/projects/`, `~/contact/`

Each mode has separate localStorage persistence to maintain independent state.

### Command System

Commands are implemented with Unix exit codes and support:

- **Chaining operators**: `&&`, `||`, `;`
- **I/O redirection**: `>`, `>>`, `<`, `<<`
- **Exit code tracking**: `$?` variable
- **Alias system**: User-defined command shortcuts
- **Manual pages**: `man` command with comprehensive documentation

### Security Features

The codebase implements comprehensive security measures:

- File size limits (5MB per file, 50MB total filesystem)
- Path validation against forbidden characters and reserved names
- Input validation with length limits (1000 chars for commands)
- Resource limits (1000 files per directory, 20 path depth)
- Safe regex patterns to prevent ReDoS attacks

## Testing Strategy

The project has 483+ tests covering:

- **Unit tests**: Individual utilities and components
- **Integration tests**: Full command workflows and filesystem operations
- **Edge cases**: Unicode support, error handling, security validation
- **Command chaining**: Complex operator combinations and exit code propagation

Test files are located in `test/` directory with parallel structure to `app/` directory.

## Build Configuration

### Vercel Deployment

The project uses Vercel preset in `react-router.config.ts`:

- SSR enabled with prerendering for `/` and `/portfolio`
- Different build outputs for Vercel vs local testing
- Use `yarn start` for Vercel, `yarn start:local` for local production testing

### TypeScript Configuration

- Strict mode enabled with `verbatimModuleSyntax`
- Path aliases: `~/*` maps to `./app/*`
- Includes React Router v7 types and Vitest globals

### TailwindCSS

- Version 4 with Catppuccin Mocha theme
- Custom color scheme for terminal aesthetics
- Configured via `@tailwindcss/vite` plugin

## Code Style

### Prettier Configuration

- 160 character line width
- Single quotes, trailing commas
- Import sorting with specific order: React → React Router → External → Internal → Relative
- TailwindCSS class sorting enabled

### Import Patterns

```typescript
// Use ~ alias for internal imports
// External imports before internal
import { useEffect, useState } from 'react';

import type { FileSystemNode } from '~/routes/terminal/types/filesystem';
import { getNodeAtPath } from '~/routes/terminal/utils/filesystem';
```

## Key Development Notes

### Filesystem Persistence

Each filesystem mode (default/portfolio) maintains separate localStorage state. The persistence system handles:

- Automatic saving after 1 second of inactivity
- Mode-specific storage keys
- Backup and restore functionality
- Storage quota validation

### Text Editor Integration

The vim-inspired text editor supports:

- Modal editing (NORMAL/INSERT modes)
- File operations (save, quit, force quit)
- Unicode and emoji support with proper cursor positioning
- Full keyboard navigation and vim shortcuts

### Command Development

When adding new commands:

1. Implement in `commands.ts` with proper exit codes
2. Add to command registry and autocompletion in `autocompletion.ts`
3. Create manual page in `defaultFilesystems.ts`
4. Add comprehensive tests in `test/utils/` and `test/integration/`

### Performance Considerations

- In-memory filesystem with efficient path resolution
- Debounced persistence to avoid excessive localStorage writes
- Lazy loading of command history from filesystem
- Modular command parsing for better tree-shaking
