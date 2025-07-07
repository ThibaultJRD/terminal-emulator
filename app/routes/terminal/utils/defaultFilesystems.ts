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
                    content: `Welcome to the terminal emulator!

This is a web-based terminal with:
- In-memory filesystem
- Unix-like commands
- Command history
- Tab completion
- Markdown rendering

Try these commands:
- ls -la
- cat readme.txt
- mkdir test
- cd test
- echo "Hello World" > hello.txt
- cat hello.txt

Explore the filesystem and have fun!`,
                    permissions: '-rw-r--r--',
                    size: 420,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                  'notes.md': {
                    name: 'notes.md',
                    type: 'file',
                    content: `# Terminal Emulator Notes

## Features
- **Commands**: ls, cd, pwd, cat, touch, mkdir, rm, rmdir
- **Redirection**: Use \`>\` and \`>>\` for output redirection
- **Autocompletion**: Press Tab to complete commands and paths
- **History**: Use arrow keys to navigate command history

## Advanced Usage
\`\`\`bash
# Create nested directories
mkdir -p deep/nested/path

# List with options
ls -la

# Redirect output
echo "content" > file.txt
echo "more content" >> file.txt
\`\`\`

## Tips
- Use \`clear\` to clean the terminal
- Use \`help\` to see all available commands
- Files ending in \`.md\` are rendered with syntax highlighting`,
                    permissions: '-rw-r--r--',
                    size: 628,
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
                      'example.js': {
                        name: 'example.js',
                        type: 'file',
                        content: `// Example JavaScript file
console.log("Hello from the terminal emulator!");

function greet(name) {
  return \`Hello, \${name}!\`;
}

// Export the function
export { greet };`,
                        permissions: '-rw-r--r--',
                        size: 176,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'todo.txt': {
                        name: 'todo.txt',
                        type: 'file',
                        content: `Project TODOs:

[ ] Add more Unix commands
[ ] Implement file permissions
[ ] Add syntax highlighting
[x] Create realistic filesystem
[x] Add markdown support
[x] Implement redirection

Notes:
- Consider adding vim-style editor
- Look into persistence options
- Add more test files`,
                        permissions: '-rw-r--r--',
                        size: 278,
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
            content: `127.0.0.1	localhost
127.0.1.1	terminal-emulator

# IPv6 entries
::1	ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters`,
            permissions: '-rw-r--r--',
            size: 187,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          fstab: {
            name: 'fstab',
            type: 'file',
            content: `# /etc/fstab: static file system information
#
# <file system> <mount point> <type> <options> <dump> <pass>
# / was on /dev/sda1 during installation
UUID=12345678-1234-1234-1234-123456789abc / ext4 defaults 0 1
# swap was on /dev/sda5 during installation
UUID=87654321-4321-4321-4321-cba987654321 none swap sw 0 0`,
            permissions: '-rw-r--r--',
            size: 389,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          version: {
            name: 'version',
            type: 'file',
            content: `Terminal Emulator OS v1.0.0
Built with React Router v7 and TypeScript
Web-based Unix-like environment

Features:
- In-memory filesystem
- Command history and autocompletion
- Markdown rendering
- I/O redirection
- Unix-style commands`,
            permissions: '-r--r--r--',
            size: 207,
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
 * Creates a clean, simplified portfolio filesystem structure.
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
