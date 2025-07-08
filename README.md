# 🖥️ Terminal Emulator

A modern and elegant terminal emulator built with React Router v7, TypeScript, and TailwindCSS. This application features an in-memory file system, basic Unix commands, command history, autocompletion, and a beautiful Catppuccin Mocha theme. Experience both a traditional Unix environment and an interactive portfolio showcasing real professional projects and experience.

![Terminal Emulator](https://img.shields.io/badge/React_Router-v7-blue?logo=react-router)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss)
![Tests](https://img.shields.io/badge/Tests-285%20passing-green?logo=vitest)

## 🚀 Live Demo

**[Default Terminal](https://terminal-emulator-nine.vercel.app/)** - Unix-like filesystem experience  
**[Interactive Portfolio](https://terminal-emulator-nine.vercel.app/portfolio)** - Explore professional experience

Experience the full-featured terminal emulator directly in your browser! The live demo includes all features: Unix commands, file system persistence, text editor, and more. Try both modes to see the difference!

## ✨ Features

### 🎯 Unix Commands

- **Navigation**: `cd`, `pwd`, `ls` (with options `-a`, `-l`, `-la`)
- **Files**: `touch`, `cat`, `rm` (with `-r`, `-f`), `rmdir`
- **Directories**: `mkdir` (with `-p` to create parents)
- **Text Editor**: `vi` (vim-inspired editor with INSERT/NORMAL modes)
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

- **285 tests** with comprehensive coverage
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

# Production server (Vercel deployment)
yarn run start

# Production server (local testing)
yarn run start:local

# TypeScript checking
yarn run typecheck

# Testing
yarn test
yarn test -- --watch     # Watch mode
yarn test -- --coverage  # With coverage
```

### Important: Local Development vs Production

Due to the Vercel preset configuration, the build process creates a different server structure:

- **For Vercel deployment**: Use `yarn start` (expects `build/server/index.js`)
- **For local testing**: Use `yarn start:local` (uses `build/server/nodejs_eyJydW50aW1lIjoibm9kZWpzIn0/index.js`)

The Vercel preset optimizes builds for Vercel's serverless environment, creating runtime-specific directories that don't match the standard React Router v7 build structure.

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

The terminal includes a powerful vim-inspired text editor accessible via the `vi` command.

### Editor Features

- **Modal Editing**: NORMAL mode for navigation (default), INSERT mode for typing
- **Vim Shortcuts**: Comprehensive vim navigation and text manipulation commands
- **File Operations**: Save (`:w`), quit (`:q`), save & quit (`:wq`), force quit (`:q!`)
- **Visual Feedback**: Line numbers, status bar, mode indicator, cursor positioning
- **Keyboard Navigation**: Arrow keys, vim hjkl, home/end, page up/down
- **Text Manipulation**: Character deletion, line operations, cursor movement
- **Unicode Support**: Full support for emojis, accented characters, and international text
- **Smart Cursor**: Proper positioning with emoji and Unicode character support
- **Dynamic Viewport**: Automatically adjusts to window size for optimal editing experience

### Usage

```bash
# Open existing file
vi myfile.txt
vi document.md

# Create new file
vi newfile.txt
```

### Editor Commands

#### NORMAL Mode (default)

**Navigation:**

- **h/j/k/l** - Navigate left/down/up/right
- **Arrow keys** - Alternative navigation
- **0** - Beginning of line
- **$** - End of line
- **G** - Go to end of file
- **gg** - Go to beginning of file
- **Page Up/Down** - Navigate by pages
- **Home/End** - Move to line start/end

**Text Operations:**

- **i** - Enter INSERT mode at cursor
- **a** - Append after cursor (INSERT mode)
- **o** - Open new line below cursor (INSERT mode)
- **O** - Open new line above cursor (INSERT mode)
- **x** - Delete character under cursor
- **X** - Delete character before cursor
- **:** - Enter command prompt

#### INSERT Mode

- **Type** to insert text
- **Enter** for new line
- **Backspace/Delete** to remove text
- **Arrow keys** for navigation
- **Tab** - Insert 2 spaces
- **Escape** - Return to NORMAL mode

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
- **Escape** - Switch to NORMAL mode

### Advanced Editor Examples

#### Creating and Editing a Configuration File

```bash
# Create and open a new configuration file
vi config.json

# In the editor (starts in NORMAL mode):
# 1. Press 'i' to enter INSERT mode
# 2. Type your JSON content:
{
  "theme": "catppuccin-mocha",
  "fontSize": 14,
  "features": ["vim-mode", "unicode-support"]
}
# 3. Press Escape to return to NORMAL mode
# 4. Type ':wq' to save and quit
```

#### Editing Code Files

```bash
# Open a JavaScript file
vi script.js

# Navigate and edit:
# - Use 'j' and 'k' to move between lines
# - Press '0' to go to line start, '$' to go to line end
# - Press 'o' to open a new line below and start typing
# - Use 'x' to delete characters
# - Save with ':w' and continue editing
```

#### Working with Unicode and Emojis

```bash
# Create a file with international content
vi international.txt

# The editor fully supports:
# - Accented characters: café, résumé, naïve
# - Unicode symbols: ∀x∈ℝ, α + β = γ
# - Emojis: 🚀 🌟 💻 ⚛️
# - Asian characters: 你好世界, こんにちは, 안녕하세요
```

### Editor Troubleshooting

#### Common Issues and Solutions

**Q: I'm stuck in INSERT mode and can't save**

- **Solution**: Press `Escape` to enter NORMAL mode, then type `:w` to save

**Q: The editor won't let me quit**

- **Solution**: If you have unsaved changes, use `:q!` to force quit without saving, or `:wq` to save and quit

**Q: Cursor positioning looks wrong with emojis**

- **Solution**: The editor uses smart cursor positioning for Unicode characters. This is normal behavior.

**Q: Line numbers don't appear**

- **Solution**: Line numbers are enabled by default. Check if your window is wide enough to display them.

**Q: Text appears cut off**

- **Solution**: The editor dynamically adjusts to window size. Try resizing your browser window.

**Q: Can't type accented characters**

- **Solution**: Make sure you're in INSERT mode (press `i` from NORMAL mode) and your keyboard input method is working.

#### Best Practices

1. **Always start in NORMAL mode**: Remember the editor opens in NORMAL mode by default
2. **Save frequently**: Use `:w` to save your work regularly
3. **Use proper navigation**: Learn vim keys (hjkl) for efficient movement
4. **Check the status bar**: Monitor your current mode and cursor position
5. **Unicode awareness**: The editor handles Unicode properly, but complex scripts may need special attention

## 🗂️ Filesystem Configuration

The terminal supports multiple filesystem modes through different routes, providing both a traditional Unix-like environment and an interactive portfolio experience.

### Route-Based Filesystem Modes

#### Default Route (`/`)

A comprehensive Unix-like filesystem with:

- `/home/user/` - User directory with documents and projects
- `/etc/` - System configuration files
- `/var/log/` - System logs and web content
- `/tmp/` - Temporary files
- `/usr/` - User programs and documentation
- `/root/` - Administrator files

#### Portfolio Route (`/portfolio`)

An interactive portfolio showcasing real professional experience:

- `/about/` - Professional bio, skills, CV, and development philosophy
- `/projects/` - Real projects including:
  - **Fruitz App**: Dating app with 50k+ downloads, acquired by Bumble
  - **BNC Banking App**: Mobile banking serving 4M+ monthly users
  - **Blockchain Projects**: Lum Network Explorer, Chain-Bridge, Cosmos Millions
  - **Other Projects**: Bonjour Menu (COVID-19 solution), Terminal Emulator
- `/contact/` - Contact information and professional social links
- `/blog/` - Technical articles and development insights

### Accessing Different Modes

Simply navigate to different URLs to access different filesystem modes:

```bash
# Access default Unix-like filesystem
https://your-domain.com/

# Access interactive portfolio
https://your-domain.com/portfolio
```

### Legacy Environment Variable Configuration

The `VITE_FILESYSTEM_MODE` environment variable is still used for the `reset-fs` command:

```bash
# Configure which filesystem the reset-fs command uses
VITE_FILESYSTEM_MODE=default npm run build   # Reset to Unix filesystem
VITE_FILESYSTEM_MODE=portfolio npm run build # Reset to portfolio filesystem
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
- **Route-specific persistence**: Each route (default vs portfolio) maintains its own filesystem state
- **Mode consistency**: Filesystem mode determined by the current route

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

- **Unit Tests** (203 tests)
  - File system operations and persistence
  - Command implementations (including text editor commands)
  - Command and option parsers with advanced features
  - Text editor functionality (69 comprehensive tests)
  - Autocompletion system with Unicode support
- **Integration Tests** (91 tests)
  - Complete command execution workflows
  - Text editor integration with filesystem
  - I/O redirection scenarios with Unicode content
  - Unicode and emoji support across all features
  - Error handling and edge cases

### Coverage

- ✅ All commands with comprehensive option testing
- ✅ Advanced parsing and I/O redirection
- ✅ Navigation and path resolution with Unicode
- ✅ Complete text editor functionality (modes, vim commands, file operations)
- ✅ Autocompletion in all contexts including Unicode filenames
- ✅ Unicode and emoji support throughout the system
- ✅ Error scenarios, edge cases, and performance testing
- ✅ Browser storage and persistence functionality

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

## 🔐 Security Features

The terminal emulator implements comprehensive security measures to ensure safe operation:

### 🛡️ Input Validation

- **Command Length Limits**: Commands are limited to 1,000 characters to prevent ReDoS attacks
- **Filename Validation**: Filenames are validated for length (255 chars) and forbidden characters
- **Path Validation**: Path segments are validated against forbidden characters and reserved names
- **URL Protocol Validation**: Markdown links are restricted to safe protocols (http/https/mailto)

### 📏 Resource Limits

- **File Size Limits**: Individual files are limited to 5MB to prevent memory exhaustion
- **Filesystem Size Limits**: Total filesystem size is limited to 50MB
- **Directory File Limits**: Maximum 1,000 files per directory
- **Path Depth Limits**: Maximum 20 levels of nested directories

### 🔒 Data Protection

- **localStorage Validation**: All persisted data is validated before parsing
- **Size Limits**: localStorage data is limited to 10MB to prevent abuse
- **Error Handling**: Comprehensive error handling prevents information leakage
- **Regex Security**: Improved regex patterns prevent ReDoS vulnerabilities

### ✅ Safe Defaults

- **No eval()**: The application never uses eval() or similar dangerous functions
- **Client-side Only**: No server-side processing reduces attack surface
- **TypeScript**: Strong typing helps prevent many common vulnerabilities
- **Modular Architecture**: Well-separated concerns make security easier to maintain

### 🔍 Security Testing

All security features are thoroughly tested:

```bash
# Run security-focused tests
yarn test

# Check for vulnerabilities in dependencies
yarn audit

# Verify TypeScript compliance
yarn typecheck
```

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
