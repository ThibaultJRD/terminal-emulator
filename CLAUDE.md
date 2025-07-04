# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based terminal emulator built with React Router v7, TypeScript, and TailwindCSS. The application features an in-memory file system, basic Unix commands, command history, autocompletion, and a beautiful Catppuccin Mocha theme.

## Development Commands

- `npm run dev` - Start development server with HMR (usually at http://localhost:5173)
- `npm run build` - Create production build
- `npm run start` - Start production server (serves from build/server/index.js)
- `npm run typecheck` - Generate React Router types and run TypeScript compiler

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
│   └── home.tsx            # Main terminal route
├── components/
│   └── Terminal.tsx        # Main terminal component
├── types/
│   └── filesystem.ts       # TypeScript types for filesystem
├── utils/
│   ├── filesystem.ts       # In-memory filesystem utilities
│   ├── commands.ts         # Terminal command implementations
│   └── autocompletion.ts   # Tab completion system
└── app.css                 # Global styles with Catppuccin theme
```

### Terminal Features
- **Commands**: cd, ls, pwd, touch, cat, mkdir, rm, rmdir, clear, help
- **File System**: In-memory hierarchical filesystem with configurable structure
- **History**: Arrow key navigation through command history
- **Autocompletion**: Tab completion for commands and file paths
- **Theme**: Catppuccin Mocha colorscheme with monospace font

### Key Patterns
- CSR mode is used instead of SSR for better terminal state management
- All TypeScript imports use `type` imports where appropriate due to `verbatimModuleSyntax`
- Filesystem state is managed in React component state
- Commands are implemented as pure functions that return results
- Autocompletion handles both command names and file paths

### Catppuccin Theme
The application uses Catppuccin Mocha theme colors defined in `app.css`:
- Background: `--color-ctp-base` (#1e1e2e)
- Text: `--color-ctp-text` (#cdd6f4)
- Prompt: `--color-ctp-green` (#a6e3a1)
- Errors: `--color-ctp-red` (#f38ba8)
- Directories: `--color-ctp-blue` (#89b4fa)

## Development Notes

- Always run `npm run typecheck` after making changes to ensure TypeScript compliance
- The filesystem is initialized with a default structure but can be customized in `utils/filesystem.ts`
- Command implementations follow Unix-like behavior and error messages
- Tab completion supports both single completion and showing multiple options