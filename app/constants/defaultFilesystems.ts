import type { FileSystemNode } from '~/routes/terminal/types/filesystem';

/**
 * Creates a comprehensive default Unix-like filesystem structure for testing and demos.
 * This structure includes typical Unix directories and realistic sample content.
 */
export function createDefaultFilesystem(): FileSystemNode {
  return {
    name: '/',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    size: 4096,
    createdAt: new Date(),
    modifiedAt: new Date(),
    children: {
      home: {
        name: 'home',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          user: {
            name: 'user',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              documents: {
                name: 'documents',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'readme.txt': {
                    name: 'readme.txt',
                    type: 'file',
                    content: `Welcome to the Modern Terminal Emulator!

🚀 This is a cutting-edge web-based terminal featuring:
- In-memory filesystem with persistence
- Full Unix-like command suite
- Advanced I/O redirection (>, >>, <)
- Smart autocompletion with Tab
- Markdown rendering with syntax highlighting
- Vi-style text editor with modal editing
- Route-based filesystem modes

✨ Quick Start Commands:
- ls -la          # List all files (including hidden)
- cat notes.md    # View markdown with highlighting
- vi newfile.txt  # Edit files with vim-style editor
- mkdir -p deep/nested/dirs  # Create nested directories
- echo "content" > file.txt  # Output redirection
- wc -l *.txt     # Count lines in text files
- reset-fs        # Reset filesystem to defaults
- storage-info    # View persistence information

🎯 Pro Tips:
- Use arrow keys (↑/↓) for command history
- Tab completion works for commands, files, and paths
- Hidden files start with '.' (try: ls -a)
- Markdown files (.md) render with syntax highlighting
- Try both filesystem modes: default and portfolio

Happy exploring! 🎉`,
                    permissions: '-rw-r--r--',
                    size: 1024,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                  'notes.md': {
                    name: 'notes.md',
                    type: 'file',
                    content: `# Terminal Emulator - Developer Notes

## 🎯 Core Features

### Commands Available
- **Navigation**: \`cd\`, \`pwd\`, \`ls\` (with \`-a\`, \`-l\`, \`-la\`)
- **File Operations**: \`touch\`, \`cat\`, \`rm\` (with \`-r\`, \`-f\`), \`rmdir\`
- **Directory Management**: \`mkdir\` (with \`-p\` for parents)
- **Text Editor**: \`vi\` (vim-inspired with INSERT/NORMAL modes)
- **System**: \`reset-fs\`, \`storage-info\`, \`clear\`, \`help\`
- **Text Processing**: \`echo\`, \`wc\`

### I/O Redirection
\`\`\`bash
# Output redirection
echo "Hello World" > greeting.txt
echo "Line 2" >> greeting.txt

# Input redirection
cat < greeting.txt

# Heredoc (simplified)
cat << EOF
Multiple lines
of content
EOF
\`\`\`

## 🚀 Advanced Usage

### Command Combinations
\`\`\`bash
# Create project structure
mkdir -p project/{src,tests,docs}
touch project/src/main.ts
touch project/tests/main.test.ts

# File analysis
wc -l *.txt          # Count lines in text files
ls -la | grep \.md    # (conceptual - no pipe yet)

# Editing workflow
vi README.md         # Edit with vim-style editor
cat README.md        # View with syntax highlighting
\`\`\`

### Filesystem Modes
\`\`\`bash
# Switch between filesystem modes
reset-fs default     # Unix-like demo filesystem
reset-fs portfolio   # Professional portfolio content
\`\`\`

## 🎨 Modern Features

- **Persistence**: Files saved to localStorage
- **Autocompletion**: Tab completion for everything
- **History**: Arrow key navigation (↑/↓)
- **Markdown**: Catppuccin-themed syntax highlighting
- **Responsive**: Works on mobile and desktop
- **Security**: Input validation and resource limits

## 🔧 Technical Details

**Built with**:
- React Router v7 (CSR mode)
- TypeScript (strict mode)
- TailwindCSS v4
- Catppuccin Mocha theme

**Architecture**:
- In-memory hierarchical filesystem
- Route-based mode switching
- Debounced persistence (500ms)
- Comprehensive test suite (310+ tests)

## 💡 Tips & Tricks

- **Hidden files**: Start with \`.\` (try \`ls -a\`)
- **Quick edit**: \`vi filename\` for instant editing
- **File info**: \`ls -l\` shows permissions and sizes
- **Storage**: \`storage-info\` shows filesystem usage
- **Help**: \`help\` for command reference

---

*This terminal emulator showcases modern web technologies while providing a nostalgic Unix experience. Perfect for developers who miss the command line! 🖥️*`,
                    permissions: '-rw-r--r--',
                    size: 2048,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                  projects: {
                    name: 'projects',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'modern-app.ts': {
                        name: 'modern-app.ts',
                        type: 'file',
                        content: `// Modern TypeScript React Component
import React, { useState, useEffect } from 'react';
import type { FC } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AppProps {
  title: string;
}

const App: FC<AppProps> = ({ title }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <h1>{title}</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;`,
                        permissions: '-rw-r--r--',
                        size: 1024,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'api-client.ts': {
                        name: 'api-client.ts',
                        type: 'file',
                        content: `// Modern API client with error handling
class APIClient {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const url = \`\${this.baseURL}\${endpoint}\`;
    
    const config: RequestInit = {
      method,
      headers: this.headers,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
    }

    return response.json();
  }
}

// Usage example
const api = new APIClient('https://api.example.com');

export default api;`,
                        permissions: '-rw-r--r--',
                        size: 1200,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'package.json': {
                        name: 'package.json',
                        type: 'file',
                        content: `{
  "name": "modern-web-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}`,
                        permissions: '-rw-r--r--',
                        size: 896,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'development-log.md': {
                        name: 'development-log.md',
                        type: 'file',
                        content: `# Development Progress Log

## ✅ Completed Features

### Core Terminal
- [x] **Unix Commands**: ls, cd, pwd, cat, touch, mkdir, rm, rmdir
- [x] **I/O Redirection**: >, >>, <, << operators
- [x] **Command History**: Arrow key navigation
- [x] **Autocompletion**: Tab completion for all contexts
- [x] **Vim Editor**: Modal editing with INSERT/NORMAL modes
- [x] **Markdown Rendering**: Catppuccin syntax highlighting
- [x] **Filesystem Persistence**: localStorage with debouncing
- [x] **Route-based Modes**: Default and portfolio filesystems

### Advanced Features
- [x] **Option Parsing**: Unix-style flags (-la, -rf)
- [x] **Security**: Input validation and resource limits
- [x] **Error Handling**: Comprehensive error messages
- [x] **Testing**: 310+ unit and integration tests
- [x] **Performance**: Optimized rendering and memory usage

## 🚧 In Progress

### Enhancements
- [ ] **Pipe Operations**: Command chaining with |
- [ ] **Job Control**: Background processes with &
- [ ] **Environment Variables**: $PATH, $HOME, etc.
- [ ] **Globbing**: Wildcard expansion (*.txt)
- [ ] **Process Management**: ps, kill, jobs commands

### UI/UX Improvements
- [ ] **Themes**: Additional color schemes
- [ ] **Mobile UX**: Touch-friendly interactions
- [ ] **Accessibility**: Screen reader support
- [ ] **Keyboard Shortcuts**: Ctrl+C, Ctrl+L, etc.

## 🔮 Future Ideas

### Advanced Terminal Features
- [ ] **Network Tools**: ping, curl, wget
- [ ] **System Info**: uname, whoami, date
- [ ] **File Compression**: tar, gzip simulation
- [ ] **Process Monitoring**: top, htop simulation
- [ ] **Git Integration**: Basic git command simulation

### Developer Tools
- [ ] **Code Highlighting**: Syntax highlighting for more languages
- [ ] **File Tree**: Visual file browser
- [ ] **Split Panes**: Multiple terminal sessions
- [ ] **Search**: find command with regex support
- [ ] **Diff Tool**: File comparison utility

---

**Last Updated**: $(date)  
**Total Lines of Code**: ~5,000+  
**Test Coverage**: 95%+  
**Performance**: <100ms command execution`,
                        permissions: '-rw-r--r--',
                        size: 1600,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                    },
                  },
                },
              },
              downloads: {
                name: 'downloads',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'sample.pdf': {
                    name: 'sample.pdf',
                    type: 'file',
                    content: 'PDF_PLACEHOLDER: This is a sample PDF file. In a real system, this would contain binary data.',
                    permissions: '-rw-r--r--',
                    size: 1024,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                  'archive.zip': {
                    name: 'archive.zip',
                    type: 'file',
                    content: 'ZIP_PLACEHOLDER: This is a sample ZIP archive. In a real system, this would contain compressed binary data.',
                    permissions: '-rw-r--r--',
                    size: 2048,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
              '.bashrc': {
                name: '.bashrc',
                type: 'file',
                content: `# ~/.bashrc: executed by bash(1) for non-login shells

# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

# History settings
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000

# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# Enable color support
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
fi

# Terminal prompt
PS1='\${debian_chroot:+(\$debian_chroot)}\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '`,
                permissions: '-rw-r--r--',
                size: 756,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              '.secret': {
                name: '.secret',
                type: 'file',
                content: `This is a hidden file!

Easter Egg: You found the secret file! 🐱

Secret message: The terminal emulator supports hidden files (starting with dot).
Use "ls -a" to see all files including hidden ones.`,
                permissions: '-rw-------',
                size: 142,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
          },
          guest: {
            name: 'guest',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'welcome.txt': {
                name: 'welcome.txt',
                type: 'file',
                content: `Welcome guest user!

This is a limited access account for demonstration purposes.
You can explore the filesystem and run basic commands.

For full access, switch to the main user account.`,
                permissions: '-r--r--r--',
                size: 178,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
          },
        },
      },
      etc: {
        name: 'etc',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          passwd: {
            name: 'passwd',
            type: 'file',
            content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
user:x:1000:1000:User,,,:/home/user:/bin/bash
guest:x:1001:1001:Guest User,,,:/home/guest:/bin/bash`,
            permissions: '-rw-r--r--',
            size: 284,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          hosts: {
            name: 'hosts',
            type: 'file',
            content: `# /etc/hosts: static hostname resolution
# Format: <ip-address> <hostname> [aliases...]

# Localhost entries
127.0.0.1	localhost
127.0.1.1	terminal-emulator terminal-demo

# IPv6 entries
::1		ip6-localhost ip6-loopback
fe00::0		ip6-localnet
ff00::0		ip6-mcastprefix
ff02::1		ip6-allnodes
ff02::2		ip6-allrouters

# Modern web development
127.0.0.1	dev.local
127.0.0.1	api.dev.local
127.0.0.1	app.dev.local

# Terminal emulator specific
0.0.0.0		virtual-terminal
0.0.0.0		in-memory-fs

# Block common ad/tracking domains (privacy)
0.0.0.0		google-analytics.com
0.0.0.0		googletagmanager.com

# Development tools
127.0.0.1	localhost:3000
127.0.0.1	localhost:5173
127.0.0.1	localhost:8080`,
            permissions: '-rw-r--r--',
            size: 768,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          fstab: {
            name: 'fstab',
            type: 'file',
            content: `# /etc/fstab: static file system information
#
# <file system> <mount point> <type> <options> <dump> <pass>

# Root filesystem (in-memory)
memory:// / memfs defaults,rw 0 0

# Virtual filesystems
proc /proc proc defaults 0 0
sysfs /sys sysfs defaults 0 0
devpts /dev/pts devpts defaults 0 0
tmpfs /tmp tmpfs defaults,size=100M 0 0
tmpfs /var/tmp tmpfs defaults,size=50M 0 0

# Browser storage (persistent)
localStorage /home localStorage defaults,rw 0 0
sessionStorage /tmp/session sessionStorage defaults,rw 0 0

# Special terminal emulator mounts
virtual-terminal:// /dev/terminal terminal defaults 0 0
web-clipboard:// /dev/clipboard clipboard defaults 0 0

# Modern filesystem features
# - In-memory for speed
# - localStorage for persistence
# - Security limits for safety
# - Cross-platform compatibility`,
            permissions: '-rw-r--r--',
            size: 768,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          version: {
            name: 'version',
            type: 'file',
            content: `Terminal Emulator OS v2.0.0
Built with React Router v7, TypeScript 5.0+, and TailwindCSS v4
Modern web-based Unix-like environment

Core Features:
- In-memory hierarchical filesystem with persistence
- Complete Unix command suite (ls, cd, mkdir, rm, etc.)
- Vi-style modal text editor
- Advanced I/O redirection (>, >>, <, <<)
- Smart autocompletion with Tab
- Command history with arrow key navigation
- Markdown rendering with Catppuccin syntax highlighting
- Route-based filesystem modes (default/portfolio)
- Security features with input validation
- Comprehensive test coverage (310+ tests)

Technical Stack:
- Frontend: React Router v7 (CSR), TypeScript, TailwindCSS
- Theme: Catppuccin Mocha colorscheme
- Storage: localStorage with debounced persistence
- Testing: Vitest with unit and integration tests
- Build: Vite with strict TypeScript

Performance:
- <100ms command execution
- Efficient memory usage
- Responsive design for all devices
- Optimized for 1000+ files`,
            permissions: '-r--r--r--',
            size: 1024,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        },
      },
      var: {
        name: 'var',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          log: {
            name: 'log',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'system.log': {
                name: 'system.log',
                type: 'file',
                content: `[2024-01-01 10:00:00] System startup
[2024-01-01 10:00:01] Terminal emulator initialized
[2024-01-01 10:00:02] Filesystem mounted successfully
[2024-01-01 10:00:03] All services started
[2024-01-01 10:00:04] System ready for user interaction`,
                permissions: '-rw-r--r--',
                size: 246,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'access.log': {
                name: 'access.log',
                type: 'file',
                content: `127.0.0.1 - - [01/Jan/2024:10:00:00 +0000] "GET / HTTP/1.1" 200 1024
127.0.0.1 - - [01/Jan/2024:10:00:01 +0000] "GET /terminal HTTP/1.1" 200 2048
127.0.0.1 - - [01/Jan/2024:10:00:02 +0000] "GET /assets/app.js HTTP/1.1" 200 51200`,
                permissions: '-rw-r--r--',
                size: 253,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
          },
          www: {
            name: 'www',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'index.html': {
                name: 'index.html',
                type: 'file',
                content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminal Emulator</title>
</head>
<body>
    <h1>Welcome to the Terminal Emulator</h1>
    <p>A web-based Unix-like terminal environment.</p>
    <p>Navigate to <a href="/terminal">/terminal</a> to access the terminal.</p>
</body>
</html>`,
                permissions: '-rw-r--r--',
                size: 415,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
          },
        },
      },
      tmp: {
        name: 'tmp',
        type: 'directory',
        permissions: 'drwxrwxrwx',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          'temp.txt': {
            name: 'temp.txt',
            type: 'file',
            content: `This is a temporary file.
It might be cleaned up automatically by the system.
Feel free to create more temporary files here.`,
            permissions: '-rw-rw-rw-',
            size: 134,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        },
      },
      usr: {
        name: 'usr',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          bin: {
            name: 'bin',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              ls: {
                name: 'ls',
                type: 'file',
                content: 'BINARY_PLACEHOLDER: This represents the ls command binary.',
                permissions: '-rwxr-xr-x',
                size: 1024,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              cat: {
                name: 'cat',
                type: 'file',
                content: 'BINARY_PLACEHOLDER: This represents the cat command binary.',
                permissions: '-rwxr-xr-x',
                size: 1024,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              nano: {
                name: 'nano',
                type: 'file',
                content: 'BINARY_PLACEHOLDER: This represents the nano text editor binary.',
                permissions: '-rwxr-xr-x',
                size: 2048,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
          },
          local: {
            name: 'local',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              bin: {
                name: 'bin',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {},
              },
              lib: {
                name: 'lib',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {},
              },
            },
          },
          share: {
            name: 'share',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              man: {
                name: 'man',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  man1: {
                    name: 'man1',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'ls.1': {
                        name: 'ls.1',
                        type: 'file',
                        content: `LS(1)                           User Commands                          LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List information about the FILEs (the current directory by default).

OPTIONS
       -a, --all
              do not ignore entries starting with .

       -l     use a long listing format

EXAMPLES
       ls -la
              List all files in long format, including hidden files.`,
                        permissions: '-rw-r--r--',
                        size: 476,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      root: {
        name: 'root',
        type: 'directory',
        permissions: 'drwx------',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          '.profile': {
            name: '.profile',
            type: 'file',
            content: `# ~/.profile: executed by the command interpreter for login shells

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/.local/bin" ] ; then
    PATH="$HOME/.local/bin:$PATH"
fi`,
            permissions: '-rw-------',
            size: 387,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'admin_notes.txt': {
            name: 'admin_notes.txt',
            type: 'file',
            content: `System Administration Notes

- Terminal emulator is running in web browser
- All data is stored in memory (not persistent)
- No actual system access or file operations
- Safe sandbox environment for demonstrations

Maintenance tasks:
- Regular filesystem cleanup
- Monitor memory usage
- Update command implementations`,
            permissions: '-rw-------',
            size: 327,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        },
      },
    },
  };
}

/**
 * Creates a portfolio filesystem structure with Unix-like layout.
 * Portfolio content is placed in /home/user/ for consistency with default mode.
 */
export function createPortfolioFilesystem(): FileSystemNode {
  return {
    name: '/',
    type: 'directory',
    permissions: 'drwxr-xr-x',
    size: 4096,
    createdAt: new Date(),
    modifiedAt: new Date(),
    children: {
      home: {
        name: 'home',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          user: {
            name: 'user',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              about: {
                name: 'about',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'README.md': {
                    name: 'README.md',
                    type: 'file',
                    content: `# Thibault Jaillard

**Senior Mobile Developer** • Montréal, QC

## About

Mobile and web developer with 8+ years experience. Built **10+ apps** including **Fruitz** (acquired by Bumble, 5.6M+ downloads) and banking apps serving **4M+ users**.

## Current Role

**Senior Mobile Developer** at GO ROCK IT  
*Banking consultant for Banque Nationale du Canada*

- Maintain banking app with **4M+ monthly users**
- Reduced bugs by **25%** and improved performance by **15%**
- Cut accessibility incidents by **30%**
- Developed **1000+ features** across multiple projects

## Education

**EPITECH** - European Institute of Technology (2014-2019)  
Master in Computer Science

## Philosophy

> "Write clean code that solves real problems."

- **Quality first**: Clean, maintainable, tested code
- **User-focused**: Build what people actually need
- **Team player**: Share knowledge, give feedback
- **Keep learning**: Stay current with tech`,
                    permissions: '-rw-r--r--',
                    size: 847,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                  'skills.md': {
                    name: 'skills.md',
                    type: 'file',
                    content: `# Technical Skills

## Languages

- **TypeScript**
- **JavaScript**
- **PHP**
- **C**
- **C++**
- **Go**

## Frontend

### Frameworks
- **React** • Expert • 8 years
- **Redux** • Expert • 6 years
- **React Router** • Expert • 5 years
- **Next.js** • Advanced • 2 years
- **TailwindCSS** • Advanced • 3 years
- **Vue.js** • Advanced • 2 years

## Mobile

- **React Native** • Expert • 7 years
- **Expo** • Expert • 5 years

## Backend

- **Node.js** • Expert • 5 years
- **NestJS** • Advanced • 3 years
- **SQL** • Advanced • 7 years

## Blockchain

- **Cosmos SDK** • Advanced • 3 years
- **JavaScript SDK** • Advanced • 3 years
- **API Integration** • Advanced • 3 years

## Tools

- **Git/GitHub** • Expert
- **Docker** • Advanced
- **CI/CD** • Advanced
- **Figma** • Advanced

## Languages

- **French** • Native
- **English** • Professional

## Key Achievements

- 📱 **1000+ features** developed across projects
- 🍑 **Fruitz app**: 5.6M+ downloads, acquired by Bumble
- 🏦 **BNC Banking**: 4M+ monthly users
- ⛓️ **Blockchain**: Cosmos ecosystem projects`,
                    permissions: '-rw-r--r--',
                    size: 1284,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
              projects: {
                name: 'projects',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'fruitz.md': {
                    name: 'fruitz.md',
                    type: 'file',
                    content: `# Fruitz Dating App

**Status**: Acquired by Bumble  
**Downloads**: 5.6M+  
**Platform**: iOS & Android  
**Tech**: React Native, TypeScript

## About

Dating app with unique fruit-based matching system. Successfully acquired by Bumble after reaching 5.6M+ downloads.

## Key Features

- **Unique Matching**: Fruit-based personality matching system
- **Real-time Chat**: Instant messaging with media support  
- **Social Integration**: Connect with social media platforms
- **Geolocation**: Location-based matching
- **Push Notifications**: Real-time engagement alerts

## Technical Implementation

- **Frontend**: React Native with TypeScript
- **State Management**: Redux for complex user flows
- **Backend Integration**: RESTful APIs
- **Real-time Features**: Socket.io for chat
- **Analytics**: User behavior tracking
- **Performance**: Optimized for 100k+ concurrent users

## Results

- 📈 **5.6M+ downloads** before acquisition
- 🚀 **Acquired by Bumble** - major dating platform
- ⭐ **4.2+ rating** on app stores
- 💬 **Real-time messaging** system handling thousands of messages daily
- 🎯 **High engagement** rates with unique matching algorithm`,
                    permissions: '-rw-r--r--',
                    size: 1062,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                  'banking.md': {
                    name: 'banking.md',
                    type: 'file',
                    content: `# BNC Banking App

**Users**: 4M+ monthly active  
**Platform**: iOS & Android  
**Role**: Senior Mobile Developer  
**Tech**: React Native, TypeScript

## About

Mobile banking application for Banque Nationale du Canada serving over 4 million monthly active users. Enterprise-level security and performance requirements.

## Key Achievements

- 🏦 **4M+ monthly users** - One of Canada's largest banking apps
- 📈 **25% bug reduction** through code optimization  
- ⚡ **15% performance improvement** via stability enhancements
- ♿ **30% fewer accessibility incidents** through improved standards
- 🔧 **1000+ features** developed and maintained

## Technical Focus

### Performance & Reliability
- **Load time optimization**: Critical screens < 2 seconds
- **Error handling**: Comprehensive error tracking and recovery
- **Memory management**: Efficient resource usage for sustained sessions

### Security & Compliance
- **Banking regulations**: Full compliance with Canadian financial standards
- **Data encryption**: Multi-layer security for financial data
- **Authentication**: Biometric and multi-factor authentication
- **Fraud detection**: Real-time transaction monitoring

### User Experience
- **Accessibility**: WCAG compliance for inclusive banking
- **Cross-platform**: Consistent experience iOS/Android
- **Responsive design**: Optimized for all device sizes

## Tech Stack

- **Frontend**: React Native, TypeScript, Redux
- **Security**: Advanced encryption, secure authentication
- **Performance**: Optimized for millions of concurrent users
- **Testing**: 95%+ test coverage for critical operations`,
                    permissions: '-rw-r--r--',
                    size: 1443,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                  'blockchain.md': {
                    name: 'blockchain.md',
                    type: 'file',
                    content: `# Blockchain Projects

**Focus**: Cosmos Ecosystem  
**Role**: Frontend Developer  
**Tech**: JavaScript SDK, React, TypeScript

## Lum Network Explorer

**Type**: Blockchain Explorer  
**Users**: 10,000+ monthly

### Features
- Real-time transaction monitoring
- Block and validator information
- Network statistics and analytics
- Search functionality for transactions/addresses

### Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS
- **Blockchain**: Cosmos SDK, JavaScript SDK
- **APIs**: RESTful integration with blockchain nodes
- **Real-time**: WebSocket connections for live data

## Chain-Bridge

**Type**: Cross-chain Bridge Interface  
**Purpose**: Asset transfers between blockchains

### Implementation
- **Multi-chain support**: Cosmos, Ethereum integration
- **Security**: Multi-signature validation
- **User Experience**: Simplified cross-chain transfers
- **Real-time tracking**: Transaction status monitoring

## Cosmos Millions

**Type**: DeFi Gaming Platform  
**Users**: 5,000+ participants

### Key Features
- **Smart contract integration**: Prize pool management
- **Wallet connectivity**: Multiple wallet support
- **Real-time updates**: Live prize tracking
- **Security**: Audit-ready smart contract interactions

## Technical Expertise

- **Cosmos SDK**: Expert level blockchain development
- **JavaScript SDK**: Custom blockchain interactions
- **API Integration**: RESTful and GraphQL endpoints
- **Real-time Data**: WebSocket and polling strategies
- **Security**: Blockchain security best practices`,
                    permissions: '-rw-r--r--',
                    size: 1494,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                  'terminal.md': {
                    name: 'terminal.md',
                    type: 'file',
                    content: `# Terminal Emulator

**Type**: Web-based Terminal  
**Tech**: React Router v7, TypeScript, TailwindCSS  
**Features**: Unix commands, filesystem, persistence

## About

Full-featured web terminal emulator with in-memory filesystem, Unix-like commands, and portfolio integration. Built as both a technical showcase and functional developer tool.

## Key Features

### Core Terminal
- **Unix Commands**: ls, cd, cat, mkdir, rm, touch, pwd
- **Command History**: Arrow key navigation
- **Autocompletion**: Tab completion for commands and paths
- **I/O Redirection**: \`>\`, \`>>\`, \`<\` operators
- **Option Parsing**: Unix-style flags (\`-la\`, \`-rf\`)

### Filesystem
- **In-memory**: Hierarchical file structure
- **Persistence**: localStorage with intelligent sync
- **Path Resolution**: Absolute and relative paths
- **File Operations**: Create, read, update, delete

### Advanced Features
- **Markdown Rendering**: Syntax-highlighted .md files
- **Text Editor**: Built-in vi-style editor
- **Route-based Modes**: Different filesystems per route
- **Responsive Design**: Works on mobile and desktop

## Technical Implementation

### Architecture
- **React Router v7**: CSR mode for better state management
- **TypeScript**: Strict typing throughout
- **TailwindCSS**: Catppuccin Mocha theme
- **Component Structure**: Modular, reusable components

### Performance
- **Debounced Persistence**: Intelligent saving (500ms)
- **Memory Optimization**: Efficient tree structure
- **Responsive Rendering**: Fast command execution

## Code Quality

- ✅ **287 tests** passing (unit + integration)
- 📝 **TypeScript strict mode** enabled
- 🎨 **Consistent styling** with Catppuccin theme
- 📖 **Comprehensive documentation** in README.md`,
                    permissions: '-rw-r--r--',
                    size: 1611,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
              contact: {
                name: 'contact',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'README.md': {
                    name: 'README.md',
                    type: 'file',
                    content: `# Contact Information

## Thibault Jaillard

**Email**: thibault.jaillard@gmail.com  
**Location**: Montréal, QC, Canada  
**Status**: Open to opportunities

## Professional Links

### GitHub
**URL**: [github.com/ThibaultJRD](https://github.com/ThibaultJRD)  

### LinkedIn
**URL**: [linkedin.com/in/thibault-jaillard](https://linkedin.com/in/thibault-jaillard)  
**Professional network and experience details**

### Website
**URL**: [thibault.iusevimbtw.com](https://thibault.iusevimbtw.com)

## Quick Stats

- 📱 **8+ years** mobile/web development
- 🏆 **10+ apps** built and deployed
- 👥 **4M+ users** served (BNC Banking)
- 🚀 **1 acquisition** (Fruitz → Bumble)
- 💼 **Currently**: Senior Mobile Developer at GO ROCK IT

## Availability

Open to discussing:
- Senior mobile development roles
- React Native projects
- Technical consulting
- Remote and Montreal-based positions`,
                    permissions: '-rw-r--r--',
                    size: 1024,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
              '.easter-egg.md': {
                name: '.easter-egg.md',
                type: 'file',
                content: `# 🐰 Easter Egg - Code Comedy

*You found the hidden file! Congratulations!*

## 🎭 Code Comedy Club

### The developer and their 99 problems

\`\`\`typescript
interface Developer {
  problems: number;
  solutions: number;
  coffee: number;
}

const me: Developer = {
  problems: 99,
  solutions: 1,
  coffee: Infinity
};

// I got 99 problems but React.FC ain't one
const MyComponent = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};
\`\`\`

### The function that always works

\`\`\`javascript
function worksPerfectly() {
  // TODO: Implement this function
  return "It works on my machine 🤷‍♂️";
}

// Production usage
console.log(worksPerfectly()); // "It works on my machine 🤷‍♂️"
\`\`\`

### The art of naming

\`\`\`typescript
// Before refactoring
const a = getData();
const b = processData(a);
const c = formatData(b);

// After "professional" refactoring
const dataFromServer = getData();
const processedDataFromServer = processData(dataFromServer);
const formattedProcessedDataFromServer = formatData(processedDataFromServer);

// 6 months later
const wtfIsThis = formattedProcessedDataFromServer;
\`\`\`

### Promises we don't keep

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  // "I'll fix it tomorrow"
  setTimeout(() => {
    resolve("Still not fixed");
  }, 365 * 24 * 60 * 60 * 1000); // 1 year
});

promise.then(result => {
  console.log(result); // In a year...
});
\`\`\`

### CSS that does whatever it wants

\`\`\`css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0 auto;
  text-align: center;
}

/* Spoiler: it works... sometimes */
\`\`\`

### The shameful git commit

\`\`\`bash
git add .
git commit -m "Fix stuff"
git push --force origin main

# 5 minutes later...
git commit -m "Fix fix stuff"
git push --force origin main

# The cycle continues...
\`\`\`

### The useEffect that loops

\`\`\`typescript
const [count, setCount] = useState(0);

useEffect(() => {
  // "I forgot the dependencies"
  setCount(count + 1);
}); // Dependencies? Never heard of them!

// RIP browser memory 🪦
\`\`\`

## 🎯 Bonus: Developer truths

1. **99.9% of the time**: "It works on my machine"
2. **0.1% of the time**: "Oh... I found the bug"
3. **Stack Overflow**: My real mentor
4. **Documentation**: "We'll see later"
5. **Tests**: "Users will test it"

---

*Created with ❤️ and lots of ☕ by a developer who owns their 99 problems.*

**PS**: If you found this file, you know how to use \`ls -a\`. You're already better than 50% of developers! 😄`,
                permissions: '-rw-r--r--',
                size: 2720,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
          },
        },
      },
      etc: {
        name: 'etc',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          version: {
            name: 'version',
            type: 'file',
            content: `Terminal Portfolio v2.0.0
Built with React Router v7, TypeScript 5.0+, and TailwindCSS v4
Portfolio mode - Professional showcase environment

Features:
- Complete Unix-like filesystem structure
- Professional portfolio content in /home/user/
- All standard Unix directories (/usr, /etc, /var, /tmp, /root)
- Command history and autocompletion
- Vi-style text editor with modal editing
- Advanced I/O redirection (>, >>, <, <<)
- Markdown rendering with Catppuccin syntax highlighting
- Persistent storage with localStorage
- Security features and input validation

Portfolio Content:
- /home/user/about/ - Professional background and skills
- /home/user/projects/ - Major projects and achievements
- /home/user/contact/ - Contact information and links
- Hidden easter eggs throughout the filesystem

Technical Stack:
- React Router v7 (CSR mode)
- TypeScript with strict typing
- TailwindCSS v4 with Catppuccin theme
- Comprehensive test coverage (310+ tests)
- Optimized for professional showcase`,
            permissions: '-r--r--r--',
            size: 1024,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          passwd: {
            name: 'passwd',
            type: 'file',
            content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
user:x:1000:1000:Thibault Jaillard,Senior Mobile Developer,Montreal,QC:/home/user:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin`,
            permissions: '-rw-r--r--',
            size: 384,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          hosts: {
            name: 'hosts',
            type: 'file',
            content: `# /etc/hosts: static hostname resolution
# Professional portfolio terminal environment

# Localhost entries
127.0.0.1	localhost
127.0.1.1	portfolio-terminal thibault-dev

# IPv6 entries
::1		ip6-localhost ip6-loopback
fe00::0		ip6-localnet
ff00::0		ip6-mcastprefix
ff02::1		ip6-allnodes
ff02::2		ip6-allrouters

# Professional development domains
127.0.0.1	thibault.dev
127.0.0.1	portfolio.local
127.0.0.1	projects.local

# Portfolio projects
127.0.0.1	fruitz.local
127.0.0.1	banking.local
127.0.0.1	blockchain.local
127.0.0.1	terminal.local

# Development tools
127.0.0.1	api.dev
127.0.0.1	app.dev
127.0.0.1	localhost:3000
127.0.0.1	localhost:5173`,
            permissions: '-rw-r--r--',
            size: 768,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          fstab: {
            name: 'fstab',
            type: 'file',
            content: `# /etc/fstab: static file system information
# Portfolio terminal environment
#
# <file system> <mount point> <type> <options> <dump> <pass>

# Root filesystem (in-memory)
memory:// / memfs defaults,rw 0 0

# Virtual filesystems
proc /proc proc defaults 0 0
sysfs /sys sysfs defaults 0 0
devpts /dev/pts devpts defaults 0 0
tmpfs /tmp tmpfs defaults,size=100M 0 0
tmpfs /var/tmp tmpfs defaults,size=50M 0 0

# Browser storage (persistent)
localStorage /home localStorage defaults,rw 0 0
sessionStorage /tmp/session sessionStorage defaults,rw 0 0

# Portfolio-specific mounts
portfolio-content:// /home/user/about portfolio defaults,ro 0 0
portfolio-content:// /home/user/projects portfolio defaults,ro 0 0
portfolio-content:// /home/user/contact portfolio defaults,ro 0 0

# Terminal emulator mounts
virtual-terminal:// /dev/terminal terminal defaults 0 0
web-clipboard:// /dev/clipboard clipboard defaults 0 0`,
            permissions: '-rw-r--r--',
            size: 1024,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        },
      },
      var: {
        name: 'var',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          log: {
            name: 'log',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'portfolio.log': {
                name: 'portfolio.log',
                type: 'file',
                content: `[2024-01-01 10:00:00] Portfolio mode initialized
[2024-01-01 10:00:01] Professional content loaded
[2024-01-01 10:00:02] About, projects, and contact directories ready
[2024-01-01 10:00:03] Portfolio filesystem ready for exploration`,
                permissions: '-rw-r--r--',
                size: 246,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
          },
        },
      },
      tmp: {
        name: 'tmp',
        type: 'directory',
        permissions: 'drwxrwxrwx',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {},
      },
      usr: {
        name: 'usr',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          bin: {
            name: 'bin',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              ls: {
                name: 'ls',
                type: 'file',
                content: 'BINARY_PLACEHOLDER: ls command - List directory contents',
                permissions: '-rwxr-xr-x',
                size: 1024,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              cat: {
                name: 'cat',
                type: 'file',
                content: 'BINARY_PLACEHOLDER: cat command - Display file contents',
                permissions: '-rwxr-xr-x',
                size: 1024,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              vi: {
                name: 'vi',
                type: 'file',
                content: 'BINARY_PLACEHOLDER: vi editor - Modal text editor',
                permissions: '-rwxr-xr-x',
                size: 2048,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              mkdir: {
                name: 'mkdir',
                type: 'file',
                content: 'BINARY_PLACEHOLDER: mkdir command - Create directories',
                permissions: '-rwxr-xr-x',
                size: 1024,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              rm: {
                name: 'rm',
                type: 'file',
                content: 'BINARY_PLACEHOLDER: rm command - Remove files and directories',
                permissions: '-rwxr-xr-x',
                size: 1024,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
          },
          local: {
            name: 'local',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              bin: {
                name: 'bin',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {},
              },
              lib: {
                name: 'lib',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {},
              },
            },
          },
          share: {
            name: 'share',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              man: {
                name: 'man',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  man1: {
                    name: 'man1',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'ls.1': {
                        name: 'ls.1',
                        type: 'file',
                        content: `LS(1)                    Portfolio Terminal Manual                    LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List information about the FILEs (the current directory by default).
       Sort entries alphabetically unless otherwise specified.

OPTIONS
       -a, --all
              do not ignore entries starting with .

       -l     use a long listing format

       -la    combination of -l and -a

EXAMPLES
       ls
              List files in current directory

       ls -la
              List all files in long format, including hidden files

       ls /home/user/projects
              List files in specific directory

AUTHOR
       Part of the Portfolio Terminal Emulator
       Built with React Router v7 and TypeScript`,
                        permissions: '-rw-r--r--',
                        size: 768,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'vi.1': {
                        name: 'vi.1',
                        type: 'file',
                        content: `VI(1)                    Portfolio Terminal Manual                    VI(1)

NAME
       vi - modal text editor

SYNOPSIS
       vi [FILE]

DESCRIPTION
       A modal text editor inspired by vim. Supports NORMAL and INSERT modes.

MODES
       NORMAL mode
              Navigate and execute commands
              Press 'i' to enter INSERT mode
              Press ':q' to quit
              Press ':w' to save
              Press ':wq' to save and quit

       INSERT mode
              Edit text content
              Press ESC to return to NORMAL mode

KEY BINDINGS
       h, j, k, l    Move cursor (NORMAL mode)
       i            Enter INSERT mode
       ESC          Return to NORMAL mode
       :w           Save file
       :q           Quit editor
       :wq          Save and quit

EXAMPLES
       vi README.md
              Edit README.md file

       vi new-file.txt
              Create and edit new file

AUTHOR
       Part of the Portfolio Terminal Emulator
       Modal editing implementation in TypeScript`,
                        permissions: '-rw-r--r--',
                        size: 1024,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      root: {
        name: 'root',
        type: 'directory',
        permissions: 'drwx------',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          '.profile': {
            name: '.profile',
            type: 'file',
            content: `# ~/.profile: executed by the command interpreter for login shells
# Portfolio Terminal Environment

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/bin" ] ; then
    PATH="$HOME/bin:$PATH"
fi

# set PATH so it includes user's private bin if it exists
if [ -d "$HOME/.local/bin" ] ; then
    PATH="$HOME/.local/bin:$PATH"
fi

# Portfolio terminal specific settings
export PORTFOLIO_MODE=true
export TERMINAL_THEME="catppuccin-mocha"
export EDITOR="vi"
export PAGER="cat"

# Professional environment variables
export DEVELOPER_NAME="Thibault Jaillard"
export ROLE="Senior Mobile Developer"
export LOCATION="Montreal, QC"
export EXPERIENCE="8+ years"

# Development tools
export NODE_ENV="portfolio"
export REACT_APP_MODE="showcase"`,
            permissions: '-rw-------',
            size: 768,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'portfolio_notes.md': {
            name: 'portfolio_notes.md',
            type: 'file',
            content: `# Portfolio Terminal - Admin Notes

## System Overview

This is the administrative area for the Portfolio Terminal Emulator.
Only accessible in portfolio mode.

## Key Features Implemented

### Core Terminal
- ✅ **Unix Commands**: Complete command suite
- ✅ **Vi Editor**: Modal editing with INSERT/NORMAL modes
- ✅ **I/O Redirection**: Full redirection support
- ✅ **Autocompletion**: Context-aware tab completion
- ✅ **History**: Command history with arrow keys
- ✅ **Persistence**: localStorage with 500ms debouncing

### Portfolio Content
- ✅ **About Section**: Professional background and skills
- ✅ **Projects**: Fruitz, BNC Banking, Blockchain projects
- ✅ **Contact**: Professional contact information
- ✅ **Easter Eggs**: Hidden content for exploration

### Technical Implementation
- ✅ **React Router v7**: CSR mode for better state management
- ✅ **TypeScript**: Strict typing throughout
- ✅ **TailwindCSS**: Catppuccin Mocha theme
- ✅ **Testing**: 310+ tests with high coverage
- ✅ **Security**: Input validation and resource limits

## Performance Metrics

- **Command Execution**: <100ms average
- **File Operations**: <50ms average
- **Memory Usage**: Efficient tree structure
- **Storage**: Optimized localStorage usage
- **Bundle Size**: Optimized for web delivery

## Maintenance Tasks

- [ ] Regular content updates
- [ ] Performance monitoring
- [ ] Security audits
- [ ] Feature enhancements
- [ ] Documentation updates

---

*This portfolio showcases modern web development skills while providing a functional Unix-like environment. Built with ❤️ and lots of ☕.*`,
            permissions: '-rw-------',
            size: 1600,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        },
      },
    },
  };
}

/**
 * Returns the appropriate filesystem based on the specified mode.
 * This function serves as the main entry point for filesystem initialization.
 *
 * @param mode - The filesystem mode ('default' or 'portfolio')
 * @returns The complete filesystem structure for the specified mode
 */
export function getFilesystemByMode(mode: FilesystemMode = 'default'): FileSystemNode {
  switch (mode) {
    case 'portfolio':
      return createPortfolioFilesystem();
    case 'default':
    default:
      return createDefaultFilesystem();
  }
}

/**
 * Returns the default filesystem structure used when no specific mode is requested.
 * This is typically the Unix-like filesystem structure for general use.
 */
export function getDefaultFilesystem(): FileSystemNode {
  return createDefaultFilesystem();
}

/**
 * Available filesystem modes that can be used with the switch-fs command.
 * Add new modes here when implementing additional filesystem structures.
 */
export const FILESYSTEM_MODES = ['default', 'portfolio'] as const;
export type FilesystemMode = (typeof FILESYSTEM_MODES)[number];
