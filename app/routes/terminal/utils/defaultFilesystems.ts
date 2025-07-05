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
                    content:
                      'Welcome to the terminal emulator!\n\nThis is a web-based terminal with:\n- In-memory filesystem\n- Unix-like commands\n- Command history\n- Tab completion\n- Markdown rendering\n\nTry these commands:\n- ls -la\n- cat readme.txt\n- mkdir test\n- cd test\n- echo "Hello World" > hello.txt\n- cat hello.txt\n\nExplore the filesystem and have fun!',
                    permissions: '-rw-r--r--',
                    size: 420,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                  'notes.md': {
                    name: 'notes.md',
                    type: 'file',
                    content:
                      '# Terminal Emulator Notes\n\n## Features\n- **Commands**: ls, cd, pwd, cat, touch, mkdir, rm, rmdir\n- **Redirection**: Use `>` and `>>` for output redirection\n- **Autocompletion**: Press Tab to complete commands and paths\n- **History**: Use arrow keys to navigate command history\n\n## Advanced Usage\n```bash\n# Create nested directories\nmkdir -p deep/nested/path\n\n# List with options\nls -la\n\n# Redirect output\necho "content" > file.txt\necho "more content" >> file.txt\n```\n\n## Tips\n- Use `clear` to clean the terminal\n- Use `help` to see all available commands\n- Files ending in `.md` are rendered with syntax highlighting',
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
                        content:
                          '// Example JavaScript file\nconsole.log("Hello from the terminal emulator!");\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\n// Export the function\nexport { greet };',
                        permissions: '-rw-r--r--',
                        size: 176,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'todo.txt': {
                        name: 'todo.txt',
                        type: 'file',
                        content:
                          'Project TODOs:\n\n[ ] Add more Unix commands\n[ ] Implement file permissions\n[ ] Add syntax highlighting\n[x] Create realistic filesystem\n[x] Add markdown support\n[x] Implement redirection\n\nNotes:\n- Consider adding vim-style editor\n- Look into persistence options\n- Add more test files',
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
                content:
                  "# ~/.bashrc: executed by bash(1) for non-login shells\n\n# If not running interactively, don't do anything\ncase $- in\n    *i*) ;;\n      *) return;;\nesac\n\n# History settings\nHISTCONTROL=ignoreboth\nHISTSIZE=1000\nHISTFILESIZE=2000\n\n# Aliases\nalias ll='ls -alF'\nalias la='ls -A'\nalias l='ls -CF'\n\n# Enable color support\nif [ -x /usr/bin/dircolors ]; then\n    test -r ~/.dircolors && eval \"$(dircolors -b ~/.dircolors)\" || eval \"$(dircolors -b)\"\n    alias ls='ls --color=auto'\n    alias grep='grep --color=auto'\nfi\n\n# Terminal prompt\nPS1='${debian_chroot:+($debian_chroot)}\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '",
                permissions: '-rw-r--r--',
                size: 756,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              '.secret': {
                name: '.secret',
                type: 'file',
                content:
                  'This is a hidden file!\n\nEaster Egg: You found the secret file! 🐱\n\nSecret message: The terminal emulator supports hidden files (starting with dot).\nUse "ls -a" to see all files including hidden ones.',
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
                content:
                  'Welcome guest user!\n\nThis is a limited access account for demonstration purposes.\nYou can explore the filesystem and run basic commands.\n\nFor full access, switch to the main user account.',
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
            content:
              'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nuser:x:1000:1000:User,,,:/home/user:/bin/bash\nguest:x:1001:1001:Guest User,,,:/home/guest:/bin/bash',
            permissions: '-rw-r--r--',
            size: 284,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          hosts: {
            name: 'hosts',
            type: 'file',
            content:
              '127.0.0.1\tlocalhost\n127.0.1.1\tterminal-emulator\n\n# IPv6 entries\n::1\tip6-localhost ip6-loopback\nfe00::0\tip6-localnet\nff00::0\tip6-mcastprefix\nff02::1\tip6-allnodes\nff02::2\tip6-allrouters',
            permissions: '-rw-r--r--',
            size: 187,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          fstab: {
            name: 'fstab',
            type: 'file',
            content:
              '# /etc/fstab: static file system information\n#\n# <file system> <mount point> <type> <options> <dump> <pass>\n# / was on /dev/sda1 during installation\nUUID=12345678-1234-1234-1234-123456789abc / ext4 defaults 0 1\n# swap was on /dev/sda5 during installation\nUUID=87654321-4321-4321-4321-cba987654321 none swap sw 0 0',
            permissions: '-rw-r--r--',
            size: 389,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          version: {
            name: 'version',
            type: 'file',
            content:
              'Terminal Emulator OS v1.0.0\nBuilt with React Router v7 and TypeScript\nWeb-based Unix-like environment\n\nFeatures:\n- In-memory filesystem\n- Command history and autocompletion\n- Markdown rendering\n- I/O redirection\n- Unix-style commands',
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
                content:
                  '[2024-01-01 10:00:00] System startup\n[2024-01-01 10:00:01] Terminal emulator initialized\n[2024-01-01 10:00:02] Filesystem mounted successfully\n[2024-01-01 10:00:03] All services started\n[2024-01-01 10:00:04] System ready for user interaction',
                permissions: '-rw-r--r--',
                size: 246,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'access.log': {
                name: 'access.log',
                type: 'file',
                content:
                  '127.0.0.1 - - [01/Jan/2024:10:00:00 +0000] "GET / HTTP/1.1" 200 1024\n127.0.0.1 - - [01/Jan/2024:10:00:01 +0000] "GET /terminal HTTP/1.1" 200 2048\n127.0.0.1 - - [01/Jan/2024:10:00:02 +0000] "GET /assets/app.js HTTP/1.1" 200 51200',
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
                content:
                  '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Terminal Emulator</title>\n</head>\n<body>\n    <h1>Welcome to the Terminal Emulator</h1>\n    <p>A web-based Unix-like terminal environment.</p>\n    <p>Navigate to <a href="/terminal">/terminal</a> to access the terminal.</p>\n</body>\n</html>',
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
            content: 'This is a temporary file.\nIt might be cleaned up automatically by the system.\nFeel free to create more temporary files here.',
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
                        content:
                          'LS(1)                           User Commands                          LS(1)\n\nNAME\n       ls - list directory contents\n\nSYNOPSIS\n       ls [OPTION]... [FILE]...\n\nDESCRIPTION\n       List information about the FILEs (the current directory by default).\n\nOPTIONS\n       -a, --all\n              do not ignore entries starting with .\n\n       -l     use a long listing format\n\nEXAMPLES\n       ls -la\n              List all files in long format, including hidden files.',
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
            content:
              '# ~/.profile: executed by the command interpreter for login shells\n\n# set PATH so it includes user\'s private bin if it exists\nif [ -d "$HOME/bin" ] ; then\n    PATH="$HOME/bin:$PATH"\nfi\n\n# set PATH so it includes user\'s private bin if it exists\nif [ -d "$HOME/.local/bin" ] ; then\n    PATH="$HOME/.local/bin:$PATH"\nfi',
            permissions: '-rw-------',
            size: 387,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'admin_notes.txt': {
            name: 'admin_notes.txt',
            type: 'file',
            content:
              'System Administration Notes\n\n- Terminal emulator is running in web browser\n- All data is stored in memory (not persistent)\n- No actual system access or file operations\n- Safe sandbox environment for demonstrations\n\nMaintenance tasks:\n- Regular filesystem cleanup\n- Monitor memory usage\n- Update command implementations',
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
 * Creates a portfolio-focused filesystem structure optimized for showcasing
 * terminal emulator capabilities and developer portfolio content.
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
          'bio.md': {
            name: 'bio.md',
            type: 'file',
            content:
              '# About Me\n\n## Developer Profile\n\nI\'m a passionate **full-stack developer** with expertise in:\n\n- **Frontend**: React, TypeScript, TailwindCSS, React Router\n- **Backend**: Node.js, Express, PostgreSQL, MongoDB  \n- **Tools**: Git, Docker, AWS, Vite, Vitest\n- **Specialties**: Terminal applications, CLI tools, developer experience\n\n## Experience\n\n### Senior Frontend Developer (2022-Present)\n- Built responsive web applications with React and TypeScript\n- Implemented modern build tools and development workflows\n- Mentored junior developers and led technical decisions\n\n### Full-Stack Developer (2020-2022)\n- Developed REST APIs and microservices architecture\n- Created database schemas and optimized query performance\n- Deployed applications to cloud platforms\n\n## Philosophy\n\n> "Good code is like a good joke - it needs no explanation, but when you get it, you appreciate the cleverness."\n\nI believe in:\n- **Clean, maintainable code** that tells a story\n- **Developer experience** that makes complex tasks simple\n- **Continuous learning** and staying current with technology\n- **Open source** contributions and community involvement\n\n## Current Focus\n\nCurrently working on:\n- Terminal-based applications and CLI tools\n- Developer productivity tools\n- Modern web application architecture\n- Performance optimization and accessibility',
            permissions: '-rw-r--r--',
            size: 1342,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'skills.json': {
            name: 'skills.json',
            type: 'file',
            content:
              '{\n  "programming_languages": [\n    { "name": "TypeScript", "level": "Expert", "years": 4 },\n    { "name": "JavaScript", "level": "Expert", "years": 6 },\n    { "name": "Python", "level": "Advanced", "years": 3 },\n    { "name": "Go", "level": "Intermediate", "years": 2 },\n    { "name": "Rust", "level": "Beginner", "years": 1 }\n  ],\n  "frontend_frameworks": [\n    { "name": "React", "level": "Expert", "years": 5 },\n    { "name": "React Router", "level": "Expert", "years": 3 },\n    { "name": "Vue.js", "level": "Advanced", "years": 2 },\n    { "name": "Svelte", "level": "Intermediate", "years": 1 }\n  ],\n  "backend_technologies": [\n    { "name": "Node.js", "level": "Expert", "years": 5 },\n    { "name": "Express", "level": "Expert", "years": 4 },\n    { "name": "PostgreSQL", "level": "Advanced", "years": 3 },\n    { "name": "MongoDB", "level": "Advanced", "years": 2 },\n    { "name": "Redis", "level": "Intermediate", "years": 2 }\n  ],\n  "tools_and_platforms": [\n    { "name": "Git", "level": "Expert", "years": 6 },\n    { "name": "Docker", "level": "Advanced", "years": 3 },\n    { "name": "AWS", "level": "Advanced", "years": 2 },\n    { "name": "Vite", "level": "Expert", "years": 2 },\n    { "name": "Vitest", "level": "Advanced", "years": 1 },\n    { "name": "GitHub Actions", "level": "Advanced", "years": 2 }\n  ],\n  "soft_skills": [\n    "Problem Solving",\n    "Technical Leadership",\n    "Code Review",\n    "Mentoring",\n    "Documentation",\n    "Team Collaboration",\n    "Project Management"\n  ],\n  "certifications": [\n    {\n      "name": "AWS Certified Developer - Associate",\n      "issuer": "Amazon Web Services",\n      "date": "2023-06-15"\n    },\n    {\n      "name": "Professional Scrum Master I",\n      "issuer": "Scrum.org",\n      "date": "2022-11-10"\n    }\n  ]\n}',
            permissions: '-rw-r--r--',
            size: 1683,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'cv.pdf': {
            name: 'cv.pdf',
            type: 'file',
            content:
              'PDF_PLACEHOLDER: This would be a PDF version of my curriculum vitae. The actual file would contain formatted resume information including work experience, education, skills, and contact details.',
            permissions: '-rw-r--r--',
            size: 2048,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'philosophy.txt': {
            name: 'philosophy.txt',
            type: 'file',
            content:
              'Development Philosophy\n\n"Code is communication. Write for humans, not just machines."\n\nCore Principles:\n\n1. CLARITY OVER CLEVERNESS\n   - Write code that tells a story\n   - Use descriptive names and clear structure\n   - Avoid unnecessary complexity\n\n2. TESTING IS DOCUMENTATION\n   - Tests explain how code should behave\n   - Write tests that serve as examples\n   - Test behavior, not implementation\n\n3. ITERATIVE IMPROVEMENT\n   - Ship early, iterate based on feedback\n   - Continuous refactoring and improvement\n   - Embrace change as a constant\n\n4. DEVELOPER EXPERIENCE MATTERS\n   - Tools should enhance productivity\n   - Good abstractions hide complexity\n   - Developer happiness leads to better products\n\n5. PERFORMANCE WITH PURPOSE\n   - Optimize for the right metrics\n   - Measure before optimizing\n   - User experience is the ultimate goal\n\n6. OPEN SOURCE MINDSET\n   - Share knowledge and learn from others\n   - Contribute to the community\n   - Build tools that others can use and improve',
            permissions: '-rw-r--r--',
            size: 1087,
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
          'terminal-emulator': {
            name: 'terminal-emulator',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'README.md': {
                name: 'README.md',
                type: 'file',
                content:
                  '# Terminal Emulator\n\nA modern web-based terminal emulator built with cutting-edge technologies.\n\n## 🚀 Features\n\n- **Modern Stack**: React Router v7, TypeScript, TailwindCSS\n- **Unix-like Commands**: ls, cd, pwd, cat, touch, mkdir, rm, and more\n- **Advanced Parsing**: I/O redirection, option parsing, command history\n- **Rich Output**: Markdown rendering with syntax highlighting\n- **Autocompletion**: Intelligent tab completion for commands and paths\n- **Persistent State**: Browser storage for filesystem persistence\n- **Text Editor**: Built-in vim-inspired text editor\n- **Beautiful UI**: Catppuccin Mocha theme with terminal aesthetics\n\n## 💻 Technical Highlights\n\n### Architecture\n- **CSR Mode**: Client-side rendering for optimal terminal state management\n- **Modular Design**: Separate utilities for filesystem, commands, and parsing\n- **TypeScript**: Strict type safety with `verbatimModuleSyntax`\n- **Testing**: Comprehensive test suite with Vitest\n\n### Command System\n```bash\n# Basic commands\nls -la\ncd /home/user\npwd\n\n# File operations\ntouch newfile.txt\necho "Hello World" > file.txt\ncat file.txt\n\n# Advanced features\nls -la | grep txt\ncat document.md  # Renders markdown with syntax highlighting\n```\n\n### Filesystem Features\n- In-memory hierarchical filesystem\n- Unix-like permissions and metadata\n- Support for hidden files (dotfiles)\n- Persistent storage across browser sessions\n- Multiple filesystem modes (default, portfolio, custom)\n\n## 🛠️ Development\n\n```bash\nnpm run dev      # Development server\nnpm run build    # Production build\nnpm run test     # Run test suite\nnpm run typecheck # TypeScript validation\n```\n\n## 📝 Implementation Notes\n\n- Built with React Router v7 for modern routing\n- Uses TailwindCSS v4 for styling\n- Implements proper Unix-style option parsing\n- Supports complex command pipelines and redirection\n- Includes comprehensive error handling\n- Maintains command history with arrow key navigation\n\n## 🎯 Use Cases\n\n- Portfolio demonstration tool\n- Educational platform for Unix commands\n- Development environment showcase\n- Interactive documentation system\n- Terminal application prototyping\n\n---\n\n*Built with ❤️ using modern web technologies*',
                permissions: '-rw-r--r--',
                size: 1842,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'demo.gif': {
                name: 'demo.gif',
                type: 'file',
                content:
                  'GIF_PLACEHOLDER: This would be an animated demonstration of the terminal emulator in action, showing command execution, autocompletion, and markdown rendering features.',
                permissions: '-rw-r--r--',
                size: 1024,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'architecture.md': {
                name: 'architecture.md',
                type: 'file',
                content:
                  '# Terminal Emulator Architecture\n\n## 🏗️ System Overview\n\n```\n┌─────────────────────────────────────────────────────────────┐\n│                      Terminal UI                           │\n│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │\n│  │   Input Handler │  │  Output Renderer│  │ Text Editor │  │\n│  └─────────────────┘  └─────────────────┘  └─────────────┘  │\n└─────────────────────────┬───────────────────────────────────┘\n                          │\n┌─────────────────────────┴───────────────────────────────────┐\n│                    Command Layer                           │\n│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │\n│  │ Command Parser  │  │  Option Parser  │  │Autocompletion│  │\n│  └─────────────────┘  └─────────────────┘  └─────────────┘  │\n└─────────────────────────┬───────────────────────────────────┘\n                          │\n┌─────────────────────────┴───────────────────────────────────┐\n│                    Core Services                           │\n│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │\n│  │   Filesystem    │  │   Persistence   │  │  Markdown   │  │\n│  └─────────────────┘  └─────────────────┘  └─────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n\n## 📁 Component Structure\n\n### Terminal UI Layer\n- **Terminal.tsx**: Main component managing state and user interaction\n- **TextEditor.tsx**: Full-screen text editor with vim-inspired controls\n- **Output Renderer**: Handles rich text rendering with syntax highlighting\n\n### Command Layer\n- **Command Parser**: Processes input and handles I/O redirection\n- **Option Parser**: Unix-style flag parsing (-la, --verbose)\n- **Autocompletion**: Context-aware tab completion system\n\n### Core Services\n- **Filesystem**: In-memory hierarchical file system\n- **Persistence**: Browser storage management\n- **Markdown**: Rendering engine with Catppuccin theme\n\n## 🔄 Data Flow\n\n1. **User Input** → Command Parser → Option Parser\n2. **Command Execution** → Filesystem Operations → Result Generation\n3. **Output Rendering** → Markdown Processing → UI Update\n4. **State Changes** → Persistence Layer → localStorage\n\n## 🎨 Design Patterns\n\n### Command Pattern\n```typescript\ninterface CommandHandler {\n  (args: string[], filesystem: FileSystemState): CommandResult;\n}\n```\n\n### Observer Pattern\n- Terminal history updates\n- Filesystem change notifications\n- Autocompletion suggestions\n\n### Strategy Pattern\n- Multiple filesystem modes\n- Different output formatters\n- Pluggable command implementations\n\n## 📊 Performance Considerations\n\n- **Lazy Loading**: Commands loaded on-demand\n- **Memoization**: Cached autocompletion results\n- **Virtual Scrolling**: Efficient terminal history rendering\n- **Debounced Input**: Reduced re-renders during typing\n\n## 🔧 Extensibility\n\n### Adding New Commands\n1. Implement command handler function\n2. Add to commands registry\n3. Update autocompletion list\n4. Add unit tests\n\n### Custom Filesystem Modes\n1. Define filesystem structure\n2. Add to defaultFilesystems.ts\n3. Update switch-fs command\n4. Test with existing commands\n\n### Text Editor Extensions\n1. Add new editor modes\n2. Implement keyboard shortcuts\n3. Add syntax highlighting rules\n4. Integrate with filesystem\n\n---\n\n*Architecture designed for maintainability and extensibility*',
                permissions: '-rw-r--r--',
                size: 2794,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'source.txt': {
                name: 'source.txt',
                type: 'file',
                content:
                  'GitHub Repository: https://github.com/username/terminal-emulator\n\nKey Files:\n- app/routes/terminal/terminal.tsx (Main terminal component)\n- app/routes/terminal/utils/filesystem.ts (Filesystem utilities)\n- app/routes/terminal/utils/commands.ts (Command implementations)\n- app/routes/terminal/utils/commandParser.ts (Command parsing)\n- app/routes/terminal/utils/autocompletion.ts (Tab completion)\n- app/routes/terminal/components/TextEditor.tsx (Text editor)\n\nDependencies:\n- React Router v7\n- TypeScript\n- TailwindCSS v4\n- Vite\n- Vitest\n\nBuild Process:\n1. TypeScript compilation\n2. React Router code generation\n3. TailwindCSS processing\n4. Vite bundling\n5. Production optimization\n\nDeployment:\n- Static site generation\n- CDN deployment\n- Automated CI/CD pipeline\n- Performance monitoring\n\nContributing:\n- Fork the repository\n- Create feature branch\n- Add tests for new features\n- Ensure TypeScript compliance\n- Submit pull request',
                permissions: '-rw-r--r--',
                size: 1018,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
          },
          'web-apps': {
            name: 'web-apps',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'portfolio-site': {
                name: 'portfolio-site',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'info.txt': {
                    name: 'info.txt',
                    type: 'file',
                    content:
                      'Portfolio Website\n\nTech Stack:\n- React + TypeScript\n- TailwindCSS\n- Framer Motion\n- React Router\n\nFeatures:\n- Responsive design\n- Dark/light theme\n- Smooth animations\n- Contact form\n- Project showcase\n\nHighlights:\n- 95+ Lighthouse score\n- SEO optimized\n- Accessible design\n- Fast loading times',
                    permissions: '-rw-r--r--',
                    size: 334,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
              'task-manager': {
                name: 'task-manager',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'overview.md': {
                    name: 'overview.md',
                    type: 'file',
                    content:
                      '# Task Manager App\n\n## Overview\nA productivity application for managing personal and team tasks.\n\n## Features\n- **Task Creation**: Quick task entry with due dates\n- **Categories**: Organize tasks by project or type\n- **Collaboration**: Share tasks with team members\n- **Progress Tracking**: Visual progress indicators\n- **Notifications**: Email and push notifications\n\n## Technical Implementation\n- **Frontend**: React with TypeScript\n- **Backend**: Node.js with Express\n- **Database**: PostgreSQL\n- **Authentication**: JWT tokens\n- **Real-time**: WebSocket connections\n\n## Key Challenges Solved\n1. **Real-time Updates**: WebSocket implementation for live task updates\n2. **Offline Support**: Service worker for offline functionality\n3. **Performance**: Virtual scrolling for large task lists\n4. **Data Consistency**: Optimistic updates with rollback\n\n## Results\n- 1000+ active users\n- 99.9% uptime\n- 50% increase in team productivity\n- Featured in productivity app reviews',
                    permissions: '-rw-r--r--',
                    size: 1002,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
              'e-commerce': {
                name: 'e-commerce',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'features.txt': {
                    name: 'features.txt',
                    type: 'file',
                    content:
                      'E-commerce Platform\n\nCore Features:\n- Product catalog with search and filtering\n- Shopping cart with persistent state\n- User authentication and profiles\n- Payment processing (Stripe integration)\n- Order management and tracking\n- Admin dashboard for inventory\n\nAdvanced Features:\n- Recommendation engine\n- A/B testing framework\n- Analytics dashboard\n- Multi-language support\n- Mobile-first responsive design\n\nTechnical Highlights:\n- Microservices architecture\n- Redis caching layer\n- Elasticsearch for search\n- Docker containerization\n- Kubernetes deployment\n- CI/CD pipeline\n\nPerformance:\n- <2s page load times\n- 99.95% uptime\n- Handles 10k concurrent users\n- PCI DSS compliant\n\nBusiness Impact:\n- 300% increase in online sales\n- 40% improvement in conversion rate\n- 25% reduction in cart abandonment',
                    permissions: '-rw-r--r--',
                    size: 892,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
            },
          },
          'mobile-apps': {
            name: 'mobile-apps',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'fitness-tracker': {
                name: 'fitness-tracker',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'description.txt': {
                    name: 'description.txt',
                    type: 'file',
                    content:
                      'Fitness Tracker Mobile App\n\nPlatform: React Native\nTargeted Devices: iOS and Android\n\nCore Features:\n- Workout tracking with GPS\n- Calorie counting and nutrition\n- Progress photos and measurements\n- Social features and challenges\n- Wearable device integration\n\nTechnical Stack:\n- React Native with TypeScript\n- Redux for state management\n- SQLite for local storage\n- Firebase for backend services\n- Native modules for device APIs\n\nKey Achievements:\n- 50k+ downloads\n- 4.8/5 app store rating\n- Featured in App Store\n- 85% user retention rate\n\nChallenges Overcome:\n- Battery optimization\n- Offline functionality\n- Cross-platform consistency\n- Performance with large datasets',
                    permissions: '-rw-r--r--',
                    size: 774,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
              'note-taking': {
                name: 'note-taking',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'README.md': {
                    name: 'README.md',
                    type: 'file',
                    content:
                      '# Note Taking App\n\n## Concept\nA markdown-based note-taking application with powerful organization features.\n\n## Features\n- **Markdown Support**: Full markdown editing with live preview\n- **Organization**: Tags, folders, and search functionality\n- **Sync**: Cross-device synchronization\n- **Collaboration**: Share notes with team members\n- **Plugins**: Extensible architecture\n\n## Technical Details\n- **Platform**: Electron + React\n- **Editor**: Custom markdown editor with syntax highlighting\n- **Storage**: Local SQLite with cloud sync\n- **Sync**: Real-time synchronization with conflict resolution\n\n## Development Highlights\n- Built custom markdown parser for better performance\n- Implemented efficient search with full-text indexing\n- Created plugin system for extensibility\n- Optimized for large note collections (10k+ notes)\n\n## User Feedback\n> "Best note-taking app for developers. The markdown support is fantastic!"\n\n> "Finally, a note app that doesn\'t slow down with thousands of notes."\n\n## Statistics\n- 25k+ active users\n- 4.7/5 rating\n- 95% user satisfaction\n- Average session time: 23 minutes',
                    permissions: '-rw-r--r--',
                    size: 1145,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
            },
          },
          'cli-tools': {
            name: 'cli-tools',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'dev-setup': {
                name: 'dev-setup',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'info.md': {
                    name: 'info.md',
                    type: 'file',
                    content:
                      '# Development Environment Setup Tool\n\n## Purpose\nA CLI tool to quickly set up development environments for new projects.\n\n## Features\n- **Project Templates**: Pre-configured templates for React, Node.js, Python, etc.\n- **Dependency Management**: Automatic installation of required tools\n- **Configuration**: Git setup, editor config, linting rules\n- **Docker**: Optional containerized development environment\n\n## Usage\n```bash\n# Create new React project\ndev-setup create react my-app\n\n# Add TypeScript to existing project\ndev-setup add typescript\n\n# Setup development database\ndev-setup db postgres\n```\n\n## Implementation\n- **Language**: Node.js with TypeScript\n- **CLI Framework**: Commander.js\n- **Templates**: Handlebars templating\n- **Package Manager**: npm/yarn/pnpm support\n\n## Benefits\n- Reduces project setup time from hours to minutes\n- Ensures consistent development environments\n- Eliminates configuration errors\n- Supports team standardization\n\n## Adoption\n- Used by 50+ developers\n- Saved 200+ hours of setup time\n- Reduced onboarding time by 60%\n- Open source with community contributions',
                    permissions: '-rw-r--r--',
                    size: 1087,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
              'git-assistant': {
                name: 'git-assistant',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'overview.txt': {
                    name: 'overview.txt',
                    type: 'file',
                    content:
                      'Git Assistant CLI Tool\n\nPurpose: Enhance Git workflow with intelligent automation\n\nKey Features:\n- Smart commit message generation\n- Automated branch naming conventions\n- Code review preparation\n- Conflict resolution assistance\n- Team workflow enforcement\n\nCommands:\n- git-assist commit (generates commit messages)\n- git-assist branch (creates properly named branches)\n- git-assist review (prepares code for review)\n- git-assist sync (handles upstream synchronization)\n\nTechnical Implementation:\n- Written in Go for performance\n- Uses Git hooks for automation\n- Integrates with GitHub/GitLab APIs\n- Configurable rules and templates\n\nImpact:\n- 40% faster commit process\n- 90% reduction in naming inconsistencies\n- Improved code review quality\n- Better team collaboration\n\nUser Testimonial:\n"This tool transformed our Git workflow. Commits are more consistent and meaningful."',
                    permissions: '-rw-r--r--',
                    size: 933,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
            },
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
          'info.txt': {
            name: 'info.txt',
            type: 'file',
            content:
              'Contact Information\n\nEmail: developer@example.com\nLinkedIn: https://linkedin.com/in/developer\nGitHub: https://github.com/developer\nTwitter: @developer\n\nLocation: Remote / San Francisco, CA\nTimezone: PST (UTC-8)\n\nPreferred Contact Method: Email\nResponse Time: Within 24 hours\n\nOpen to:\n- Full-time opportunities\n- Contract work\n- Consulting projects\n- Open source collaboration\n- Speaking engagements\n- Technical writing\n\nCurrent Status: Available for new projects\n\nPortfolio: https://developer-portfolio.com\nResume: Available upon request\n\nNote: This terminal emulator is part of my portfolio.\nFeel free to explore the filesystem and try different commands!',
            permissions: '-rw-r--r--',
            size: 654,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'social.json': {
            name: 'social.json',
            type: 'file',
            content:
              '{\n  "professional": {\n    "linkedin": {\n      "url": "https://linkedin.com/in/developer",\n      "description": "Professional network and career updates"\n    },\n    "github": {\n      "url": "https://github.com/developer",\n      "description": "Open source projects and contributions"\n    },\n    "portfolio": {\n      "url": "https://developer-portfolio.com",\n      "description": "Complete portfolio with project demos"\n    }\n  },\n  "social": {\n    "twitter": {\n      "url": "https://twitter.com/developer",\n      "description": "Tech thoughts and industry discussions"\n    },\n    "mastodon": {\n      "url": "https://mastodon.social/@developer",\n      "description": "Decentralized social networking"\n    },\n    "dev_to": {\n      "url": "https://dev.to/developer",\n      "description": "Technical blog posts and tutorials"\n    }\n  },\n  "communication": {\n    "email": {\n      "address": "developer@example.com",\n      "type": "primary",\n      "description": "Best way to reach me for professional inquiries"\n    },\n    "calendar": {\n      "url": "https://calendly.com/developer",\n      "description": "Schedule a meeting or call"\n    }\n  },\n  "preferences": {\n    "response_time": "Within 24 hours",\n    "meeting_timezone": "PST (UTC-8)",\n    "best_contact_method": "Email first, then LinkedIn"\n  }\n}',
            permissions: '-rw-r--r--',
            size: 1204,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
        },
      },
      blog: {
        name: 'blog',
        type: 'directory',
        permissions: 'drwxr-xr-x',
        size: 4096,
        createdAt: new Date(),
        modifiedAt: new Date(),
        children: {
          'articles.md': {
            name: 'articles.md',
            type: 'file',
            content:
              '# Blog Articles\n\n## Recent Posts\n\n### Building a Web-Based Terminal Emulator\n*Published: January 15, 2024*\n\nA deep dive into creating a terminal emulator using React Router v7 and TypeScript. Learn about:\n- In-memory filesystem implementation\n- Command parsing and execution\n- I/O redirection and Unix-style options\n- Autocompletion algorithms\n- Markdown rendering with syntax highlighting\n\n[Read full article →](./2024/terminal-emulator.md)\n\n### The Art of Code Review\n*Published: December 20, 2023*\n\nBest practices for conducting effective code reviews that improve code quality and team collaboration.\n\n### TypeScript Tips for Better Developer Experience\n*Published: November 10, 2023*\n\nAdvanced TypeScript techniques for building more maintainable and type-safe applications.\n\n### Building CLI Tools with Node.js\n*Published: October 5, 2023*\n\nA comprehensive guide to creating professional command-line tools using Node.js and modern JavaScript.\n\n### Performance Optimization in React Applications\n*Published: September 15, 2023*\n\nTechniques for identifying and solving performance bottlenecks in React applications.\n\n## Topics I Write About\n\n- **Frontend Development**: React, TypeScript, modern CSS\n- **Backend Development**: Node.js, APIs, databases\n- **Developer Tools**: CLI tools, build systems, testing\n- **Software Architecture**: Design patterns, scalability\n- **Performance**: Optimization techniques, monitoring\n- **Career Development**: Leadership, mentoring, growth\n\n## Writing Philosophy\n\n> "The best technical writing explains complex concepts simply, provides practical examples, and helps readers solve real problems."\n\nI focus on:\n- **Practical Examples**: Real-world code that readers can use\n- **Clear Explanations**: Breaking down complex topics\n- **Problem-Solving**: Addressing common developer challenges\n- **Best Practices**: Sharing lessons learned from experience\n\n---\n\n*All articles are available in the `/blog/2024/` directory*',
            permissions: '-rw-r--r--',
            size: 1767,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          '2024': {
            name: '2024',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            size: 4096,
            createdAt: new Date(),
            modifiedAt: new Date(),
            children: {
              'terminal-emulator.md': {
                name: 'terminal-emulator.md',
                type: 'file',
                content: `# Building a Web-Based Terminal Emulator

*Published: January 15, 2024*

## Introduction

Creating a terminal emulator in the browser is a fascinating challenge that combines frontend development with systems programming concepts. In this article, I'll walk you through building a modern terminal emulator using React Router v7, TypeScript, and TailwindCSS.

## The Challenge

Building a terminal emulator requires solving several interesting problems:

1. **In-Memory Filesystem**: Creating a hierarchical file system that behaves like Unix
2. **Command Parsing**: Handling complex command-line syntax with options and redirection
3. **State Management**: Maintaining terminal history and filesystem state
4. **User Experience**: Providing familiar terminal interactions (history, autocompletion)
5. **Performance**: Rendering large amounts of text efficiently

## Architecture Overview

\`\`\`typescript
// Core filesystem interface
interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Record<string, FileSystemNode>;
  permissions?: string;
  size?: number;
  createdAt: Date;
  modifiedAt: Date;
}
\`\`\`

## Key Implementation Details

### 1. Filesystem Operations

The filesystem is implemented as a hierarchical tree structure stored in React state:

\`\`\`typescript
function resolvePath(currentPath: string[], targetPath: string): string[] {
  // Handle absolute paths
  if (targetPath.startsWith('/')) {
    return targetPath.split('/').filter(Boolean);
  }
  
  // Handle relative paths
  const parts = targetPath.split('/');
  const resolved = [...currentPath];
  
  for (const part of parts) {
    if (part === '..') {
      resolved.pop();
    } else if (part !== '.' && part !== '') {
      resolved.push(part);
    }
  }
  
  return resolved;
}
\`\`\`

### 2. Command Parsing

Commands are parsed to handle Unix-style options and I/O redirection:

\`\`\`typescript
function parseCommand(input: string): ParsedCommand {
  const tokens = tokenize(input);
  const { command, args, redirections } = extractComponents(tokens);
  
  return {
    command,
    args: parseOptions(args),
    redirections: parseRedirections(redirections)
  };
}
\`\`\`

### 3. Rich Output Rendering

The terminal supports rich text output with syntax highlighting:

\`\`\`typescript
type OutputSegment = {
  type: 'normal' | 'directory' | 'file' | 'error' | 'header-1' | 'code-block';
  content: string;
};

function renderMarkdown(content: string): OutputSegment[] {
  // Parse markdown and return styled segments
  return parseMarkdownToSegments(content);
}
\`\`\`

### 4. Autocompletion System

Intelligent tab completion for commands, file paths, and options:

\`\`\`typescript
function getCompletions(input: string, filesystem: FileSystemState): string[] {
  const { command, args, currentArg } = parsePartialCommand(input);
  
  if (!command) {
    return getCommandCompletions(currentArg);
  }
  
  return getPathCompletions(currentArg, filesystem);
}
\`\`\`

## Performance Optimizations

1. **Virtualized Output**: Only render visible terminal lines
2. **Debounced Input**: Reduce re-renders during typing
3. **Memoized Completions**: Cache autocompletion results
4. **Efficient Path Resolution**: Optimized filesystem navigation

## Testing Strategy

The project includes comprehensive tests:

\`\`\`typescript
// Unit tests for utilities
describe('filesystem utilities', () => {
  it('should resolve relative paths correctly', () => {
    const result = resolvePath(['home', 'user'], '../documents');
    expect(result).toEqual(['home', 'documents']);
  });
});

// Integration tests for commands
describe('command execution', () => {
  it('should handle complex command with redirection', () => {
    const result = executeCommand('ls -la > output.txt', filesystem);
    expect(result.success).toBe(true);
    expect(getFileContent('output.txt')).toContain('total');
  });
});
\`\`\`

## Lessons Learned

1. **State Management**: CSR mode in React Router v7 is perfect for terminal applications
2. **Type Safety**: TypeScript's strict mode catches many edge cases
3. **User Experience**: Small details (cursor blinking, sound effects) matter
4. **Performance**: Virtual scrolling is essential for large terminal output
5. **Testing**: Integration tests are crucial for command-line interfaces

## What's Next

- **Persistence**: Browser localStorage for session management
- **Text Editor**: Vim-inspired editor integration
- **Plugin System**: Extensible command architecture
- **Themes**: Multiple color schemes beyond Catppuccin

## Conclusion

Building a terminal emulator was an excellent exercise in combining systems programming concepts with modern web development. The result is a functional, performant terminal that can serve as a portfolio piece, educational tool, or foundation for more complex applications.

The complete source code is available on [GitHub](https://github.com/developer/terminal-emulator), and you can try the live demo at [terminal-demo.com](https://terminal-demo.com).

---

*Want to build your own terminal emulator? Start with a simple command parser and gradually add features. The journey is as rewarding as the destination!*`,
                permissions: '-rw-r--r--',
                size: 4967,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'typescript-tips.md': {
                name: 'typescript-tips.md',
                type: 'file',
                content: `# TypeScript Tips for Better Developer Experience

*Published: November 10, 2023*

## Advanced TypeScript Techniques

TypeScript is more than just "JavaScript with types." Here are some advanced techniques that can significantly improve your development experience.

### 1. Template Literal Types

\`\`\`typescript
type EventName = \`on\${Capitalize<string>}\`;
type ClickEvent = \`on\${Capitalize<'click'>}\`; // "onClick"

// Create type-safe event handlers
type EventHandlers<T extends Record<string, any>> = {
  [K in keyof T as \`on\${Capitalize<string & K>}\`]: (event: T[K]) => void;
};
\`\`\`

### 2. Conditional Types for API Responses

\`\`\`typescript
type ApiResponse<T> = T extends { id: string }
  ? { data: T; meta: { id: string } }
  : { data: T };

type UserResponse = ApiResponse<{ id: string; name: string }>;
// { data: { id: string; name: string }; meta: { id: string } }
\`\`\`

### 3. Utility Types for Better APIs

\`\`\`typescript
// Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface CreateUserRequest {
  name: string;
  email: string;
  id: string;
  createdAt: Date;
}

// Make id and createdAt optional for creation
type CreateUserInput = PartialBy<CreateUserRequest, 'id' | 'createdAt'>;
\`\`\`

### 4. Branded Types for Type Safety

\`\`\`typescript
type UserId = string & { __brand: 'UserId' };
type Email = string & { __brand: 'Email' };

function createUser(id: UserId, email: Email) {
  // Type-safe function that only accepts branded types
}

// Type guards for runtime validation
function isUserId(value: string): value is UserId {
  return /^user_[a-zA-Z0-9]+$/.test(value);
}
\`\`\`

## Best Practices

1. **Use \`const\` assertions for better inference**
2. **Leverage discriminated unions for state management**
3. **Create helper types for common patterns**
4. **Use \`satisfies\` operator for better type checking**

---

*Master these techniques to write more maintainable TypeScript code!*`,
                permissions: '-rw-r--r--',
                size: 1847,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
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
export function getFilesystemByMode(mode: 'default' | 'portfolio' = 'default'): FileSystemNode {
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
