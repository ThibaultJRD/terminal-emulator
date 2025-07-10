# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based terminal emulator built with React Router v7, TypeScript, and TailwindCSS. The application features an in-memory file system, basic Unix commands, command history, autocompletion, and a beautiful Catppuccin Mocha theme. It serves as both a technical demonstration and an interactive portfolio platform.

## Development Commands

- `yarn dev` - Start development server with HMR (usually at <http://localhost:5173>)
- `yarn build` - Create production build
- `yarn start` - Start production server (serves from build/server/index.js) - **For Vercel deployment**
- `yarn start:local` - Start production server locally (serves from build/server/nodejs_eyJydW50aW1lIjoibm9kZWpzIn0/index.js) - **For local testing**
- `yarn typecheck` - Generate React Router types and run TypeScript compiler
- `yarn test` - Run comprehensive test suite (unit and integration tests)

## Configuration

### Route-Based Filesystem Modes

The application now supports multiple filesystem modes through different routes:

- **`/` (Root Route)** - Default Unix-like filesystem with /home, /etc, /var, etc.
- **`/portfolio`** - Portfolio-focused structure with /about, /projects, /contact, /blog

### Filesystem Mode Selection

Filesystem modes are determined by the route accessed:

- Visiting `{domain}/` loads the default Unix-like filesystem
- Visiting `{domain}/portfolio` loads the portfolio-focused filesystem
- The `reset-fs` command resets to the filesystem mode based on the current route

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
├── routes.ts                # Route configuration with default and portfolio routes
├── routes/
│   ├── terminal/
│   │   ├── terminal.tsx     # Default terminal route (Unix filesystem)
│   │   ├── components/
│   │   │   └── Terminal.tsx # Main terminal component (accepts mode prop)
│   │   ├── types/
│   │   │   └── filesystem.ts # TypeScript types for filesystem
│   │   └── utils/
│   │       ├── filesystem.ts        # In-memory filesystem utilities
│   │       ├── commands.ts          # Terminal command implementations
│   │       ├── commandParser.ts     # Command parsing with redirection support
│   │       ├── optionParser.ts      # Unix-style option parsing (e.g., -la, -rf)
│   │       ├── aliasManager.ts      # Alias system management and resolution
│   │       ├── shellParser.ts       # Shell script parsing with security validation
│   │       ├── autocompletion.ts    # Tab completion system
│   │       ├── defaultFilesystems.ts # Default and portfolio filesystem definitions
│   │       └── markdown.ts          # Markdown rendering with Catppuccin
│   └── portfolio/
│       └── portfolio.tsx    # Portfolio route (portfolio filesystem)
├── test/                    # Comprehensive test suite
│   ├── utils/              # Unit tests for utilities
│   └── integration/        # Integration tests for commands
└── app.css                 # Global styles with Catppuccin theme
```

### Terminal Features

- **Commands**: cd, ls, pwd, touch, cat, mkdir, rm, rmdir, clear, help, echo, wc, reset-fs, alias, unalias, source
- **Command Options**: Advanced option parsing supporting combined flags
  - `ls -a` (show hidden), `-l` (long format), `-la` (combined)
  - `mkdir -p` (create parent directories)
  - `rm -r` (recursive), `-f` (force), `-rf` (combined)
- **File System**: In-memory hierarchical filesystem with route-based structure selection
  - Default route (`/`): Unix-like filesystem with /home, /etc, /var directories
  - Portfolio route (`/portfolio`): Portfolio-focused structure with /about, /projects, /contact, /blog
- **Redirection**: Full I/O redirection support
  - `command > file` - Write output to file (overwrite)
  - `command >> file` - Append output to file
  - `command < file` - Read input from file
  - `command << delimiter` - Heredoc input (simplified)
- **Alias System**: Comprehensive alias management with security features
  - `alias name='command'` - Create command shortcuts
  - `alias name='command $1 $2'` - Parameter substitution support
  - `unalias name` - Remove aliases, `unalias -a` for all
  - `source file.sh` - Load aliases from shell script files
  - Circular reference detection and dangerous command blocking
- **Shell Script Parsing**: Safe parsing of shell script files
  - Comment handling (`# comments`)
  - Alias definition parsing (quoted and unquoted syntax)
  - Export statement recognition (parsed but not executed)
  - Comprehensive error reporting with line numbers
- **History**: Arrow key navigation through command history
- **Autocompletion**: Tab completion for commands, file paths, aliases, and redirection
- **Markdown Rendering**: cat command renders .md files with Catppuccin-styled formatting
- **Theme**: Catppuccin Mocha colorscheme with monospace font

### Key Patterns

- CSR mode is used instead of SSR for better terminal state management
- All TypeScript imports use `type` imports where appropriate due to `verbatimModuleSyntax`
- Use `~/*` path alias for absolute imports (pre-configured by React Router)
- Filesystem state is managed in React component state
- Commands return structured output (string or OutputSegment[]) for rich formatting
- Markdown files are parsed and rendered with Catppuccin theme colors
- Autocompletion handles command names, file paths, aliases, and redirection operators
- Modular command system with separate parsers for commands, options, redirection, and aliases
- Path resolution supports both relative and absolute paths throughout the system
- Option parsing follows Unix conventions (short flags, combined flags, long options)
- Alias system with parameter substitution, circular reference detection, and security validation
- Shell script parsing with safe syntax recognition and comprehensive error handling

### Catppuccin Theme

The application uses Catppuccin Mocha theme colors defined in `app.css`:

- Background: `--color-ctp-base` (#1e1e2e)
- Text: `--color-ctp-text` (#cdd6f4)
- Prompt: `--color-ctp-green` (#a6e3a1)
- Errors: `--color-ctp-red` (#f38ba8)
- Directories: `--color-ctp-blue` (#89b4fa)

### Portfolio Content

The portfolio filesystem (`/portfolio` route) contains real professional information:

- **About Directory** (`/about/`):
  - `bio.md` - Professional summary for Thibault Jaillard, Senior Mobile Developer
  - `skills.json` - Comprehensive technical skills including React Native, TypeScript, blockchain
  - `cv.pdf` - Curriculum vitae with career highlights
  - `philosophy.txt` - Development philosophy and approach

- **Projects Directory** (`/projects/`):
  - `fruitz-app/` - Dating app with 50k+ downloads, acquired by Bumble
  - `banking-app/` - BNC Banking App serving 4M+ monthly users
  - `blockchain-projects/` - Lum Network Explorer, Chain-Bridge, Cosmos Millions
  - `other-projects/` - Bonjour Menu (COVID-19 solution), Terminal Emulator

- **Contact Directory** (`/contact/`):
  - `info.txt` - Contact information and professional status
  - `social.json` - Professional links and project details

- **Blog Directory** (`/blog/`):
  - Technical articles and development insights
  - `2024/terminal-emulator.md` - Deep dive into building the terminal emulator

## Testing

The project includes a comprehensive test suite using Vitest:

### Test Structure

- **Unit Tests**: Test individual utilities and parsers
  - `test/utils/filesystem.test.ts` - Filesystem operations
  - `test/utils/commandParser.test.ts` - Command parsing with redirection
  - `test/utils/optionParser.test.ts` - Unix-style option parsing
  - `test/utils/commands.test.ts` - Individual command implementations
  - `test/utils/autocompletion.test.ts` - Tab completion functionality
  - `test/utils/aliasManager.test.ts` - Alias system management and resolution
  - `test/utils/shellParser.test.ts` - Shell script parsing validation

- **Integration Tests**: Test complete command workflows
  - `test/integration/commandExecution.test.ts` - End-to-end command execution
  - `test/integration/aliasIntegration.test.ts` - Alias resolution and parameter substitution
  - Tests redirection, complex scenarios, alias functionality, and error handling

### Running Tests

```bash
yarn test          # Run all tests
yarn test -- --watch  # Run tests in watch mode
yarn test -- --coverage  # Run tests with coverage report
```

### Test Coverage

- Commands: All commands tested with various options and edge cases
- Parsing: Command parsing, option parsing, redirection operators, and shell script parsing
- Filesystem: File operations, path resolution, and directory navigation
- Autocompletion: Command completion, path completion, alias completion, and redirection completion
- Alias System: Alias creation, deletion, resolution, parameter substitution, and circular reference detection
- Shell Script Parsing: Syntax validation, comment handling, alias definition parsing, and error reporting
- Integration: Complex workflows, error scenarios, alias functionality, and real-world usage patterns

## Deployment

### Vercel (Recommended)

The project is configured for easy deployment on Vercel:

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Deploy**: Vercel will automatically use the configuration in `vercel.json`

#### Vercel Configuration

- **Build Command**: `yarn build`
- **Output Directory**: `build/client`
- **SPA Routing**: Configured with rewrites to handle client-side routing
- **Asset Caching**: Static assets cached for 1 year with immutable headers

#### Route-based Filesystem

The application automatically serves the appropriate filesystem based on the accessed route:

- **`/`** - Default Unix-like filesystem
- **`/portfolio`** - Portfolio-focused filesystem structure

### Alternative Platforms

- **Netlify**: Requires `_redirects` file for SPA routing
- **Firebase Hosting**: Configure `firebase.json` with rewrites
- **GitHub Pages**: Limited but free option

## Development Notes

- Always run `yarn typecheck` after making changes to ensure TypeScript compliance
- Run `yarn test` to ensure all functionality works correctly
- The filesystem is initialized with a default structure but can be customized in `app/constants/defaultFilesystems.ts`
- Command implementations follow Unix-like behavior and error messages
- Tab completion supports single completion, multiple options, aliases, and redirection contexts
- Markdown rendering supports headers, bold/italic, code blocks, links, lists, blockquotes, and horizontal rules
- The cat command automatically detects .md files and applies syntax highlighting with Catppuccin colors
- Redirection operators are parsed before command execution and handle both string and array outputs
- Option parsing supports both individual flags (-a -l) and combined flags (-al)
- Path resolution works consistently across all commands and supports nested directory structures
- Alias system integrates with command resolution and autocompletion
- Shell script parsing follows safe practices with comprehensive validation and error handling
- AliasManager provides centralized alias management with persistence support
- Parameter substitution in aliases supports $1, $2, $\*, $@ patterns with proper escaping

## Security Features

The application implements several security measures to protect against common vulnerabilities:

### Input Validation

- **Command Length Limits**: Commands are limited to 1000 characters to prevent ReDoS attacks
- **Filename Validation**: Filenames are validated for length (255 chars) and forbidden characters
- **Path Validation**: Path segments are validated against forbidden characters and reserved names
- **URL Protocol Validation**: Markdown links are restricted to safe protocols (http/https/mailto)

### Resource Limits

- **File Size Limits**: Individual files are limited to 5MB to prevent memory exhaustion
- **Filesystem Size Limits**: Total filesystem size is limited to 50MB
- **Directory File Limits**: Maximum 1000 files per directory
- **Path Depth Limits**: Maximum 20 levels of nested directories

### Data Protection

- **localStorage Validation**: All persisted data is validated before parsing
- **Size Limits**: localStorage data is limited to 10MB to prevent abuse
- **Error Handling**: Comprehensive error handling prevents information leakage
- **Regex Security**: Improved regex patterns prevent ReDoS vulnerabilities

### Alias System Security

- **Input Validation**: Alias names validated with strict regex patterns
- **Command Validation**: Dangerous commands blocked during alias creation
- **Circular Reference Protection**: Maximum recursion depth prevents infinite loops
- **Parameter Sanitization**: Safe parameter substitution in alias resolution
- **Size Limits**: Alias names and commands limited to prevent abuse

### Safe Defaults

- **No eval()**: The application never uses eval() or similar dangerous functions
- **Client-side Only**: No server-side processing reduces attack surface
- **TypeScript**: Strong typing helps prevent many common vulnerabilities
- **Modular Architecture**: Well-separated concerns make security easier to maintain
- **Safe Parsing**: Shell scripts parsed without arbitrary command execution

### Static Files and Well-Known Routes

For `.well-known` routes and other static files, place them in the `public/` directory:

- Files in `public/` are served directly by the web server without React Router processing
- Example: `public/.well-known/apple-app-site-association` will be accessible at `/.well-known/apple-app-site-association`
- This approach is more efficient than creating React routes for static content
- Common use cases: SSL certificates, app associations, security.txt, robots.txt, etc.

## Alias System Usage

### Creating and Managing Aliases

```bash
# Create simple aliases
alias ll='ls -la'
alias la='ls -a'
alias '..'='cd ..'

# Create aliases with parameter substitution
alias backup='cp $1 $1.backup'        # Single parameter
alias search='find . -name "*$1*"'     # Parameter in string
alias multi='command $1 $2 $3'         # Multiple parameters
alias all='grep $* file.txt'           # All parameters

# List and remove aliases
alias                                   # List all aliases
alias ll                                # Show specific alias
unalias ll                              # Remove specific alias
unalias -a                              # Remove all aliases
```

### Shell Script Integration

```bash
# Create shell script with aliases
cat > myaliases.sh << 'EOF'
# Development aliases
alias ll='ls -la'
alias la='ls -a'
alias grep='grep --color=auto'

# Git shortcuts
alias gs='git status'
alias ga='git add'
alias gc='git commit'
EOF

# Load aliases from script
source myaliases.sh
```

### Security Considerations

- Alias names must follow strict validation rules
- Dangerous commands are blocked during alias creation
- Circular reference detection prevents infinite loops
- Parameter substitution is safely handled
- Shell script parsing is done without command execution

### Important: Vercel Preset Build Structure

This project uses the `@vercel/react-router` preset, which creates a different build structure than standard React Router v7 projects:

- **Standard build**: `build/server/index.js`
- **With Vercel preset**: `build/server/nodejs_eyJydW50aW1lIjoibm9kZWpzIn0/index.js`

**For local development and testing:**

- Use `yarn build && yarn start:local` to test the production build locally
- Use `yarn start` only for Vercel deployment (will fail locally)

**Why this happens:**
The Vercel preset optimizes the build for Vercel's serverless environment, creating runtime-specific folders that don't match the standard React Router build structure.
