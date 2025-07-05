import type { FileSystemNode, FileSystemState } from '~/routes/terminal/types/filesystem';

export function createDefaultFileSystem(): FileSystemState {
  const now = new Date();

  return {
    root: {
      name: '/',
      type: 'directory',
      children: {
        home: {
          name: 'home',
          type: 'directory',
          createdAt: now,
          modifiedAt: now,
          children: {
            user: {
              name: 'user',
              type: 'directory',
              createdAt: now,
              modifiedAt: now,
              children: {
                documents: {
                  name: 'documents',
                  type: 'directory',
                  createdAt: now,
                  modifiedAt: now,
                  children: {
                    'readme.txt': {
                      name: 'readme.txt',
                      type: 'file',
                      content: 'Welcome to the terminal emulator!\nThis is a sample file.',
                      size: 62,
                      createdAt: now,
                      modifiedAt: now,
                    },
                    'example.md': {
                      name: 'example.md',
                      type: 'file',
                      content: `# Terminal Emulator

This is a **markdown** file example with various elements:

## Features

- **Bold text** and *italic text*
- \`Inline code\` blocks
- [Links](https://example.com)

### Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> This is a blockquote with important information.

1. Ordered list item
2. Another item
3. Final item

---

*Built with React Router v7 and Catppuccin theme*`,
                      size: 400,
                      createdAt: now,
                      modifiedAt: now,
                    },
                  },
                },
                projects: {
                  name: 'projects',
                  type: 'directory',
                  createdAt: now,
                  modifiedAt: now,
                  children: {},
                },
                '.secret': {
                  name: '.secret',
                  type: 'file',
                  content: `🐱 Catppuccin Terminal Emulator Easter Egg! 🐱

You found the hidden file! Here's a little ASCII art for you:

       /\\_/\\  
      ( o.o ) 
       > ^ <

This terminal emulator was built with:
- React Router v7 🚀
- TypeScript ⚡
- TailwindCSS 🎨  
- Catppuccin Mocha theme 🎵

Fun fact: This file is hidden because it starts with a dot (.)
Use 'ls -a' to see all hidden files!

🌟 Keep exploring! 🌟`,
                  size: 350,
                  createdAt: now,
                  modifiedAt: now,
                },
              },
            },
          },
        },
        tmp: {
          name: 'tmp',
          type: 'directory',
          createdAt: now,
          modifiedAt: now,
          children: {},
        },
        etc: {
          name: 'etc',
          type: 'directory',
          createdAt: now,
          modifiedAt: now,
          children: {
            'config.conf': {
              name: 'config.conf',
              type: 'file',
              content: '# Configuration file\nversion=1.0\ndebug=false',
              size: 42,
              createdAt: now,
              modifiedAt: now,
            },
          },
        },
      },
      createdAt: now,
      modifiedAt: now,
    },
    currentPath: ['home', 'user'],
  };
}

export function getNodeAtPath(filesystem: FileSystemState, path: string[]): FileSystemNode | null {
  let current = filesystem.root;

  for (const segment of path) {
    if (current.type !== 'directory' || !current.children || !current.children[segment]) {
      return null;
    }
    current = current.children[segment];
  }

  return current;
}

export function getCurrentDirectory(filesystem: FileSystemState): FileSystemNode | null {
  return getNodeAtPath(filesystem, filesystem.currentPath);
}

export function resolvePath(filesystem: FileSystemState, inputPath: string): string[] {
  if (inputPath.startsWith('/')) {
    // Absolute path
    return inputPath
      .slice(1)
      .split('/')
      .filter((segment) => segment !== '');
  } else if (inputPath === '..') {
    // Parent directory
    return filesystem.currentPath.slice(0, -1);
  } else if (inputPath === '.') {
    // Current directory
    return filesystem.currentPath;
  } else {
    // Relative path
    const segments = inputPath.split('/').filter((segment) => segment !== '');
    let newPath = [...filesystem.currentPath];

    for (const segment of segments) {
      if (segment === '..') {
        newPath.pop();
      } else if (segment !== '.') {
        newPath.push(segment);
      }
    }

    return newPath;
  }
}

export function formatPath(path: string[]): string {
  return path.length === 0 ? '/' : '/' + path.join('/');
}

export function createFile(filesystem: FileSystemState, path: string[], name: string, content: string = ''): boolean {
  const parentNode = getNodeAtPath(filesystem, path);
  if (!parentNode || parentNode.type !== 'directory' || !parentNode.children) {
    return false;
  }

  const now = new Date();
  parentNode.children[name] = {
    name,
    type: 'file',
    content,
    size: content.length,
    createdAt: now,
    modifiedAt: now,
  };

  parentNode.modifiedAt = now;
  return true;
}

export function createDirectory(filesystem: FileSystemState, path: string[], name: string): boolean {
  const parentNode = getNodeAtPath(filesystem, path);
  if (!parentNode || parentNode.type !== 'directory' || !parentNode.children) {
    return false;
  }

  const now = new Date();
  parentNode.children[name] = {
    name,
    type: 'directory',
    children: {},
    createdAt: now,
    modifiedAt: now,
  };

  parentNode.modifiedAt = now;
  return true;
}

export function deleteNode(filesystem: FileSystemState, path: string[], name: string): boolean {
  const parentNode = getNodeAtPath(filesystem, path);
  if (!parentNode || parentNode.type !== 'directory' || !parentNode.children || !parentNode.children[name]) {
    return false;
  }

  delete parentNode.children[name];
  parentNode.modifiedAt = new Date();
  return true;
}
