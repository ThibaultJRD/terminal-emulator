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
              '# Thibault Jaillard\n\n## Senior Mobile Developer\n\n**Location**: Montréal, QC, Canada  \n**Email**: thibault.jaillard@gmail.com  \n**LinkedIn**: [linkedin.com/in/thibault-jaillard](https://linkedin.com/in/thibault-jaillard)  \n**GitHub**: [github.com/ThibaultJRD](https://github.com/ThibaultJRD)  \n\n## About\n\nPassionate about computer science, I\'m a **front-end/back-end and mobile developer** specialized in hybrid technology usage. I\'ve developed over 10 applications including **Fruitz** (acquired by Bumble) and apps downloaded **50,000+ times**.\n\nMy goal is to join a team that shares a common vision for creating innovative projects, from ideation to conception, development, and commercialization. As a professional, my **programming skills**, **ability to work at a high pace**, and **flexibility** play an essential role in business success.\n\n## Current Role\n\n**Senior Mobile Developer** at GO ROCK IT (Consultant for Banque Nationale du Canada)  \n*September 2019 - Present*\n\n- Developing and maintaining mobile banking applications serving **4M+ monthly active users**\n- Implementing best web development practices including responsive design and cross-browser compatibility\n- Reducing accessibility incidents by **30%** through improved development standards\n- Optimizing platform stability, reducing bugs by **25%** and improving performance by **15%**\n\n## Core Competencies\n\n- **Mobile Development**: React Native, iOS, Android development with **1000+ features** developed\n- **Frontend**: React, TypeScript, TailwindCSS, Redux, Vue.js\n- **Backend**: Node.js, NestJS, Express, PostgreSQL, MongoDB\n- **Blockchain**: Cosmos SDK, API REST integration, blockchain data synchronization\n- **DevOps**: Docker, GitHub workflows, CI/CD, AWS, Firebase\n- **Collaboration**: Agile/Scrum methodologies, UI/UX design integration\n\n## Philosophy\n\n> "Excellence in code comes from combining technical precision with human-centered design."\n\nI believe in:\n- **Technical Excellence**: Writing clean, maintainable, and scalable code\n- **User-Centered Development**: Building applications that truly serve user needs\n- **Continuous Innovation**: Staying current with emerging technologies and best practices\n- **Collaborative Growth**: Knowledge sharing and mentoring within development teams',
            permissions: '-rw-r--r--',
            size: 1891,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'skills.json': {
            name: 'skills.json',
            type: 'file',
            content:
              '{\n  "programming_languages": [\n    { "name": "TypeScript", "level": "Expert", "years": 5 },\n    { "name": "JavaScript", "level": "Expert", "years": 6 },\n    { "name": "React Native", "level": "Expert", "years": 5 },\n    { "name": "Swift", "level": "Advanced", "years": 3 },\n    { "name": "Python", "level": "Intermediate", "years": 2 },\n    { "name": "Go", "level": "Beginner", "years": 1 }\n  ],\n  "frontend_frameworks": [\n    { "name": "React", "level": "Expert", "years": 5 },\n    { "name": "React Router", "level": "Expert", "years": 3 },\n    { "name": "Vue.js", "level": "Advanced", "years": 2 },\n    { "name": "Redux", "level": "Expert", "years": 4 },\n    { "name": "TailwindCSS", "level": "Advanced", "years": 3 },\n    { "name": "SASS", "level": "Advanced", "years": 4 },\n    { "name": "Bootstrap", "level": "Expert", "years": 4 }\n  ],\n  "mobile_development": [\n    { "name": "React Native", "level": "Expert", "years": 5 },\n    { "name": "iOS Development", "level": "Advanced", "years": 3 },\n    { "name": "Android Development", "level": "Advanced", "years": 3 },\n    { "name": "Expo", "level": "Expert", "years": 4 }\n  ],\n  "backend_technologies": [\n    { "name": "Node.js", "level": "Expert", "years": 5 },\n    { "name": "NestJS", "level": "Expert", "years": 3 },\n    { "name": "Express", "level": "Expert", "years": 4 },\n    { "name": "PostgreSQL", "level": "Advanced", "years": 3 },\n    { "name": "MongoDB", "level": "Advanced", "years": 2 },\n    { "name": "Redis", "level": "Intermediate", "years": 2 }\n  ],\n  "blockchain_technologies": [\n    { "name": "Cosmos SDK", "level": "Expert", "years": 3 },\n    { "name": "JavaScript SDK", "level": "Expert", "years": 3 },\n    { "name": "API REST Integration", "level": "Expert", "years": 3 },\n    { "name": "Blockchain Data Sync", "level": "Expert", "years": 2 }\n  ],\n  "tools_and_platforms": [\n    { "name": "Git", "level": "Expert", "years": 6 },\n    { "name": "GitHub", "level": "Expert", "years": 6 },\n    { "name": "GitHub Workflows", "level": "Expert", "years": 3 },\n    { "name": "Docker", "level": "Advanced", "years": 3 },\n    { "name": "Redux Saga", "level": "Expert", "years": 3 },\n    { "name": "Rematch", "level": "Advanced", "years": 2 },\n    { "name": "Figma", "level": "Advanced", "years": 3 },\n    { "name": "Firebase", "level": "Advanced", "years": 3 },\n    { "name": "Axios", "level": "Expert", "years": 4 },\n    { "name": "Socket.io", "level": "Advanced", "years": 2 },\n    { "name": "Notifee", "level": "Advanced", "years": 2 }\n  ],\n  "methodologies": [\n    { "name": "Agile", "level": "Expert", "years": 5 },\n    { "name": "Scrum", "level": "Expert", "years": 5 },\n    { "name": "CI/CD", "level": "Advanced", "years": 3 },\n    { "name": "Test-Driven Development", "level": "Advanced", "years": 3 }\n  ],\n  "soft_skills": [\n    "Excellent Communication",\n    "Technical and Non-Technical Collaboration",\n    "Project Management",\n    "Debugging and Problem Solving",\n    "API Integration",\n    "Proactive Initiative",\n    "Adaptability",\n    "Technology Research"\n  ],\n  "languages": [\n    { "name": "French", "level": "Native" },\n    { "name": "English", "level": "Professional" }\n  ],\n  "achievements": [\n    "Developed 1000+ functionalities across multiple projects",\n    "Fruitz app: 50,000+ downloads, acquired by Bumble",\n    "BNC Banking App: 4M+ monthly active users",\n    "Reduced accessibility incidents by 30%",\n    "Improved platform performance by 15%",\n    "Reduced bugs by 25% through code optimization"\n  ]\n}',
            permissions: '-rw-r--r--',
            size: 3247,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'cv.pdf': {
            name: 'cv.pdf',
            type: 'file',
            content:
              'PDF_PLACEHOLDER: Curriculum Vitae - Thibault Jaillard\n\nSenior Mobile Developer\nMontréal, QC, Canada\n\nProfessional Summary:\n- 8+ years of experience in mobile and web development\n- Expert in React Native, TypeScript, and hybrid technologies\n- Successfully delivered 10+ applications with 50,000+ downloads\n- Specialized in large-scale applications (4M+ users)\n\nKey Achievements:\n- Fruitz app: 50,000+ downloads, acquired by Bumble\n- BNC Banking App: 4M+ monthly active users\n- Reduced accessibility incidents by 30%\n- Improved platform performance by 15%\n\nEducation:\n- EPITECH - European Institute of Technology (2014-2019)\n- Master in Computer Science and Information Technology\n\nContact:\n- Email: thibault.jaillard@gmail.com\n- LinkedIn: linkedin.com/in/thibault-jaillard\n- GitHub: github.com/ThibaultJRD',
            permissions: '-rw-r--r--',
            size: 756,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'philosophy.txt': {
            name: 'philosophy.txt',
            type: 'file',
            content:
              'Development Philosophy\n\n"Excellence in code comes from combining technical precision with human-centered design."\n\nCore Principles:\n\n1. TECHNICAL EXCELLENCE\n   - Write clean, maintainable, and scalable code\n   - Use modern development practices and tools\n   - Implement comprehensive testing strategies\n   - Focus on performance optimization\n\n2. USER-CENTERED DEVELOPMENT\n   - Build applications that truly serve user needs\n   - Prioritize accessibility and inclusive design\n   - Optimize for mobile-first experiences\n   - Gather and implement user feedback continuously\n\n3. COLLABORATIVE GROWTH\n   - Share knowledge and mentor team members\n   - Embrace code reviews as learning opportunities\n   - Work effectively in Agile/Scrum environments\n   - Communicate complex technical concepts clearly\n\n4. CONTINUOUS INNOVATION\n   - Stay current with emerging technologies\n   - Experiment with new frameworks and tools\n   - Contribute to open-source projects\n   - Adapt quickly to changing requirements\n\n5. BUSINESS VALUE FOCUS\n   - Align technical decisions with business goals\n   - Deliver features that drive user engagement\n   - Optimize for scalability and maintainability\n   - Measure success through concrete metrics\n\n6. QUALITY ASSURANCE\n   - Implement robust testing at all levels\n   - Use CI/CD pipelines for reliable deployment\n   - Monitor applications in production\n   - Maintain high code quality standards\n\nApproach to Mobile Development:\n\n"Mobile apps must be fast, intuitive, and accessible to all users."\n\n- Platform-specific optimization while maintaining code reusability\n- Responsive design that works across all device sizes\n- Offline capability and data synchronization\n- Battery and performance optimization\n- Security best practices for user data protection',
            permissions: '-rw-r--r--',
            size: 1687,
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
          'fruitz-app': {
            name: 'fruitz-app',
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
                  '# Fruitz - Dating App\n\n*Acquired by Bumble Inc. | 50,000+ Downloads*\n\n## 🍎 Project Overview\n\nFruitz was a revolutionary dating application that reinvented how people connect online. The app was successfully acquired by Bumble Inc., demonstrating its market value and innovative approach to mobile dating.\n\n## 📱 Key Achievements\n\n- **50,000+ Downloads** across iOS and Android platforms\n- **Acquired by Bumble** - Major exit for the startup\n- **Innovative UX/UI** that differentiated from existing dating apps\n- **Cross-platform compatibility** with shared codebase\n- **High user engagement** and retention rates\n\n## 🛠️ Technical Implementation\n\n### Technology Stack\n- **Frontend**: React Native for cross-platform development\n- **State Management**: Redux Saga for complex async operations\n- **Backend**: RESTful API integration\n- **Platforms**: iOS and Android native optimization\n- **Real-time**: Chat functionality with live messaging\n\n### Development Highlights\n- **Performance Optimization**: Achieved 20% improvement in app performance\n- **Bug Reduction**: Significantly reduced crashes by 25%\n- **Cross-platform Compatibility**: Maintained consistent experience across iOS and Android\n- **User Satisfaction**: Enhanced user experience leading to 30% improvement in satisfaction\n\n### Key Features Developed\n- **Smart Matching Algorithm**: AI-powered user matching system\n- **Real-time Chat**: Instant messaging with multimedia support\n- **Profile Management**: Rich user profiles with photo galleries\n- **Geolocation Services**: Location-based matching and discovery\n- **Push Notifications**: Intelligent notification system\n- **In-app Purchases**: Premium features and subscription model\n\n## 🏆 Professional Impact\n\n### Business Results\n- **Revenue Growth**: Contributed to 150% increase in revenue through premium features\n- **Market Position**: Helped establish competitive position in dating app market\n- **Exit Strategy**: Successful acquisition by industry leader Bumble\n\n### Technical Leadership\n- **Code Quality**: Implemented best practices and code review processes\n- **Team Collaboration**: Worked closely with designers and product managers\n- **Agile Development**: Delivered features in iterative sprints\n- **Testing**: Comprehensive testing ensuring app stability\n\n## 🎯 Lessons Learned\n\n- **User-Centric Design**: Importance of user feedback in feature development\n- **Scalability**: Building for growth from day one\n- **Performance**: Mobile app optimization techniques\n- **Cross-platform Development**: Benefits and challenges of React Native\n- **Startup Environment**: Rapid iteration and feature delivery\n\n---\n\n*This project showcased my ability to deliver high-quality mobile applications that achieve significant business success and user adoption.*',
                permissions: '-rw-r--r--',
                size: 2247,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'screenshots.txt': {
                name: 'screenshots.txt',
                type: 'file',
                content:
                  'Fruitz App Screenshots and Media\n\nApp Store Screenshots:\n- Main matching interface with fruit-themed design\n- User profile creation and editing screens\n- Chat interface with rich messaging features\n- Premium subscription and features overview\n\nKey Visual Elements:\n- Colorful, fruit-themed branding\n- Intuitive swipe gestures for matching\n- Clean, modern UI following iOS/Android guidelines\n- Engaging onboarding flow\n\nMarketing Materials:\n- App Store optimization assets\n- Social media promotional content\n- User testimonials and success stories\n- Press coverage from acquisition announcement\n\nTechnical Demos:\n- Cross-platform compatibility showcase\n- Performance optimization examples\n- Real-time chat functionality\n- Location-based matching demonstration\n\nNote: Due to acquisition by Bumble, detailed screenshots \nand proprietary information are confidential.',
                permissions: '-rw-r--r--',
                size: 884,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'technical-details.md': {
                name: 'technical-details.md',
                type: 'file',
                content:
                  '# Fruitz Technical Architecture\n\n## 🏗️ Mobile App Architecture\n\n```\n┌─────────────────────────────────────────────────────────────┐\n│                    React Native App                        │\n│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │\n│  │   Navigation    │  │   User Profile  │  │   Matching  │  │\n│  └─────────────────┘  └─────────────────┘  └─────────────┘  │\n└─────────────────────────┬───────────────────────────────────┘\n                          │\n┌─────────────────────────┴───────────────────────────────────┐\n│                    State Management                        │\n│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │\n│  │  Redux Store    │  │   Redux Saga    │  │   Actions   │  │\n│  └─────────────────┘  └─────────────────┘  └─────────────┘  │\n└─────────────────────────┬───────────────────────────────────┘\n                          │\n┌─────────────────────────┴───────────────────────────────────┐\n│                    Platform Services                       │\n│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │\n│  │   iOS Native    │  │ Android Native  │  │   Backend   │  │\n│  └─────────────────┘  └─────────────────┘  └─────────────┘  │\n└─────────────────────────────────────────────────────────────┘\n```\n\n## 📱 Component Architecture\n\n### Core Components\n- **MatchingScreen**: Main swipe interface with gesture handling\n- **ChatScreen**: Real-time messaging with multimedia support\n- **ProfileScreen**: User profile management and editing\n- **SettingsScreen**: App configuration and preferences\n\n### Navigation\n- **React Navigation**: Tab-based navigation with stack navigators\n- **Deep Linking**: Support for push notification navigation\n- **State Persistence**: Navigation state restoration\n\n### State Management\n- **Redux**: Centralized state management\n- **Redux Saga**: Complex async flow handling\n- **Persistence**: Redux Persist for offline capability\n\n## 🔄 Data Flow\n\n1. **User Interaction** → Component → Action Creator\n2. **Action Dispatch** → Redux Store → Reducer\n3. **Side Effects** → Redux Saga → API Calls\n4. **State Update** → Component Re-render → UI Update\n\n## 🎨 Design Patterns\n\n### Component Patterns\n```javascript\n// HOC for authentication\nconst withAuth = (Component) => {\n  return (props) => {\n    const { isAuthenticated } = useSelector(state => state.auth);\n    return isAuthenticated ? <Component {...props} /> : <LoginScreen />;\n  };\n};\n```\n\n### Redux Patterns\n- **Duck Pattern**: Co-located actions, reducers, and selectors\n- **Saga Pattern**: Generator functions for async operations\n- **Selector Pattern**: Memoized state selection\n\n## 📊 Performance Optimizations\n\n### React Native Optimizations\n- **FlatList**: Virtualized lists for smooth scrolling\n- **Image Caching**: Optimized image loading and caching\n- **Bundle Splitting**: Code splitting for faster startup\n- **Memory Management**: Efficient component lifecycle handling\n\n### Platform-Specific Optimizations\n- **iOS**: Core Data integration for offline storage\n- **Android**: Room database for local data persistence\n- **Push Notifications**: Platform-specific notification handling\n\n## 🔧 Development Tools\n\n### Testing Strategy\n- **Unit Tests**: Jest for component and utility testing\n- **Integration Tests**: Detox for end-to-end testing\n- **Code Quality**: ESLint and Prettier for consistent code style\n\n### CI/CD Pipeline\n- **Build Automation**: Automated builds for iOS and Android\n- **Testing**: Automated test execution on multiple devices\n- **Deployment**: TestFlight and Play Console integration\n\n## 🚀 Key Technical Achievements\n\n### Performance Metrics\n- **Startup Time**: < 3 seconds cold start\n- **Memory Usage**: Optimized to < 150MB average\n- **Battery Impact**: Minimal background processing\n- **Crash Rate**: < 0.1% crash-free sessions\n\n### Scalability Solutions\n- **Offline Support**: Full app functionality without network\n- **Real-time Updates**: WebSocket integration for live features\n- **Image Optimization**: Dynamic resizing and compression\n- **Caching Strategy**: Multi-layer caching for performance\n\n---\n\n*Technical architecture designed for scalability, performance, and maintainability*',
                permissions: '-rw-r--r--',
                size: 2794,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'impact.txt': {
                name: 'impact.txt',
                type: 'file',
                content:
                  'Fruitz App - Business Impact and Metrics\n\n## 📊 Download Metrics\n- Total Downloads: 50,000+\n- Platform Distribution: iOS 60%, Android 40%\n- User Retention: 65% (7-day), 35% (30-day)\n- Daily Active Users: Peak of 15,000+\n\n## 💰 Revenue Impact\n- Premium Feature Adoption: 25% of active users\n- Revenue Growth: 150% increase through premium features\n- In-app Purchase Revenue: Significant contributor to acquisition value\n- Subscription Model: Monthly and annual premium tiers\n\n## 🎯 User Engagement\n- Average Session Duration: 12 minutes\n- Messages Sent Per User: 45+ per week\n- Match Success Rate: 78% mutual matches\n- User Satisfaction Score: 4.2/5 (App Store rating)\n\n## 🏆 Market Position\n- Unique Positioning: Fruit-themed dating approach\n- Competitive Advantage: Innovative UX/UI design\n- Market Differentiation: Focus on meaningful connections\n- Brand Recognition: Strong social media presence\n\n## 📈 Growth Trajectory\n- Launch to 10k users: 3 months\n- 10k to 25k users: 2 months\n- 25k to 50k users: 4 months\n- Acquisition announcement: Month 12\n\n## 🎉 Acquisition by Bumble\n- Acquisition Date: 2022\n- Strategic Value: User base and technology integration\n- Team Integration: Development team joined Bumble\n- Technology Transfer: Features integrated into Bumble ecosystem\n\n## 🔧 Technical Contributions\n- Cross-platform development expertise\n- Real-time messaging infrastructure\n- Location-based matching algorithms\n- Premium feature monetization systems\n- Performance optimization techniques\n\n## 📝 Lessons for Future Projects\n- Importance of unique market positioning\n- Value of high-quality user experience\n- Scalability planning from day one\n- Effective monetization strategy implementation\n- Strong technical foundation for growth\n\n---\n\nThis project demonstrated the ability to deliver a product that achieved significant user adoption and business success, culminating in a successful acquisition by an industry leader.',
                permissions: '-rw-r--r--',
                size: 1756,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
            },
          },
          'banking-app': {
            name: 'banking-app',
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
                  "# BNC Banking App\n\n*Mobile Banking Solution serving 4M+ monthly active users*\n\n## 🏦 Project Overview\n\nDeveloped and maintained the mobile banking application for Banque Nationale du Canada (BNC), serving over 4 million monthly active users. This project represents one of the largest mobile banking platforms in Canada, requiring enterprise-level security, performance, and reliability.\n\n## 📱 Key Achievements\n\n- **4M+ Monthly Active Users** - Consistently serving millions of customers\n- **30% Reduction in Accessibility Incidents** - Through improved development standards\n- **25% Bug Reduction** - Via code optimization and testing improvements\n- **15% Performance Improvement** - Through platform stability enhancements\n- **Enterprise Security** - Meeting banking industry security standards\n\n## 🛠️ Technical Implementation\n\n### Technology Stack\n- **Frontend**: React Native with TypeScript\n- **State Management**: Redux for complex banking workflows\n- **Security**: Advanced encryption and secure authentication\n- **Backend Integration**: RESTful APIs with banking systems\n- **Testing**: Comprehensive test coverage for financial operations\n\n### Development Focus\n- **Cross-platform Compatibility**: Consistent experience across iOS and Android\n- **Accessibility**: WCAG compliance for inclusive banking\n- **Performance Optimization**: Fast load times for critical financial operations\n- **Security Best Practices**: Multi-layer security for financial data protection\n- **Responsive Design**: Optimized for various device sizes and orientations\n\n### Core Features\n- **Account Management**: Real-time balance and transaction viewing\n- **Money Transfers**: Secure peer-to-peer and institutional transfers\n- **Bill Payments**: Comprehensive bill payment and scheduling\n- **Investment Tracking**: Portfolio management and investment tools\n- **Credit Card Management**: Real-time credit monitoring and payments\n- **Security Features**: Biometric authentication and fraud detection\n\n## 🏆 Professional Impact\n\n### Business Results\n- **User Engagement**: High retention rates for mobile banking services\n- **Customer Satisfaction**: Improved user experience metrics\n- **Operational Efficiency**: Reduced support calls through better UX\n- **Digital Transformation**: Key role in bank's digital strategy\n\n### Technical Leadership\n- **Best Practices Implementation**: Responsive design and accessibility standards\n- **Code Quality**: Reduced technical debt through systematic improvements\n- **Team Collaboration**: Cross-functional work with designers and product teams\n- **Agile Development**: Iterative delivery of banking features\n\n## 🔒 Security & Compliance\n\n- **Financial Regulations**: Compliance with Canadian banking regulations\n- **Data Protection**: Advanced encryption for customer financial data\n- **Authentication**: Multi-factor authentication and biometric security\n- **Audit Trail**: Comprehensive logging for regulatory compliance\n- **Fraud Prevention**: Real-time fraud detection and prevention systems\n\n---\n\n*This project demonstrates expertise in enterprise-level mobile development, financial services, and large-scale user management.*",
                permissions: '-rw-r--r--',
                size: 2654,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'technical-specs.md': {
                name: 'technical-specs.md',
                type: 'file',
                content:
                  '# BNC Banking App - Technical Specifications\n\n## 🏗️ Architecture Overview\n\n### Mobile Application Layer\n- **React Native**: Cross-platform mobile development\n- **TypeScript**: Type-safe development for financial operations\n- **Redux**: State management for complex banking workflows\n- **React Navigation**: Secure navigation between banking screens\n\n### Security Layer\n- **End-to-End Encryption**: All financial data encrypted in transit\n- **Biometric Authentication**: Touch ID, Face ID, and fingerprint support\n- **Certificate Pinning**: Prevents man-in-the-middle attacks\n- **Session Management**: Secure token handling and automatic logout\n\n### API Integration\n- **Banking APIs**: Integration with core banking systems\n- **Real-time Data**: Live account balances and transaction updates\n- **Error Handling**: Robust error management for financial operations\n- **Rate Limiting**: API protection and performance optimization\n\n## 📊 Performance Metrics\n\n### Application Performance\n- **Load Time**: < 2 seconds for critical screens\n- **Memory Usage**: Optimized for low-end devices\n- **Battery Impact**: Minimal background processing\n- **Network Efficiency**: Optimized API calls and caching\n\n### User Experience Metrics\n- **Accessibility Score**: WCAG 2.1 AA compliance\n- **Crash Rate**: < 0.05% for financial operations\n- **Response Time**: < 500ms for common actions\n- **Offline Capability**: Core features available without network\n\n## 🔧 Development Practices\n\n### Code Quality\n- **TypeScript**: 100% TypeScript coverage\n- **ESLint**: Strict linting rules for financial code\n- **Prettier**: Consistent code formatting\n- **Testing**: 95%+ test coverage for critical paths\n\n### Security Practices\n- **Code Reviews**: Mandatory security-focused code reviews\n- **Static Analysis**: Automated security vulnerability scanning\n- **Dependency Audits**: Regular security audits of third-party libraries\n- **Penetration Testing**: Regular security testing and validation\n\n### Deployment Pipeline\n- **CI/CD**: Automated testing and deployment\n- **Environment Management**: Staging and production environments\n- **Feature Flags**: Gradual feature rollout and A/B testing\n- **Monitoring**: Real-time application performance monitoring\n\n## 📈 Scalability Solutions\n\n### Performance Optimization\n- **Code Splitting**: Lazy loading for faster startup\n- **Image Optimization**: Dynamic image resizing and compression\n- **Caching Strategy**: Multi-layer caching for performance\n- **Bundle Optimization**: Tree shaking and dead code elimination\n\n### Infrastructure\n- **CDN**: Global content delivery for static assets\n- **Load Balancing**: Distributed traffic handling\n- **Auto Scaling**: Dynamic resource allocation\n- **Disaster Recovery**: Multi-region backup and recovery\n\n---\n\n*Technical specifications designed for enterprise banking requirements*',
                permissions: '-rw-r--r--',
                size: 2246,
                createdAt: new Date(),
                modifiedAt: new Date(),
              },
              'achievements.txt': {
                name: 'achievements.txt',
                type: 'file',
                content:
                  "BNC Banking App - Key Achievements and Impact\n\n## 📈 User Metrics\n- Monthly Active Users: 4,000,000+\n- Platform Distribution: iOS 55%, Android 45%\n- User Retention: 85% (monthly), 70% (quarterly)\n- Session Duration: Average 8 minutes per session\n- Daily Transactions: 500,000+ financial transactions\n\n## 🏆 Technical Achievements\n\n### Performance Improvements\n- **15% Performance Boost**: Platform stability optimization\n- **25% Bug Reduction**: Through code refactoring and testing\n- **30% Accessibility Improvement**: WCAG compliance implementation\n- **Load Time Optimization**: Critical screens load in < 2 seconds\n\n### Security Enhancements\n- **Zero Security Incidents**: Throughout project tenure\n- **Advanced Authentication**: Biometric and multi-factor auth\n- **Fraud Detection**: Real-time transaction monitoring\n- **Compliance Achievement**: Met all banking regulatory requirements\n\n### Code Quality Metrics\n- **Test Coverage**: 95%+ for critical financial operations\n- **Code Review Rate**: 100% of code changes reviewed\n- **Technical Debt Reduction**: 40% improvement in code maintainability\n- **Documentation**: Comprehensive technical documentation\n\n## 💼 Business Impact\n\n### Customer Experience\n- **User Satisfaction**: 4.5/5 app store rating\n- **Support Call Reduction**: 20% decrease through better UX\n- **Feature Adoption**: 80%+ adoption rate for new features\n- **Accessibility Compliance**: Serving users with disabilities\n\n### Operational Excellence\n- **Uptime**: 99.9% availability for banking services\n- **Response Time**: < 500ms for critical operations\n- **Scalability**: Successfully handling 4M+ users\n- **Cross-platform Consistency**: Unified experience across platforms\n\n### Financial Services Innovation\n- **Digital Transformation**: Key role in bank's mobile strategy\n- **Feature Development**: 1000+ banking features implemented\n- **Integration Success**: Seamless core banking system integration\n- **Regulatory Compliance**: Full adherence to financial regulations\n\n## 🔧 Technical Leadership\n\n### Development Practices\n- **Agile Methodology**: Scrum-based development cycles\n- **Best Practices**: Responsive design and accessibility standards\n- **Team Collaboration**: Cross-functional team coordination\n- **Knowledge Sharing**: Mentoring junior developers\n\n### Innovation Contributions\n- **Architecture Decisions**: Key technical architecture choices\n- **Process Improvements**: Enhanced development workflows\n- **Technology Adoption**: Modern React Native patterns\n- **Security Focus**: Security-first development approach\n\n---\n\nThis project represents the pinnacle of enterprise mobile development, combining technical excellence with business impact in the critical financial services sector.",
                permissions: '-rw-r--r--',
                size: 2284,
                createdAt: new Date(),
                modifiedAt: new Date(),
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
              'terminal-emulator': {
                name: 'terminal-emulator',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'showcase.txt': {
                    name: 'showcase.txt',
                    type: 'file',
                    content:
                      'Terminal Emulator - Portfolio Showcase\n\n## 💻 Project Overview\nA sophisticated web-based terminal emulator that demonstrates advanced frontend development skills and serves as an interactive portfolio platform.\n\n## 🛠️ Technical Excellence\n- **Modern Stack**: React Router v7, TypeScript, TailwindCSS\n- **Architecture**: CSR mode for optimal state management\n- **Testing**: 285+ comprehensive tests with full coverage\n- **Performance**: Optimized for large-scale terminal operations\n\n## 🎨 Advanced Features\n- **Unix Commands**: Complete implementation of ls, cd, cat, vi, etc.\n- **File System**: In-memory hierarchical filesystem with persistence\n- **Text Editor**: Vim-inspired editor with modal editing\n- **I/O Redirection**: Full support for pipes and redirections\n- **Autocompletion**: Intelligent tab completion system\n- **Markdown Rendering**: Rich text display with syntax highlighting\n\n## 🏆 Portfolio Impact\n- **Interactive Experience**: Unique way to explore professional information\n- **Technical Demonstration**: Showcases complex frontend architecture\n- **User Engagement**: Gamified exploration of skills and projects\n- **Professional Branding**: Memorable and distinctive portfolio approach\n\n## 🚀 Innovation Highlights\n- **Dual Filesystem**: Route-based switching between default and portfolio modes\n- **Unicode Support**: Full international character and emoji support\n- **Responsive Design**: Works seamlessly across desktop and mobile\n- **Catppuccin Theme**: Beautiful, consistent color scheme throughout\n\nThis project exemplifies the ability to create complex, interactive web applications that serve both functional and artistic purposes.',
                    permissions: '-rw-r--r--',
                    size: 1442,
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
              'Contact Information\n\nThibault Jaillard\nSenior Mobile Developer\n\nEmail: thibault.jaillard@gmail.com\nLinkedIn: https://linkedin.com/in/thibault-jaillard\nGitHub: https://github.com/ThibaultJRD\nPhone: +1 514 619-0690\n\nLocation: Montréal, QC, Canada\nTimezone: EST (UTC-5)\nAuthorized to work in Canada\n\nPreferred Contact Method: Email\nResponse Time: Within 24 hours\n\nProfessional Status:\n- Currently employed at GO ROCK IT (Consultant for BNC)\n- Open to new opportunities and interesting projects\n- Available for consulting and technical discussions\n\nSpecializations:\n- Mobile Development (React Native, iOS, Android)\n- Frontend Development (React, TypeScript, Vue.js)\n- Blockchain Development (Cosmos ecosystem)\n- Large-scale applications (4M+ users)\n\nCareer Highlights:\n- Fruitz app: 50,000+ downloads, acquired by Bumble\n- BNC Banking App: 4M+ monthly active users\n- Lum Network blockchain projects\n- 8+ years of professional development experience\n\nNote: This terminal emulator showcases my development skills.\nFeel free to explore the filesystem and discover my projects!',
            permissions: '-rw-r--r--',
            size: 1087,
            createdAt: new Date(),
            modifiedAt: new Date(),
          },
          'social.json': {
            name: 'social.json',
            type: 'file',
            content:
              '{\n  "personal": {\n    "name": "Thibault Jaillard",\n    "title": "Senior Mobile Developer",\n    "location": "Montréal, QC, Canada",\n    "phone": "+1 514 619-0690",\n    "work_authorization": "Authorized to work in Canada"\n  },\n  "professional": {\n    "linkedin": {\n      "url": "https://linkedin.com/in/thibault-jaillard",\n      "description": "Professional network and career updates"\n    },\n    "github": {\n      "url": "https://github.com/ThibaultJRD",\n      "description": "Open source projects and code repositories"\n    },\n    "terminal_portfolio": {\n      "url": "https://thibault.iusevimbtw.com",\n      "description": "Interactive terminal-based portfolio"\n    }\n  },\n  "projects": {\n    "fruitz": {\n      "description": "Dating app with 50k+ downloads, acquired by Bumble",\n      "technologies": ["React Native", "Redux Saga", "iOS", "Android"]\n    },\n    "bnc_banking": {\n      "description": "Banking app serving 4M+ monthly users",\n      "technologies": ["React Native", "TypeScript", "Banking APIs"]\n    },\n    "lum_network": {\n      "description": "Blockchain projects in Cosmos ecosystem",\n      "technologies": ["React", "TypeScript", "Cosmos SDK", "NestJS"]\n    }\n  },\n  "communication": {\n    "email": {\n      "address": "thibault.jaillard@gmail.com",\n      "type": "primary",\n      "description": "Best way to reach me for professional inquiries"\n    },\n    "response_time": "Within 24 hours",\n    "timezone": "EST (UTC-5)"\n  },\n  "specializations": [\n    "React Native Development",\n    "iOS & Android Development",\n    "TypeScript & JavaScript",\n    "Blockchain Development",\n    "Large-scale Applications",\n    "Mobile Banking Solutions"\n  ],\n  "current_role": {\n    "company": "GO ROCK IT",\n    "position": "Senior Mobile Developer",\n    "client": "Banque Nationale du Canada",\n    "duration": "September 2019 - Present"\n  }\n}',
            permissions: '-rw-r--r--',
            size: 1648,
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
