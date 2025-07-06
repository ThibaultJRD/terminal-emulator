# 🖥️ Terminal Emulator

A modern and elegant terminal emulator built with React Router v7, TypeScript, and TailwindCSS. This application features an in-memory file system, basic Unix commands, command history, autocompletion, and a beautiful Catppuccin Mocha theme.

![Terminal Emulator](https://img.shields.io/badge/React_Router-v7-blue?logo=react-router)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss)
![Tests](https://img.shields.io/badge/Tests-135%20passing-green?logo=vitest)

## ✨ Features

### 🎯 Unix Commands

- **Navigation**: `cd`, `pwd`, `ls` (with options `-a`, `-l`, `-la`)
- **Files**: `touch`, `cat`, `rm` (with `-r`, `-f`), `rmdir`
- **Directories**: `mkdir` (with `-p` to create parents)
- **Text Editor**: `nano`, `vi` (vim-inspired editor with INSERT/COMMAND modes)
- **Filesystem Management**: `reset-fs`, `storage-info`
- **Utilities**: `echo`, `wc`, `clear`, `help`

### 🔄 I/O Redirection

- `command > file` - Write output to file (overwrite)
- `command >> file` - Append output to file
- `command < file` - Read input from file
- `command << delimiter` - Heredoc (simplified implementation)

### 🗂️ File System

- **Multiple Modes**: Default Unix-like and Portfolio filesystem structures
- **Persistence**: Browser localStorage for session management
- **In-memory**: Hierarchical file system with full Unix-like features
- **Path Support**: Relative and absolute paths with proper resolution
- **Hidden Files**: Support for dotfiles (starting with `.`)
- **Realistic Content**: Demo files with actual useful content

### 🎨 User Interface

- **Theme**: Catppuccin Mocha with consistent colors
- **History**: Navigation with ↑/↓ arrow keys
- **Autocompletion**: Tab completion for commands, files, and filesystem modes
- **Markdown**: Rendering of `.md` files with syntax highlighting
- **Text Editor**: Full-screen vim-inspired editor with modal editing
- **Responsive**: Works on desktop and mobile devices

### 🧪 Testing

- **135 tests** with comprehensive coverage
- Unit and integration tests
- Vitest framework with jsdom
- All critical scenarios covered

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- yarn

### Installation

```bash
# Clone the project
git clone https://github.com/ThibaultJRD/terminal-emulator.git
cd terminal-emulator

# Install dependencies
yarn install

# Start in development mode
yarn run dev
```

The application will be available at `http://localhost:5173`

## 🛠️ Development Commands

```bash
# Development with hot reload
yarn run dev

# Production build
yarn run build

# Production server
yarn run start

# TypeScript checking
yarn run typecheck

# Testing
yarn test
yarn test -- --watch     # Watch mode
yarn test -- --coverage  # With coverage
```

## 📁 Project Structure

```
app/
├── root.tsx                 # Root layout with favicon
├── routes.ts                # Route configuration
├── routes/terminal/
│   ├── terminal.tsx         # Main terminal route
│   ├── components/
│   │   ├── Terminal.tsx     # Main terminal component
│   │   └── TextEditor.tsx   # Vim-inspired text editor
│   ├── types/
│   │   └── filesystem.ts    # TypeScript types
│   └── utils/
│       ├── filesystem.ts    # File system utilities with persistence
│       ├── commands.ts      # Command implementations + new commands
│       ├── commandParser.ts # Parsing with redirection
│       ├── optionParser.ts  # Unix option parsing
│       ├── autocompletion.ts # Autocompletion system + new commands
│       ├── markdown.ts      # Markdown rendering
│       ├── defaultFilesystems.ts # Default and portfolio filesystems
│       ├── persistence.ts   # Browser localStorage management
│       └── textEditor.ts    # Text editor state and logic
├── test/                    # Comprehensive test suite
│   ├── utils/              # Unit tests
│   └── integration/        # Integration tests
└── app.css                 # Global Catppuccin styles
```

## 🎮 Usage Guide

### Basic Commands

```bash
# Navigation
pwd                    # Print working directory
ls                     # List files
ls -a                  # Include hidden files
ls -l                  # Detailed format
ls -la                 # Combined: detailed + hidden
cd documents           # Change directory
cd ..                  # Go up one level
cd /                   # Go to root

# File Management
touch file.txt         # Create empty file
cat file.txt           # Display content
cat document.md        # Markdown rendering with syntax
echo "Hello" > file    # Write to file
echo "World" >> file   # Append to file

# Directory Management
mkdir folder           # Create directory
mkdir -p a/b/c         # Create with parents
rm file.txt            # Remove file
rm -r folder           # Remove recursively
rm -f nonexistent      # Force (no error)
rmdir empty_folder     # Remove empty directory

# Text Editor
nano file.txt          # Open file in nano text editor
vi document.md         # Open file in vi text editor

# Filesystem Management
reset-fs               # Reset to deployment-configured filesystem
storage-info           # Show storage information

# Utilities
wc file.txt            # Count lines/words/characters
clear                  # Clear screen
help                   # Command help
```

### Advanced Redirection

```bash
# Output
ls -la > filelist.txt          # Save listing
echo "Log entry" >> log.txt    # Append to log

# Input
wc < document.txt              # Count from file
cat << EOF                     # Simplified heredoc
```

### Autocompletion

- `Tab` after partial command → completes the command
- `Tab` after partial path → completes file/directory
- `Tab` after `>` or `>>` → completes destination files
- `Tab` after `<` → completes source files only

## 📝 Text Editor

The terminal includes a powerful vim-inspired text editor accessible via `nano` or `vi` commands.

### Editor Features

- **Modal Editing**: INSERT mode for typing, COMMAND mode for operations
- **Vim Shortcuts**: Basic vim navigation and commands
- **File Operations**: Save (`:w`), quit (`:q`), save & quit (`:wq`)
- **Visual Feedback**: Line numbers, status bar, mode indicator
- **Keyboard Navigation**: Arrow keys, hjkl, home/end, page up/down

### Usage

```bash
# Open existing file
nano myfile.txt
vi document.md

# Create new file
nano newfile.txt
```

### Editor Commands

#### INSERT Mode (default)

- **Type** to insert text
- **Enter** for new line
- **Backspace/Delete** to remove text
- **Arrow keys** for navigation
- **Escape** to enter COMMAND mode

#### COMMAND Mode

- **i** - Enter INSERT mode
- **a** - Append after cursor (INSERT mode)
- **o** - Open new line below (INSERT mode)
- **h/j/k/l** - Navigate left/down/up/right
- **0** - Beginning of line
- **$** - End of line
- **G** - Go to end of file
- **x** - Delete character under cursor
- **X** - Delete character before cursor
- **:** - Enter command prompt

#### Command Prompt (after pressing :)

- **:w** - Save file
- **:q** - Quit (fails if unsaved changes)
- **:q!** - Force quit without saving
- **:wq** - Save and quit
- **:help** - Show help

### Keyboard Shortcuts

- **Ctrl+S** - Save file (any mode)
- **Ctrl+C** - Quit editor (prompts if unsaved)
- **Tab** - Insert 2 spaces
- **Escape** - Switch to COMMAND mode

## 🗂️ Filesystem Configuration

The terminal supports multiple filesystem modes configured at deployment time.

### Available Modes

#### Default Mode

A comprehensive Unix-like filesystem with:

- `/home/user/` - User directory with documents and projects
- `/etc/` - System configuration files
- `/var/log/` - System logs and web content
- `/tmp/` - Temporary files
- `/usr/` - User programs and documentation
- `/root/` - Administrator files

#### Portfolio Mode

A portfolio-focused structure designed for showcasing:

- `/about/` - Personal information, skills, CV
- `/projects/` - Software projects and demos
- `/contact/` - Contact information and social links
- `/blog/` - Technical articles and blog posts

### Configuration

Filesystem mode is configured at deployment time using the `VITE_FILESYSTEM_MODE` environment variable:

```bash
# Development (defaults to 'default')
npm run dev

# Production with portfolio mode
VITE_FILESYSTEM_MODE=portfolio npm run build

# Production with default mode (explicit)
VITE_FILESYSTEM_MODE=default npm run build
```

### Filesystem Management Commands

```bash
# Reset to deployment-configured filesystem
reset-fs

# View storage information
storage-info
```

### Browser Persistence

The filesystem automatically saves to browser localStorage:

- **Auto-save**: Changes saved automatically after 1 second of inactivity
- **Session restore**: Filesystem state restored on page reload
- **Mode consistency**: Filesystem mode determined by deployment configuration

### Custom Filesystem Development

To create your own filesystem mode:

1. **Define the structure** in `app/routes/terminal/utils/defaultFilesystems.ts`:

```typescript
export function createCustomFilesystem(): FileSystemNode {
  return {
    name: '/',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    size: 4096,
    createdAt: new Date(),
    modifiedAt: new Date(),
    children: {
      'my-folder': {
        name: 'my-folder',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          'my-file.txt': {
            name: 'my-file.txt',
            type: 'file',
            content: 'Hello, custom filesystem!',
            permissions: '-rw-r--r--',
            size: 27,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        },
      },
    },
  };
}
```

2. **Add to mode list** in the same file:

```typescript
export const FILESYSTEM_MODES = ['default', 'portfolio', 'custom'] as const;
```

3. **Update the mode getter**:

```typescript
export function getFilesystemByMode(mode: FilesystemMode): FileSystemNode {
  switch (mode) {
    case 'portfolio':
      return createPortfolioFilesystem();
    case 'custom':
      return createCustomFilesystem();
    case 'default':
    default:
      return createDefaultFilesystem();
  }
}
```

### File and Directory Structure

```typescript
// Directory structure
'directory-name': {
  type: 'directory' as const,
  permissions: 'drwxr-xr-x',
  size: 4096,
  createdAt: new Date(),
  modifiedAt: new Date(),
  children: {
    // nested files/folders
  }
}

// File structure
'file.txt': {
  type: 'file' as const,
  content: 'Your file content here',
  permissions: '-rw-r--r--',
  size: 25, // content.length
  createdAt: new Date(),
  modifiedAt: new Date(),
}
```

### Use Cases

- **Portfolio websites**: Showcase projects and skills
- **Educational demos**: Teach Unix commands and filesystem concepts
- **Development environments**: Prototype terminal applications
- **Documentation systems**: Interactive command-line documentation
- **Company demos**: Custom branded filesystem for presentations

## 📊 Storage Management

The terminal provides tools to manage browser storage usage.

### Storage Commands

```bash
# View storage information
storage-info
```

Shows:

- Total terminal storage usage
- Filesystem data size
- Backup status
- Last save timestamp

### Storage Considerations

- **Quota**: Browser localStorage typically has 5-10MB limit
- **Cleanup**: Reset filesystem to free up space
- **Backups**: Previous filesystems backed up when switching modes
- **Efficiency**: Only changed files consume additional space

## 🧪 Testing

### Test Structure

- **Unit Tests** (115 tests)
  - File system operations
  - Command and option parsers
  - Individual commands
  - Autocompletion
- **Integration Tests** (20 tests)
  - Complete command execution
  - Redirection scenarios
  - Error handling

### Coverage

- ✅ All commands with options
- ✅ Parsing and redirection
- ✅ Navigation and path resolution
- ✅ Autocompletion in all contexts
- ✅ Error scenarios and edge cases

## 🎨 Catppuccin Theme

The project uses the Catppuccin Mocha theme with consistent colors:

- **Background**: `#1e1e2e` (Base)
- **Text**: `#cdd6f4` (Text)
- **Prompt**: `#a6e3a1` (Green)
- **Errors**: `#f38ba8` (Red)
- **Directories**: `#89b4fa` (Blue)
- **Files**: `#cdd6f4` (Text)

## 🏗️ Technical Architecture

### Frameworks and Tools

- **React Router v7**: CSR mode for better state management
- **TypeScript**: Strict mode with `verbatimModuleSyntax`
- **TailwindCSS v4**: Custom Catppuccin theme
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework

### Key Patterns

- In-memory file system with React state
- Modular parsers (commands, options, redirection)
- Structured output (string or OutputSegment[])
- Unified path resolution
- Contextual autocompletion

## 🚀 Deployment

### Docker

```bash
docker build -t terminal-emulator .
docker run -p 3000:3000 terminal-emulator
```

### Supported Platforms

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

## 🤝 Contributing

1. Fork the project
2. Create a branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### Guidelines

- Run `yarn run typecheck` before committing
- All tests must pass (`yarn test`)
- Follow project TypeScript conventions
- Use `~/*` alias for absolute imports

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/ThibaultJRD">ThibaultJRD</a> and Catppuccin theme 🐱</p>
  <p>
    <a href="https://github.com/ThibaultJRD/terminal-emulator/blob/master/README.md#%EF%B8%8F-terminal-emulator">Back to top</a>
  </p>
</div>
