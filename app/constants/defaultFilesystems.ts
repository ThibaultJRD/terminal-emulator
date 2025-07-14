import type { FileSystemNode } from '~/routes/terminal/types/filesystem';

/**
 * Creates a standardized manual page with optional customization for different filesystem modes.
 * @param command - The command name
 * @param synopsis - Command syntax
 * @param description - Command description
 * @param options - Available options (optional)
 * @param examples - Usage examples
 * @param seeAlso - Related commands (optional)
 * @param mode - Filesystem mode for customized headers ('default' or 'portfolio')
 */
function createManualPage(
  command: string,
  synopsis: string,
  description: string,
  examples: string[],
  options?: string[],
  seeAlso?: string[],
  mode: 'default' | 'portfolio' | 'tutorial' = 'default',
): FileSystemNode {
  const header = mode === 'portfolio' ? 'Portfolio Terminal Manual' : mode === 'tutorial' ? 'Tutorial Terminal Manual' : 'User Commands';
  const upperCommand = command.toUpperCase();

  let content = `${upperCommand}(1)                    ${header}                    ${upperCommand}(1)

NAME
       ${command} - ${synopsis}

SYNOPSIS
       ${synopsis}

DESCRIPTION
       ${description}`;

  if (options && options.length > 0) {
    content += '\n\nOPTIONS';
    options.forEach((option) => {
      content += `\n       ${option}`;
    });
  }

  content += '\n\nEXAMPLES';
  examples.forEach((example) => {
    content += `\n       ${example}`;
  });

  if (seeAlso && seeAlso.length > 0) {
    content += `\n\nSEE ALSO\n       ${seeAlso.join(', ')}`;
  }

  if (mode === 'portfolio') {
    content += '\n\nAUTHOR\n       Part of the Portfolio Terminal Emulator';
  } else if (mode === 'tutorial') {
    content += '\n\nTUTORIAL\n       Part of the Interactive Terminal Learning Experience';
  }

  return {
    name: `${command}.1`,
    type: 'file',
    content,
    permissions: '-rw-r--r--',
    size: content.length,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };
}

/**
 * Creates all manual pages for the man1 directory.
 * @param mode - Filesystem mode for customized content
 */
function createManualPages(mode: 'default' | 'portfolio' | 'tutorial' = 'default'): Record<string, FileSystemNode> {
  const manPages: Record<string, FileSystemNode> = {};

  // File Operations
  manPages['ls.1'] = createManualPage(
    'ls',
    'list directory contents',
    'List information about the FILEs (the current directory by default).\n       Sort entries alphabetically unless otherwise specified.',
    [
      'ls\n              List files in current directory',
      'ls -la\n              List all files in long format, including hidden files',
      mode === 'portfolio'
        ? 'ls /home/user/projects\n              List files in specific directory'
        : mode === 'tutorial'
          ? 'ls lessons\n              List tutorial lessons'
          : 'ls /home/user/documents\n              List files in specific directory',
    ],
    ['-a, --all\n              do not ignore entries starting with .', '-l     use a long listing format', '-la    combination of -l and -a'],
    ['cat(1)', 'mkdir(1)', 'rm(1)'],
    mode,
  );

  manPages['cd.1'] = createManualPage(
    'cd',
    'change directory',
    'Change the current working directory to DIRECTORY.\n       If no DIRECTORY is given, change to the home directory.',
    [
      'cd\n              Change to home directory',
      mode === 'portfolio'
        ? 'cd /home/user/projects\n              Change to projects directory'
        : mode === 'tutorial'
          ? 'cd lessons/01-basics\n              Change to first lesson'
          : 'cd /home/user/documents\n              Change to specific directory',
      'cd ..\n              Change to parent directory',
      mode === 'portfolio'
        ? 'cd about\n              Change to about directory'
        : mode === 'tutorial'
          ? 'cd sandbox\n              Change to practice area'
          : 'cd ../..\n              Change to grandparent directory',
    ],
    undefined,
    ['pwd(1)', 'ls(1)'],
    mode,
  );

  manPages['pwd.1'] = createManualPage(
    'pwd',
    'print working directory',
    'Print the full pathname of the current working directory.',
    ['pwd\n              Print current directory path'],
    undefined,
    ['cd(1)', 'ls(1)'],
    mode,
  );

  manPages['touch.1'] = createManualPage(
    'touch',
    'create empty file or update timestamp',
    'Create empty files or update the timestamp of existing files.\n       If the file does not exist, it will be created as an empty file.\n       If the file exists, its modification time will be updated.',
    ['touch newfile.txt\n              Create empty file or update timestamp', 'touch file1.txt file2.txt\n              Create or update multiple files'],
    undefined,
    ['ls(1)', 'cat(1)', 'rm(1)'],
    mode,
  );

  manPages['cat.1'] = createManualPage(
    'cat',
    'display file contents',
    'Display the contents of files. For markdown files (.md), content is\n       rendered with syntax highlighting using the Catppuccin theme.',
    mode === 'portfolio'
      ? [
          'cat about/README.md\n              Display portfolio about information',
          'cat projects/fruitz.md\n              Display project information with highlighting',
          'cat file1.txt file2.txt\n              Display multiple files',
        ]
      : [
          'cat file.txt\n              Display file contents',
          'cat notes.md\n              Display markdown file with syntax highlighting',
          'cat file1.txt file2.txt\n              Display multiple files',
        ],
    undefined,
    ['touch(1)', 'ls(1)', 'vi(1)'],
    mode,
  );

  manPages['mkdir.1'] = createManualPage(
    'mkdir',
    'create directories',
    'Create directories with the specified names.',
    [
      'mkdir newdir\n              Create a directory',
      'mkdir -p deep/nested/directory\n              Create nested directories',
      'mkdir dir1 dir2 dir3\n              Create multiple directories',
    ],
    ['-p, --parents\n              Create parent directories as needed'],
    ['rmdir(1)', 'ls(1)', 'cd(1)'],
    mode,
  );

  manPages['rm.1'] = createManualPage(
    'rm',
    'remove files and directories',
    'Remove files and directories. By default, rm does not remove directories.',
    [
      'rm file.txt\n              Remove a file',
      'rm -r directory\n              Remove directory and contents',
      'rm -rf unwanted_folder\n              Force remove directory and contents',
    ],
    [
      '-f, --force\n              Ignore nonexistent files and arguments',
      '-r, -R, --recursive\n              Remove directories and their contents recursively',
      '-rf    Combination of -r and -f',
    ],
    ['rmdir(1)', 'mkdir(1)', 'ls(1)'],
    mode,
  );

  manPages['rmdir.1'] = createManualPage(
    'rmdir',
    'remove empty directories',
    'Remove empty directories. The directory must be empty before it can\n       be removed.',
    ['rmdir emptydir\n              Remove empty directory', 'rmdir dir1 dir2\n              Remove multiple empty directories'],
    undefined,
    ['rm(1)', 'mkdir(1)', 'ls(1)'],
    mode,
  );

  manPages['cp.1'] = createManualPage(
    'cp',
    'copy files and directories',
    'Copy files and directories from SOURCE to DEST.',
    mode === 'portfolio'
      ? [
          'cp file.txt backup.txt\n              Copy file to new name',
          'cp -r srcdir destdir\n              Copy directory recursively',
          'cp projects/fruitz.md backup/\n              Copy project file to backup directory',
        ]
      : [
          'cp file.txt backup.txt\n              Copy file to new name',
          'cp -r srcdir destdir\n              Copy directory recursively',
          'cp *.txt backup/\n              Copy all .txt files to backup directory',
        ],
    [
      '-r, -R, --recursive\n              Copy directories recursively',
      '-f, --force\n              Overwrite existing files without prompting',
      '-i, --interactive\n              Prompt before overwriting files',
    ],
    ['mv(1)', 'rm(1)', 'ls(1)'],
    mode,
  );

  manPages['mv.1'] = createManualPage(
    'mv',
    'move/rename files and directories',
    'Move or rename files and directories from SOURCE to DEST.',
    mode === 'portfolio'
      ? [
          'mv oldname.txt newname.txt\n              Rename file',
          'mv file.txt projects/\n              Move file to projects directory',
          'mv -i file.txt existing.txt\n              Move with interactive prompting',
        ]
      : [
          'mv oldname.txt newname.txt\n              Rename file',
          'mv file.txt directory/\n              Move file to directory',
          'mv -i file.txt existing.txt\n              Move with interactive prompting',
        ],
    [
      '-f, --force\n              Overwrite existing files without prompting',
      '-i, --interactive\n              Prompt before overwriting files',
      '-n, --no-clobber\n              Do not overwrite existing files',
    ],
    ['cp(1)', 'rm(1)', 'ls(1)'],
    mode,
  );

  // Text Editor
  manPages['vi.1'] = createManualPage(
    'vi',
    'modal text editor',
    "A modal text editor inspired by vim. Supports NORMAL and INSERT modes.\n\nMODES\n       NORMAL mode\n              Navigate and execute commands\n              Press 'i' to enter INSERT mode\n              Press ':q' to quit\n              Press ':w' to save\n              Press ':wq' to save and quit\n\n       INSERT mode\n              Edit text content\n              Press ESC to return to NORMAL mode\n\nKEY BINDINGS\n       h, j, k, l    Move cursor (NORMAL mode)\n       i            Enter INSERT mode\n       ESC          Return to NORMAL mode\n       :w           Save file\n       :q           Quit editor\n       :wq          Save and quit",
    mode === 'portfolio'
      ? ['vi README.md\n              Edit README.md file', 'vi projects/new-project.md\n              Create and edit new project file']
      : ['vi README.md\n              Edit README.md file', 'vi new-file.txt\n              Create and edit new file'],
    undefined,
    ['cat(1)', 'touch(1)'],
    mode,
  );

  // Utilities
  manPages['echo.1'] = createManualPage(
    'echo',
    'display text',
    'Display text to output. Arguments are separated by spaces and followed\n       by a newline.',
    [
      'echo "Hello World"\n              Display text',
      'echo Hello World\n              Display text without quotes',
      'echo "Line 1" > file.txt\n              Write text to file',
    ],
    undefined,
    ['cat(1)', 'printf(1)'],
    mode,
  );

  manPages['wc.1'] = createManualPage(
    'wc',
    'count lines, words, and characters',
    'Count lines, words, and characters in files.\n\nOUTPUT FORMAT\n       Lines  Words  Characters  Filename',
    mode === 'portfolio'
      ? [
          'wc about/README.md\n              Count lines, words, and characters',
          'wc projects/*.md\n              Count for all project files',
          'wc < contact/README.md\n              Count using input redirection',
        ]
      : [
          'wc file.txt\n              Count lines, words, and characters',
          'wc *.txt\n              Count for all .txt files',
          'wc < file.txt\n              Count using input redirection',
        ],
    undefined,
    ['cat(1)', 'grep(1)'],
    mode,
  );

  manPages['clear.1'] = createManualPage(
    'clear',
    'clear terminal screen',
    'Clear the terminal screen and move cursor to top-left corner.',
    ['clear\n              Clear terminal screen'],
    undefined,
    ['reset(1)'],
    mode,
  );

  manPages['history.1'] = createManualPage(
    'history',
    'show command history',
    "Display the command history with line numbers. Commands are stored\n       in the .history file in the user's home directory.",
    ['history\n              Show command history'],
    undefined,
    ['bash(1)'],
    mode,
  );

  // Aliases and Shell
  manPages['alias.1'] = createManualPage(
    'alias',
    'create or list command aliases',
    'Create command aliases or list existing aliases.\n       Aliases provide shortcuts for longer commands.',
    [
      'alias\n              List all aliases',
      "alias ll='ls -l'\n              Create alias for ls -l",
      "alias work='cd ~/projects && ls'\n              Create multi-command alias",
      "alias hello='echo Hello, $1!'\n              Create alias with parameter substitution",
    ],
    undefined,
    ['unalias(1)', 'source(1)'],
    mode,
  );

  manPages['unalias.1'] = createManualPage(
    'unalias',
    'remove command aliases',
    'Remove command aliases created with the alias command.',
    ['unalias ll\n              Remove specific alias', 'unalias -a\n              Remove all aliases'],
    ['-a     Remove all aliases'],
    ['alias(1)', 'source(1)'],
    mode,
  );

  manPages['source.1'] = createManualPage(
    'source',
    'execute shell script and apply aliases',
    'Execute a shell script file and apply alias definitions.\n       Comments and export statements are parsed but not executed.',
    ['source ~/.bashrc\n              Load aliases from bashrc', 'source myaliases.sh\n              Load aliases from script file'],
    undefined,
    ['alias(1)', 'unalias(1)'],
    mode,
  );

  // System
  manPages['help.1'] = createManualPage(
    'help',
    'display help information',
    'Display comprehensive help information about available commands,\n       their options, and usage examples.',
    ['help\n              Show help information'],
    undefined,
    ['man(1)'],
    mode,
  );

  manPages['man.1'] = createManualPage(
    'man',
    'display manual pages',
    'Display manual pages for commands. Manual pages are stored in\n       /usr/share/man/man1/ and provide detailed documentation for each command.',
    [
      'man ls\n              Display manual page for ls command',
      'man 1 cat\n              Display manual page for cat from section 1',
      'man man\n              Display this manual page',
    ],
    undefined,
    ['help(1)', 'info(1)'],
    mode,
  );

  manPages['reset-fs.1'] = createManualPage(
    'reset-fs',
    'reset filesystem to default state',
    'Reset the filesystem to its default state based on the current route.\n       This will restore the original file structure and remove any user\n       modifications.',
    ['reset-fs\n              Reset filesystem to default state'],
    undefined,
    ['storage-info(1)'],
    mode,
  );

  manPages['storage-info.1'] = createManualPage(
    'storage-info',
    'display browser storage information',
    'Display information about browser storage usage, including filesystem\n       data size, backup status, and last save time.',
    ['storage-info\n              Show storage information'],
    undefined,
    ['reset-fs(1)'],
    mode,
  );

  manPages['grep.1'] = createManualPage(
    'grep',
    'search text using patterns',
    'Search for lines matching a pattern in files or stdin. Supports regular\n       expressions and various options for controlling the output.\n\n       PATTERN SYNTAX:\n       grep supports regular expression patterns with the following features:\n       ^pattern    - Match lines starting with pattern\n       pattern$    - Match lines ending with pattern\n       pat1|pat2   - Match lines containing pattern1 OR pattern2\n       [abc]       - Match any character in brackets\n       [^abc]      - Match any character NOT in brackets\n       .           - Match any single character\n       *           - Match zero or more of the preceding character\n       +           - Match one or more of the preceding character\n       ?           - Match zero or one of the preceding character',
    [
      '# Basic patterns',
      'grep "pattern" file.txt\n              Search for "pattern" in file.txt',
      'cat file.txt | grep "error"\n              Search for "error" in cat output',
      'grep -i "hello" file.txt\n              Case-insensitive search for "hello"',
      'grep -n "TODO" file.txt\n              Show line numbers for matches',
      'grep -v "debug" log.txt\n              Show lines NOT containing "debug"',
      'grep -c "error" log.txt\n              Count matching lines',
      '',
      '# Advanced patterns',
      'grep "^Start" file.txt\n              Lines starting with "Start"',
      'grep "end$" file.txt\n              Lines ending with "end"',
      'grep "cat|dog" file.txt\n              Lines containing "cat" OR "dog"',
      'grep -i "linux|unix" file.txt\n              Case-insensitive OR pattern',
      'grep "^Error:" log.txt\n              Log lines starting with "Error:"',
      'grep "done$" process.log\n              Process lines ending with "done"',
    ],
    [
      '-i                ignore case distinctions',
      '-v                invert match (show non-matching lines)',
      '-n                show line numbers',
      '-c                count matching lines',
    ],
    ['awk(1)', 'sed(1)', 'sort(1)'],
    mode,
  );

  manPages['head.1'] = createManualPage(
    'head',
    'display first lines of files',
    'Display the first lines of files or stdin. By default shows the first\n       10 lines.',
    [
      'head file.txt\n              Show first 10 lines of file.txt',
      'head -5 file.txt\n              Show first 5 lines of file.txt',
      'cat file.txt | head -3\n              Show first 3 lines from cat output',
    ],
    ['-n NUM            show NUM lines instead of 10'],
    ['tail(1)', 'cat(1)', 'more(1)'],
    mode,
  );

  manPages['tail.1'] = createManualPage(
    'tail',
    'display last lines of files',
    'Display the last lines of files or stdin. By default shows the last\n       10 lines.',
    [
      'tail file.txt\n              Show last 10 lines of file.txt',
      'tail -5 file.txt\n              Show last 5 lines of file.txt',
      'cat file.txt | tail -3\n              Show last 3 lines from cat output',
    ],
    ['-n NUM            show NUM lines instead of 10'],
    ['head(1)', 'cat(1)', 'more(1)'],
    mode,
  );

  manPages['sort.1'] = createManualPage(
    'sort',
    'sort lines of text',
    'Sort lines of text files or stdin. By default sorts alphabetically.',
    [
      'sort file.txt\n              Sort lines in file.txt alphabetically',
      'cat file.txt | sort\n              Sort lines from cat output',
      'sort -r file.txt\n              Sort in reverse order',
      'sort -n numbers.txt\n              Sort numerically',
    ],
    ['-r                reverse sort order', '-n                sort numerically'],
    ['uniq(1)', 'grep(1)', 'awk(1)'],
    mode,
  );

  manPages['uniq.1'] = createManualPage(
    'uniq',
    'remove duplicate consecutive lines',
    'Remove consecutive duplicate lines from files or stdin. Input should\n       typically be sorted first.',
    [
      'uniq file.txt\n              Remove consecutive duplicate lines',
      'sort file.txt | uniq\n              Sort then remove all duplicates',
      'cat file.txt | sort | uniq\n              Full deduplication pipeline',
    ],
    [],
    ['sort(1)', 'grep(1)', 'awk(1)'],
    mode,
  );

  return manPages;
}

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

# If not running interactively, don't do anything (placeholder)
case $- in
    *i*) ;;
      *) return;;
esac

# History settings (placeholder)
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000

# Environment variables
export EDITOR=vi
export PAGER=less
export GREP_OPTIONS='--color=auto'
export TERM_PROGRAM='terminal-emulator'

# Aliases (Implemented in the terminal emulator)
alias ll='ls -l'
alias la='ls -a'
alias l='ls -la'
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Enable color support (placeholder)
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
fi

# Terminal prompt (placeholder)
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
                    children: createManualPages('default'),
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
              '.bashrc': {
                name: '.bashrc',
                type: 'file',
                content: `# ~/.bashrc: executed by bash(1) for non-login shells

# If not running interactively, don't do anything (placeholder)
case $- in
    *i*) ;;
      *) return;;
esac

# History settings (placeholder)
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000

# Environment variables
export EDITOR=vi
export PAGER=less
export GREP_OPTIONS='--color=auto'
export TERM_PROGRAM='terminal-emulator'

# Aliases (Implemented in the terminal emulator)
alias ll='ls -l'
alias la='ls -a'
alias l='ls -la'
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Enable color support (placeholder)
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
fi

# Terminal prompt (placeholder)
PS1='\${debian_chroot:+(\$debian_chroot)}\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ '`,
                permissions: '-rw-r--r--',
                size: 756,
                createdAt: new Date(),
                modifiedAt: new Date(),
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
                    children: createManualPages('portfolio'),
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
 * Creates a tutorial filesystem structure with progressive Unix learning lessons.
 * This structure guides users through interactive terminal learning from basics to advanced concepts.
 */
export function createTutorialFilesystem(): FileSystemNode {
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
              lessons: {
                name: 'lessons',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  '01-basics': {
                    name: '01-basics',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        content: `# Lesson 1: Terminal Basics

Welcome to your first lesson! 🚀

## Objectives
- Learn to navigate directories
- Display directory contents  
- Know your current location
- Read file contents
- Get help and clear the screen

## Commands to Learn

### 1. clear - Clear the Screen
\`\`\`bash
clear
\`\`\`
Clears the terminal screen. Useful when it gets cluttered!

### 2. pwd - Print Working Directory
\`\`\`bash
pwd
\`\`\`
Shows the current directory (where you are).

### 3. ls - List Directory Contents  
\`\`\`bash
ls           # List files
ls -l        # Detailed list with permissions and sizes
ls -a        # Show hidden files (starting with .)
ls -la       # Combine -l and -a for full details
\`\`\`

### 4. cd - Change Directory
\`\`\`bash
cd              # Return to home directory
cd folder       # Go to 'folder'
cd ..           # Go up one level
cd ../..        # Go up two levels
cd /            # Go to root directory
\`\`\`

### 5. cat - Display File Contents
\`\`\`bash
cat file.txt    # Display file contents
\`\`\`

### 6. help - Get Help
\`\`\`bash
help            # Show general help
man command     # Show manual for specific command
\`\`\`

## Practical Exercises

### Exercise 1: Getting Oriented

**💡 Note**: If you need to re-read this lesson after clearing the screen, type \`cat README.md\`

1. Clear the screen: \`clear\`
2. Type \`pwd\` to see where you are
3. Type \`ls\` to see what's here
4. Type \`ls -la\` to see all files

### Exercise 2: Navigation
1. Go to the \`practice\` folder: \`cd practice\`
2. Show where you are: \`pwd\`
3. List files: \`ls\`
4. Return to parent folder: \`cd ..\`

### Exercise 3: Reading Files
1. Display contents of \`welcome.txt\`: \`cat welcome.txt\`
2. Read the \`commands.txt\` file: \`cat commands.txt\`

### Exercise 4: Getting Help
1. Try \`help\` to see general help
2. Try \`man ls\` to see ls manual

## 🎯 Challenge
Navigate to \`practice/files\` and list its contents. 
Try clearing the screen before each command!

Once these exercises are complete, move to the next lesson:
\`cd ../02-creation\``,
                        permissions: '-rw-r--r--',
                        size: 1500,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'welcome.txt': {
                        name: 'welcome.txt',
                        type: 'file',
                        content: `🎉 Congratulations! You just read your first file with 'cat'!

The terminal is your ally for:
- Quickly navigating your system
- Efficiently manipulating files  
- Automating repetitive tasks
- Controlling remote servers

Continue the exercises to master these superpowers! 💪`,
                        permissions: '-rw-r--r--',
                        size: 256,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'commands.txt': {
                        name: 'commands.txt',
                        type: 'file',
                        content: `Basic commands cheat sheet:

clear   - Clear the terminal screen
pwd     - Show current directory
ls      - List files
ls -l   - Detailed list with permissions and sizes  
ls -a   - Show hidden files (starting with .)
ls -la  - Combine -l and -a for full details
cd      - Change directory
cat     - Display file contents
help    - Show general help
man cmd - Manual for specific command (e.g., man ls)`,
                        permissions: '-rw-r--r--',
                        size: 384,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      practice: {
                        name: 'practice',
                        type: 'directory',
                        permissions: 'drwxr-xr-x',
                        size: 4096,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                        children: {
                          'note.txt': {
                            name: 'note.txt',
                            type: 'file',
                            content: `Well done! You navigated to the practice folder.

💡 Tip: Use Tab for auto-completion!
Type 'cd f' then Tab to see suggestions.`,
                            permissions: '-rw-r--r--',
                            size: 128,
                            createdAt: new Date(),
                            modifiedAt: new Date(),
                          },
                          files: {
                            name: 'files',
                            type: 'directory',
                            permissions: 'drwxr-xr-x',
                            size: 4096,
                            createdAt: new Date(),
                            modifiedAt: new Date(),
                            children: {
                              'secret.txt': {
                                name: 'secret.txt',
                                type: 'file',
                                content: `🎊 BRAVO! You found the secret file!

You now master:
✅ pwd - know your position
✅ ls - list files  
✅ cd - change directories
✅ cat - read files

Ready for the next step? Go to lesson 2:
cd ../../../02-files`,
                                permissions: '-rw-r--r--',
                                size: 256,
                                createdAt: new Date(),
                                modifiedAt: new Date(),
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                  '02-creation': {
                    name: '02-creation',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        content: `# Lesson 2: File Creation

Now that you know how to navigate, let's create files and directories! 📁

## Objectives
- Create empty files and directories
- Write simple text to files
- Understand basic file creation concepts

## Commands to Learn

### 1. touch - Create Empty Files
\`\`\`bash
touch file.txt
touch file1.txt file2.txt    # Create multiple files
\`\`\`
Creates an empty file or updates the timestamp if it exists.

### 2. mkdir - Create Directories
\`\`\`bash
mkdir folder
mkdir -p folder/subfolder    # Create parents if needed
\`\`\`
The \`-p\` flag creates parent directories automatically.

### 3. echo - Display Text (and Write to Files)
\`\`\`bash
echo "Hello World"           # Display text
echo "Hello" > file.txt      # Write to file (overwrite)
echo "More text" >> file.txt # Append to file
\`\`\`

## Practical Exercises

### Exercise 1: Basic Creation
1. Create a file called \`my_first_file.txt\`
2. Create a directory called \`my_folder\`
3. Check your work with \`ls\`

### Exercise 2: Multiple Files
1. Create three files at once: \`file1.txt\`, \`file2.txt\`, \`file3.txt\`
2. List them to verify they were created

### Exercise 3: Text Creation
1. Create a file with text: \`echo "Hello Terminal!" > greeting.txt\`
2. Read it back: \`cat greeting.txt\`
3. Add more text: \`echo "Learning is fun!" >> greeting.txt\`
4. Read the full file again

### Exercise 4: Directory Structure
1. Create a nested directory structure: \`my_project/docs\`
2. Navigate into it and create a file called \`notes.txt\`

## 🎯 Challenge
Create this structure in your current directory:
\`\`\`
workspace/
├── docs/
│   └── readme.txt (containing "Project documentation")
└── src/
    └── main.txt (containing "Main source file")
\`\`\`

Can you figure out how to do this efficiently?

Once complete, move to the next lesson:
\`cd ../03-management\``,
                        permissions: '-rw-r--r--',
                        size: 1600,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      practice: {
                        name: 'practice',
                        type: 'directory',
                        permissions: 'drwxr-xr-x',
                        size: 4096,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                        children: {
                          'example.txt': {
                            name: 'example.txt',
                            type: 'file',
                            content: `This is an example file.
You can use this as a template for your exercises.`,
                            permissions: '-rw-r--r--',
                            size: 128,
                            createdAt: new Date(),
                            modifiedAt: new Date(),
                          },
                        },
                      },
                    },
                  },
                  '03-management': {
                    name: '03-management',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        content: `# Lesson 3: File Management

Now you can create files and directories! Let's learn to copy, move, and delete them. 🔄

## Objectives
- Copy files and directories
- Move and rename files
- Safely delete files and directories
- Understand the dangers of deletion

## Commands to Learn

### 1. cp - Copy Files/Directories
\`\`\`bash
cp file.txt copy.txt         # Copy a file
cp file.txt backup/          # Copy to directory
cp -r folder new_folder      # Copy directory recursively
cp -r src/ backup/src/       # Copy directory to another location
\`\`\`
The \`-r\` flag is required for copying directories.

### 2. mv - Move/Rename
\`\`\`bash
mv old.txt new.txt          # Rename a file
mv file.txt folder/         # Move file to directory
mv folder/ new_location/    # Move directory
mv *.txt backup/            # Move all .txt files
\`\`\`
\`mv\` works for both renaming and moving!

### 3. rm - Delete Files
\`\`\`bash
rm file.txt                 # Delete a file
rm file1.txt file2.txt      # Delete multiple files
rm -r folder/               # Delete directory recursively
rm -f file.txt              # Force delete (no prompts)
rm -rf folder/              # Force delete directory
\`\`\`
⚠️ **WARNING**: Deletion is permanent!

### 4. rmdir - Delete Empty Directories
\`\`\`bash
rmdir empty_folder          # Only works on empty directories
\`\`\`

## Practical Exercises

### Exercise 1: Copying
1. Copy \`example.txt\` to \`backup.txt\`
2. Create a directory called \`copies\`
3. Copy \`example.txt\` into the \`copies\` directory
4. Verify with \`ls\` and \`ls copies/\`

### Exercise 2: Moving and Renaming
1. Rename \`backup.txt\` to \`my_backup.txt\`
2. Move \`my_backup.txt\` into the \`copies\` directory
3. Create a new directory called \`archive\`
4. Move the entire \`copies\` directory into \`archive\`

### Exercise 3: Safe Deletion
1. Create a test file: \`touch test_delete.txt\`
2. Delete it: \`rm test_delete.txt\`
3. Try to read it - what happens?
4. Create and delete an empty directory

## 🎯 Challenge
Starting with the \`example.txt\` file:
1. Create a project structure with \`src/\` and \`backup/\` directories
2. Copy the example file to both directories
3. Rename the file in \`src/\` to \`main.txt\`
4. Create a \`logs\` directory and then remove it

**Remember**: Practice these commands carefully - deletion is permanent!

Once complete, move to the text editor lesson:
\`cd ../04-editor\``,
                        permissions: '-rw-r--r--',
                        size: 1800,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'example.txt': {
                        name: 'example.txt',
                        type: 'file',
                        content: `This is an example file for practice.

You can copy it, move it, rename it...
Practice makes perfect! 🚀`,
                        permissions: '-rw-r--r--',
                        size: 128,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                    },
                  },
                  '04-editor': {
                    name: '04-editor',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        content: `# Lesson 4: The Vi Text Editor

Let's learn to use the integrated vi editor! ✏️  
It's a powerful tool for editing files directly in the terminal.

## Vi Modes

Vi works with 2 main modes:

### NORMAL Mode (command mode)
- **Navigate** through text
- **Execute** commands
- **Default mode** when opening

### INSERT Mode (editing mode)  
- **Write** and **modify** text
- Like a standard editor

## Essential Commands

### Opening a file
\`\`\`bash
vi filename.txt
\`\`\`

### In NORMAL mode:
- **i** : Enter INSERT mode (before cursor)
- **ESC** : Return to NORMAL mode
- **:w** : Save the file
- **:q** : Quit the editor
- **:wq** : Save and quit
- **:q!** : Quit without saving

### Navigation in NORMAL mode:
- **h, j, k, l** : Left, Down, Up, Right
- **Arrow keys** : Also work!

## Practical Exercises

### Exercise 1: First file
1. Open the editor: \`vi my_first_file.txt\`
2. Press **i** to enter INSERT mode
3. Type: "Hello, I'm mastering vi!"
4. Press **ESC** to return to NORMAL mode
5. Type **:wq** to save and quit
6. Verify: \`cat my_first_file.txt\`

### Exercise 2: Edit an existing file
1. Edit \`practice.txt\`: \`vi practice.txt\`
2. Read the instructions in the file
3. Modify it according to the guidelines
4. Save with **:w**
5. Quit with **:q**

### Exercise 3: Cancel editing
1. Open \`important.txt\`: \`vi important.txt\`
2. Make some modifications
3. Quit WITHOUT saving: **:q!**
4. Verify the file hasn't changed: \`cat important.txt\`

## 🎯 Challenge
Create a file \`my_resume.txt\` with vi and write your introduction!

## 💡 Tips
- **ESC ESC** if you're lost (forced return to NORMAL mode)
- **Vi = Vim** in this terminal (improved version)
- Autocompletion also works in INSERT mode (Tab)

Ready for file reading?
\`cd ../05-reading\``,
                        permissions: '-rw-r--r--',
                        size: 2000,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'practice.txt': {
                        name: 'practice.txt',
                        type: 'file',
                        content: `VI EXERCISE - Edit this file!

Instructions:
1. Add your name after "Name:"
2. Complete the sentence "I'm learning vi because..."
3. Add a new line with your favorite quote

Name: [ADD YOUR NAME HERE]

I'm learning vi because... [COMPLETE]

My quote: [ADD A QUOTE]

Save and quit when finished!`,
                        permissions: '-rw-r--r--',
                        size: 256,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'important.txt': {
                        name: 'important.txt',
                        type: 'file',
                        content: `⚠️ IMPORTANT FILE - DO NOT MODIFY ⚠️

This file contains critical data.
Use :q! to exit without saving!

If you see this message unchanged after the exercise,
it means you have mastered exiting without saving! 👍`,
                        permissions: '-rw-r--r--',
                        size: 256,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                    },
                  },
                  '05-reading': {
                    name: '05-reading',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        content: `# Lesson 5: File Reading

Now you can edit files! Let's learn different ways to read and analyze them. 📖

## Objectives
- Read files in different ways
- Count lines, words, and characters
- View partial file contents
- Understand when to use each tool

## Commands to Learn

### 1. cat - Display Full File Contents
\`\`\`bash
cat file.txt                # Display entire file
cat file1.txt file2.txt     # Display multiple files
cat -n file.txt             # Show line numbers
\`\`\`
Best for small files where you want to see everything.

### 2. head - Display File Beginning
\`\`\`bash
head file.txt               # Show first 10 lines
head -n 5 file.txt          # Show first 5 lines
\`\`\`
Perfect for previewing large files or logs.

### 3. tail - Display File End
\`\`\`bash
tail file.txt               # Show last 10 lines
tail -n 5 file.txt          # Show last 5 lines
\`\`\`
Great for checking recent log entries or file endings.

### 4. wc - Word Count
\`\`\`bash
wc file.txt                 # Show lines, words, characters
wc -l file.txt              # Count only lines
wc -w file.txt              # Count only words
wc -c file.txt              # Count only characters
\`\`\`
Essential for analyzing file size and content.

## Practical Exercises

### Exercise 1: Exploring Sample Files
1. Read the full \`sample.txt\` file
2. Show only the first 3 lines
3. Show only the last 3 lines
4. Count lines, words, and characters

### Exercise 2: Creating Test Content
1. Create a file with multiple lines using the editor
2. Use different reading commands to explore it
3. Compare the output of each command

### Exercise 3: File Analysis
1. Count how many lines are in \`sample.txt\`
2. Show the first and last lines only
3. Combine commands to see the middle content

## 🎯 Challenge
Using the \`large_sample.txt\` file:
1. Find out how many lines it contains without showing the content
2. Preview the beginning to understand the format
3. Check the ending to see how it concludes
4. Determine which reading method is most appropriate for this file

Practice with different file sizes to understand when each tool is most useful!

Once complete, move to text search:
\`cd ../06-search\``,
                        permissions: '-rw-r--r--',
                        size: 2000,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'sample.txt': {
                        name: 'sample.txt',
                        type: 'file',
                        content: `Line 1: Introduction
Line 2: This is a sample file for practicing reading commands.
Line 3: It contains multiple lines of text.
Line 4: Each line demonstrates different content.
Line 5: You can practice with head, tail, and cat.
Line 6: Word counting with wc is also useful.
Line 7: Understanding file structure is important.
Line 8: Terminal skills improve with practice.
Line 9: Reading files efficiently saves time.
Line 10: Conclusion`,
                        permissions: '-rw-r--r--',
                        size: 512,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'large_sample.txt': {
                        name: 'large_sample.txt',
                        type: 'file',
                        content: `# Large Sample File
This file demonstrates reading commands on larger content.

## Section 1: Introduction
Reading files efficiently is crucial for terminal productivity.
Different commands serve different purposes:
- cat: for full content viewing
- head: for quick previews
- tail: for checking endings
- wc: for content analysis

## Section 2: Examples
Here are various examples of content types:
1. Configuration files
2. Log files
3. Data files
4. Documentation files
5. Script files

## Section 3: Best Practices
When working with files:
- Use head to preview large files first
- Use tail to check recent changes
- Use wc to understand file size
- Use cat only for smaller files

## Section 4: Advanced Usage
Combining commands becomes powerful:
- head + tail for middle sections
- wc + other commands for analysis
- Different options for different needs

## Section 5: Conclusion
Practice with these commands regularly.
They become essential tools in your terminal toolkit.
Understanding when to use each command is key.
Efficient file reading improves workflow significantly.

End of large sample file.`,
                        permissions: '-rw-r--r--',
                        size: 1200,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                    },
                  },
                  '06-search': {
                    name: '06-search',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        content: `# Lesson 6: Text Search

Time to master searching through files! 🔍  
Learn to find exactly what you need in any file.

## Objectives
- Search for text patterns in files
- Use wildcards for flexible matching
- Master grep options and flags
- Find files and content efficiently

## Commands to Learn

### 1. grep - Search Text Patterns
\`\`\`bash
grep "word" file.txt         # Find lines containing "word"
grep -i "Word" file.txt      # Case insensitive search
grep -n "word" file.txt      # Show line numbers
grep -c "word" file.txt      # Count matches only
grep -v "word" file.txt      # Show lines NOT containing "word"
\`\`\`

### 2. Advanced grep Patterns
\`\`\`bash
grep "^Start" file.txt       # Lines starting with "Start"
grep "end$" file.txt         # Lines ending with "end"
grep "cat\\|dog" file.txt      # Lines with "cat" OR "dog"
\`\`\`

## Practical Exercises

### Exercise 1: Basic Searching
1. Search for "terminal" in \`tech_terms.txt\`
2. Search for "command" with line numbers
3. Count how many lines contain "file"

### Exercise 2: Case and Options
1. Search for "Linux" (case sensitive)
2. Search for "linux" (case insensitive)
3. Find lines that do NOT contain "Windows"

### Exercise 3: Pattern Matching
1. Find lines starting with "ERROR:" in \`system.log\`
2. Find lines ending with "end" in \`tech_terms.txt\`
3. Search for "success" or "complete" (case insensitive) in \`system.log\`

## 🎯 Challenge
Using the provided sample files (\`tech_terms.txt\`, \`system.log\`, \`contacts.txt\`):
1. Find lines containing "configuration" in \`tech_terms.txt\`
2. Count total ERROR messages in \`system.log\`
3. Find lines starting with dates in \`system.log\`
4. Find lines ending with "done" in \`system.log\`

**Bonus**: Combine grep with other commands you've learned!

Master these search skills - they're essential for:
- Debugging logs
- Finding configuration options
- Analyzing data files
- Code searching

Ready for redirections and pipes?
\`cd ../07-redirections\``,
                        permissions: '-rw-r--r--',
                        size: 2200,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'tech_terms.txt': {
                        name: 'tech_terms.txt',
                        type: 'file',
                        content: `terminal - A command-line interface for system interaction
command - An instruction given to the computer
file - A collection of data stored on disk
directory - A folder containing files and other directories
Linux - An open-source operating system
Unix - The original command-line operating system
Windows - Microsoft's operating system
grep - A command for searching text patterns
bash - A popular command shell
vim - A powerful text editor
configuration - Settings that control program behavior
script - A file containing commands to execute
Start learning new technologies to reach your end
Process completed at the end
cat is a common Unix command
dog is man's best friend
The journey doesn't end`,
                        permissions: '-rw-r--r--',
                        size: 512,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'system.log': {
                        name: 'system.log',
                        type: 'file',
                        content: `2023-12-01 10:00:00 INFO: System startup complete
2023-12-01 10:05:00 ERROR: Failed to connect to database
2023-12-01 10:06:00 INFO: Retrying database connection
2023-12-01 10:06:30 SUCCESS: Database connection established
2023-12-01 10:15:00 WARNING: High memory usage detected
2023-12-01 10:30:00 INFO: Backup process started
2023-12-01 10:45:00 SUCCESS: Backup completed successfully
2023-12-01 11:00:00 ERROR: Network timeout occurred
2023-12-01 11:01:00 INFO: Network connection restored
2023-12-01 11:15:00 INFO: Maintenance task done`,
                        permissions: '-rw-r--r--',
                        size: 512,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'contacts.txt': {
                        name: 'contacts.txt',
                        type: 'file',
                        content: `John Smith - john.smith@email.com - 555-0123
Jane Doe - jane.doe@company.org - 555-0456
Bob Wilson - bob@example.net - 555-0789
Alice Brown - alice.brown@university.edu - 555-0012
Mike Davis - mike.davis@startup.io - 555-0345
Sarah Connor - sarah@terminator.net - 555-0678`,
                        permissions: '-rw-r--r--',
                        size: 256,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'data1.txt': {
                        name: 'data1.txt',
                        type: 'file',
                        content: `Important configuration settings:
server_url=localhost:8080
debug_mode=true
max_connections=100
timeout=30
Important: Always backup before changes`,
                        permissions: '-rw-r--r--',
                        size: 128,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'data2.txt': {
                        name: 'data2.txt',
                        type: 'file',
                        content: `Configuration file for application:
database_host=db.example.com
cache_enabled=false
log_level=info
Important settings for production`,
                        permissions: '-rw-r--r--',
                        size: 128,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                    },
                  },
                  '07-redirections': {
                    name: '07-redirections',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        content: `# Lesson 7: Redirections and Pipes

Now let's connect commands together! 🔄  
Learn to redirect output and chain commands for powerful workflows.

## Environment Variables

### What are they?
Variables store information that programs can use.

### Important variables
- **$HOME** : Your home directory
- **$PATH** : Where the system looks for commands
- **$USER** : Your username
- **$PWD** : Current directory

### Usage
\`\`\`bash
echo $HOME                 # Display the home directory
echo "I am $USER"          # Use variable in text
\`\`\`

### Creating and modifying variables
\`\`\`bash
export MY_VAR="Hello World"    # Create/export a variable
export PATH="$PATH:/new/path"  # Modify existing variable
echo $MY_VAR                   # Use your custom variable
\`\`\`

### Variable scope
- **Local variables**: Only available in current session
- **Exported variables**: Available to child processes
- **Built-in variables**: Set by the system ($HOME, $USER, etc.)

## Variable Management Commands

### export command
Creates or modifies environment variables and makes them available to child processes.

\`\`\`bash
export              # List all exported variables
export VAR=value    # Create and export a variable
export VAR          # Export an existing local variable
\`\`\`

### unset command
Removes environment variables completely.

\`\`\`bash
unset VAR_NAME      # Remove a variable
unset VAR1 VAR2     # Remove multiple variables
\`\`\`

### Examples
\`\`\`bash
export PROJECT_DIR="/home/user/myproject"
export EDITOR="vi"
echo "Working in: $PROJECT_DIR"
unset PROJECT_DIR   # Remove the variable
\`\`\`

## The .bashrc file

### What is it?
The \`.bashrc\` file contains configurations that run 
every time you open a terminal.

### Typical content:
- **Aliases** (command shortcuts)
- **Environment variables**
- **Custom functions**

## Aliases - Command Shortcuts

### Creating aliases
\`\`\`bash
alias ll='ls -l'           # ll becomes a shortcut for ls -l
alias la='ls -la'          # la for ls -la
alias ..='cd ..'           # .. to go up
\`\`\`

### View aliases
\`\`\`bash
alias                      # List all aliases
\`\`\`

### Remove an alias
\`\`\`bash
unalias ll                 # Remove the ll alias
\`\`\`

## The source command

### Loading configurations
\`\`\`bash
source ~/.bashrc           # Reload configuration
source alias_file.sh       # Load aliases from a file
\`\`\`

## Practical Exercises

### Exercise 1: Environment variables
1. \`echo $HOME\`
2. \`echo $USER\` 
3. \`echo "My directory: $HOME"\`

### Exercise 2: Creating custom variables
1. \`export MY_NAME="Your Name"\`
2. \`echo "Hello, I'm $MY_NAME"\`
3. \`export PROJECT_PATH="/home/user/projects"\`
4. \`echo "My projects are in: $PROJECT_PATH"\`
5. \`env\` (list all variables)

### Exercise 3: Variable management
1. \`export TEMP_VAR="temporary"\`
2. \`echo $TEMP_VAR\`
3. \`unset TEMP_VAR\`
4. \`echo $TEMP_VAR\` (should be empty now)

### Exercise 4: Useful aliases
1. \`alias ll='ls -l'\`
2. \`alias la='ls -la'\`
3. \`alias h='history'\`
4. Test your new aliases!

### Exercise 5: .bashrc file
1. Open the file: \`vi ~/.bashrc\`
2. Look at its contents (NORMAL mode)
3. Quit without modifying: \`:q\`

### Exercise 6: Persistent aliases
1. Create a file: \`vi my_aliases.sh\`
2. Add your favorite aliases:
   \`\`\`bash
   alias ll='ls -l'
   alias la='ls -la'
   alias projects='cd ~/projects'
   \`\`\`
3. Save and quit
4. Load the aliases: \`source my_aliases.sh\`

## 🎯 Expert Challenge
Create a personal development environment:

1. **Set up project variables:**
\`\`\`bash
export CODING_MODE="productive"
export CURRENT_PROJECT="terminal-emulator"
export WORKSPACE="/home/user/projects"
\`\`\`

2. **Create useful aliases:**
\`\`\`bash
alias weather='echo "🌞 Beautiful weather for coding!"'
alias status='echo "Mode: $CODING_MODE | Project: $CURRENT_PROJECT"'
alias workspace='cd $WORKSPACE && ls'
\`\`\`

3. **Test your setup:**
\`\`\`bash
status
weather
workspace
\`\`\`

## 💡 Pro tips
- **Aliases** disappear when you close the terminal
- **Environment variables** persist during the session
- To make them permanent, add them to .bashrc
- Use descriptive names for variables (MY_PROJECT_PATH, not mp)
- Use short but explicit names for aliases
- Be careful not to overwrite existing commands or variables!

## 🏆 Great Progress!
You've mastered environment variables and aliases! 

Ready to learn how to connect commands together?
\`cd ../08-pipes-chaining\`

Or if you want to practice:
- \`cd ../../sandbox\` : Free testing area
- \`help\` : General terminal help`,
                        permissions: '-rw-r--r--',
                        size: 2800,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'my_aliases.sh': {
                        name: 'my_aliases.sh',
                        type: 'file',
                        content: `#!/bin/bash
# My personal aliases

# Quick navigation
alias ..='cd ..'
alias ...='cd ../..'
alias home='cd ~'

# Enhanced listings
alias ll='ls -l'
alias la='ls -la'
alias lt='ls -lt'

# Useful shortcuts
alias h='history'
alias c='clear'
alias reload='source ~/.bashrc'

# Create your own aliases here!
`,
                        permissions: '-rw-r--r--',
                        size: 384,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                    },
                  },
                  '08-pipes-chaining': {
                    name: '08-pipes-chaining',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        content: `# Lesson 8: Pipes and Command Chaining

Now let's connect commands together with pipes and chain operations! 🔗  
Learn to create powerful command workflows by combining simple tools.

## Understanding Pipes

### What is a Pipe?
A pipe (\`|\`) takes the output of one command and sends it as input to another command.

\`\`\`bash
command1 | command2
\`\`\`

### Basic Pipe Examples
\`\`\`bash
ls | wc -l                    # Count files in directory
cat file.txt | grep "error"   # Find lines containing "error"
echo "hello world" | wc -w    # Count words in text
ls -la | head -5              # Show first 5 files in detailed listing
\`\`\`

### Chain Multiple Pipes
\`\`\`bash
cat access.log | grep "ERROR" | wc -l          # Count error lines
ls -la | grep "\\.txt" | wc -l                   # Count .txt files
cat data.txt | sort | uniq                     # Sort and remove duplicates
cat words.txt | sort | uniq -c | sort -nr      # Word frequency analysis
\`\`\`

## Command Chaining Operators

### Sequential Execution (;)
Run commands one after another, regardless of success or failure.

\`\`\`bash
pwd ; ls ; date               # Run all three commands in sequence
mkdir test ; cd test ; touch file.txt    # Create dir, enter it, create file
\`\`\`

### Conditional AND (&&)
Run the next command ONLY if the previous one succeeded.

\`\`\`bash
mkdir project && cd project                    # Only cd if mkdir succeeds
touch file.txt && echo "File created!"        # Only echo if touch succeeds
ls file.txt && cat file.txt                   # Only cat if file exists
\`\`\`

### Conditional OR (||)
Run the next command ONLY if the previous one failed.

\`\`\`bash
ls missing_file.txt || echo "File not found"  # Show message if ls fails
cd nonexistent || echo "Directory not found"  # Handle missing directory
\`\`\`

### Combining Operators
You can combine different operators for complex workflows:

\`\`\`bash
mkdir backup && cp *.txt backup/ || echo "Backup failed"
ls project/ && cd project && ls || echo "No project directory"
\`\`\`

## Practical Exercises

### Exercise 1: Basic Pipes
1. List all files and count them: \`ls | wc -l\`
2. Find lines containing "log" in system.log: \`cat system.log | grep "log"\`
3. Count error messages: \`cat system.log | grep -i "error" | wc -l\`
4. Show the first 3 contacts: \`cat contacts.txt | head -3\`

### Exercise 2: Pipe Chains
1. Sort contacts and show unique entries: \`cat contacts.txt | sort | uniq\`
2. Find tech terms ending with "end": \`cat tech_terms.txt | grep "end$"\`
3. Count unique words: \`cat tech_terms.txt | wc -w\`
4. List files, filter for .txt, count them: \`ls -l | grep ".txt" | wc -l\`

### Exercise 3: Command Chaining
1. Create a test file: \`touch test.txt && echo "File created successfully"\`
2. Try to access missing file: \`cat missing.txt || echo "File not found"\`
3. Sequential commands: \`pwd ; ls ; date\`
4. Complex chain: \`mkdir temp && cd temp && touch file.txt && ls\`

### Exercise 4: Real-World Scenarios
1. **Log Analysis**: Count different log levels
   \`\`\`bash
   cat system.log | grep "INFO" | wc -l
   cat system.log | grep "ERROR" | wc -l
   cat system.log | grep "SUCCESS" | wc -l
   \`\`\`

2. **File Management**: Safe file operations
   \`\`\`bash
   ls backup/ && echo "Backup exists" || mkdir backup
   \`\`\`

3. **Data Processing**: Process and analyze text
   \`\`\`bash
   cat tech_terms.txt | sort | head -5
   cat contacts.txt | grep "@" | wc -l
   \`\`\`

## Advanced Combinations

### Exit Status with $?
Each command returns an exit status (0 = success, non-zero = failure):

\`\`\`bash
ls existing_file.txt ; echo "Exit status: $?"    # Should show 0
ls missing_file.txt ; echo "Exit status: $?"     # Should show non-zero
\`\`\`

### Complex Workflows
\`\`\`bash
# Create project structure safely
mkdir project && cd project && mkdir src docs tests && echo "Project setup complete" || echo "Setup failed"

# Process logs and save results
cat system.log | grep "ERROR" | wc -l > error_count.txt && echo "Error count saved"

# Find and process specific files
ls *.txt | head -3 | wc -l
\`\`\`

## 💡 Pro Tips

### Best Practices
- **Start simple**: Begin with single pipes, then build complexity
- **Test incrementally**: Add one pipe at a time to debug issues
- **Use meaningful commands**: Combine tools that logically work together
- **Handle errors**: Use \`&&\` and \`||\` to handle success/failure cases

### Common Patterns
- **Count and filter**: \`command | grep pattern | wc -l\`
- **Sort and dedupe**: \`command | sort | uniq\`
- **Process and save**: \`command | process | save\`
- **Safe operations**: \`test && action || fallback\`

### Performance Tips
- **Order matters**: Put filters early in pipe chains
- **Limit output**: Use \`head\` or \`tail\` to limit processing
- **Use specific grep**: More specific patterns = faster processing

## 🎯 Challenge Yourself

Try these complex combinations:
1. \`cat system.log | grep -v "INFO" | sort | uniq -c | sort -nr\`
2. \`ls -la | grep "^d" | wc -l && echo "directories" || echo "no dirs"\`
3. \`echo "Process complete" && cat contacts.txt | head -2 | wc -w\`

## 🏆 Congratulations!

You've mastered pipes and command chaining! These are essential skills for:
- **Log analysis and troubleshooting**
- **Data processing and text manipulation** 
- **Building robust command workflows**
- **Automating repetitive tasks**

Ready for practical challenges?
\`cd ../challenges\``,
                        permissions: '-rw-r--r--',
                        size: 4200,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'system.log': {
                        name: 'system.log',
                        type: 'file',
                        content: `2024-01-01 08:00:00 INFO: System startup initiated
2024-01-01 08:00:05 INFO: Loading configuration files
2024-01-01 08:00:10 ERROR: Failed to connect to database server
2024-01-01 08:00:15 INFO: Retrying database connection
2024-01-01 08:00:20 SUCCESS: Database connection established
2024-01-01 08:05:00 INFO: User authentication module loaded
2024-01-01 08:05:30 WARNING: High memory usage detected (85%)
2024-01-01 08:10:00 INFO: Starting backup process
2024-01-01 08:15:00 ERROR: Backup location not accessible
2024-01-01 08:15:05 INFO: Switching to alternate backup location
2024-01-01 08:20:00 SUCCESS: Backup completed successfully
2024-01-01 08:25:00 INFO: System maintenance window started
2024-01-01 08:30:00 WARNING: Disk space running low (90% used)
2024-01-01 08:35:00 ERROR: Network timeout on external API call
2024-01-01 08:35:30 INFO: API connection restored
2024-01-01 08:40:00 INFO: Maintenance window completed
2024-01-01 09:00:00 SUCCESS: All systems operational`,
                        permissions: '-rw-r--r--',
                        size: 1024,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'access.log': {
                        name: 'access.log',
                        type: 'file',
                        content: `192.168.1.100 - - [01/Jan/2024:08:00:00 +0000] "GET /index.html HTTP/1.1" 200 1024
192.168.1.101 - - [01/Jan/2024:08:00:15 +0000] "POST /api/login HTTP/1.1" 200 256
192.168.1.102 - - [01/Jan/2024:08:00:30 +0000] "GET /dashboard HTTP/1.1" 403 512
192.168.1.100 - - [01/Jan/2024:08:01:00 +0000] "GET /assets/style.css HTTP/1.1" 200 2048
192.168.1.103 - - [01/Jan/2024:08:01:15 +0000] "POST /api/data HTTP/1.1" 500 128
192.168.1.101 - - [01/Jan/2024:08:01:30 +0000] "GET /profile HTTP/1.1" 200 1536
192.168.1.104 - - [01/Jan/2024:08:02:00 +0000] "GET /nonexistent HTTP/1.1" 404 256
192.168.1.100 - - [01/Jan/2024:08:02:15 +0000] "POST /api/logout HTTP/1.1" 200 128
ERROR: Failed to process request from 192.168.1.105
192.168.1.106 - - [01/Jan/2024:08:03:00 +0000] "GET /index.html HTTP/1.1" 200 1024`,
                        permissions: '-rw-r--r--',
                        size: 512,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'contacts.txt': {
                        name: 'contacts.txt',
                        type: 'file',
                        content: `John Doe - john@example.com - Developer
Jane Smith - jane@company.org - Designer
Bob Johnson - bob@tech.net - Manager
Alice Brown - alice@startup.io - Engineer
Charlie Wilson - charlie@corp.com - Analyst
Diana Lee - diana@agency.co - Consultant
Frank Miller - frank@freelance.dev - Developer
Grace Taylor - grace@nonprofit.org - Coordinator
Henry Davis - henry@enterprise.biz - Administrator
Isabel Garcia - isabel@creative.studio - Artist`,
                        permissions: '-rw-r--r--',
                        size: 512,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'tech_terms.txt': {
                        name: 'tech_terms.txt',
                        type: 'file',
                        content: `API - Application Programming Interface
CLI - Command Line Interface
GUI - Graphical User Interface
HTTP - HyperText Transfer Protocol
JSON - JavaScript Object Notation
REST - Representational State Transfer
CRUD - Create Read Update Delete
MVC - Model View Controller
OOP - Object Oriented Programming
SQL - Structured Query Language
NoSQL - Not Only SQL
DevOps - Development Operations
CI/CD - Continuous Integration/Continuous Deployment
MVP - Minimum Viable Product
SaaS - Software as a Service
IaaS - Infrastructure as a Service
PaaS - Platform as a Service
frontend - client-side development
backend - server-side development
fullstack - both frontend and backend
framework - software foundation
library - reusable code collection
repository - code storage location
branch - code development line
commit - code change record
merge - combining code changes
deploy - releasing to production
debug - finding and fixing errors
refactor - improving code structure
optimize - enhancing performance
scale - handling increased load
monitor - tracking system health
backup - data protection copy
restore - recovering from backup
encrypt - protecting data security
authenticate - verifying user identity
authorize - granting user permissions
validate - checking data correctness
test - verifying code functionality
document - explaining code purpose
version - tracking code changes
release - distributing software update
patch - fixing specific issues
upgrade - improving system capabilities
downgrade - reverting to older version
migrate - moving to new system
integrate - combining different systems
configure - setting up system options
customize - adapting to specific needs
automate - making processes automatic
schedule - planning task execution
queue - organizing tasks in order
cache - storing frequently used data
index - organizing data for quick access
query - requesting specific data
filter - selecting subset of data
sort - organizing data in order
group - categorizing related data
aggregate - combining multiple values
transform - changing data format
parse - analyzing data structure
serialize - converting to storage format
deserialize - converting from storage format
encode - converting to specific format
decode - converting from encoded format
compress - reducing data size
decompress - restoring compressed data
hash - creating data fingerprint
encrypt - protecting with secret key
decrypt - revealing encrypted data
sign - proving data authenticity
verify - checking data signature
tunnel - creating secure connection
proxy - intermediary server
firewall - network security barrier
load_balancer - distributing traffic
cdn - content delivery network
dns - domain name system
ssl - secure socket layer
tls - transport layer security
vpn - virtual private network
ssh - secure shell connection
ftp - file transfer protocol
smtp - simple mail transfer protocol
pop - post office protocol
imap - internet message access protocol
tcp - transmission control protocol
udp - user datagram protocol
ip - internet protocol
mac - media access control
lan - local area network
wan - wide area network
wifi - wireless networking
bluetooth - short range wireless
nfc - near field communication
iot - internet of things
ai - artificial intelligence
ml - machine learning
dl - deep learning
nlp - natural language processing
cv - computer vision
ar - augmented reality
vr - virtual reality
blockchain - distributed ledger
cryptocurrency - digital currency
smart_contract - self executing code
node - network participant
consensus - agreement mechanism
mining - transaction validation
wallet - digital currency storage
exchange - trading platform
defi - decentralized finance
nft - non fungible token
dao - decentralized autonomous organization
web3 - decentralized web
metaverse - virtual shared space`,
                        permissions: '-rw-r--r--',
                        size: 2048,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'words.txt': {
                        name: 'words.txt',
                        type: 'file',
                        content: `apple
banana
apple
cherry
banana
date
apple
elderberry
fig
grape
apple
banana
kiwi
lemon
mango
banana
apple`,
                        permissions: '-rw-r--r--',
                        size: 128,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'data.txt': {
                        name: 'data.txt',
                        type: 'file',
                        content: `server1,active,high
server2,inactive,low
server3,active,medium
server1,maintenance,high
server4,active,low
server2,active,high
server3,inactive,medium
server5,active,high
server1,active,high
server6,maintenance,low`,
                        permissions: '-rw-r--r--',
                        size: 256,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                    },
                  },
                  challenges: {
                    name: 'challenges',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    size: 4096,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        content: `# 🏆 Practical Challenges

Test your skills with these progressive challenges!

## Challenge 1: Explorer 🔍
**Goal:** Find all hidden files in the system
**Hints:** 
- Hidden files start with \`.\`
- Use \`ls -a\`
- Explore different directories

## Challenge 2: Organizer 📁
**Goal:** Create this project structure:
\`\`\`
my-project/
├── src/
│   ├── main.js
│   └── utils.js
├── tests/
│   └── test.js
├── docs/
│   └── README.md
└── package.json
\`\`\`

## Challenge 3: Journalist 📝
**Goal:** Create a logging system
1. File \`daily.log\` with today's date
2. Add entries with \`>>\`
3. Count lines with \`wc -l\`

## Challenge 4: Vi Master ✏️
**Goal:** Edit the \`story.txt\` file
1. Add your author name
2. Complete the story
3. Fix typos

## Challenge 5: Alias Master 🚀
**Goal:** Create practical aliases
1. \`proj\` to go to your projects
2. \`backup\` to copy important files
3. \`clean\` to delete temporary files

## 🎖️ Ultimate Challenge
Create a script that:
1. Creates a backup folder with the date
2. Copies all your important files there
3. Shows a backup report

Good luck! 💪`,
                        permissions: '-rw-r--r--',
                        size: 1200,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                      'story.txt': {
                        name: 'story.txt',
                        type: 'file',
                        content: `Once upon a time, in a distant terminal...

A developer discoverd the power of the command line.
Every day, he learnt new commands.

[FIX THE TYPOS AND COMPLETE THE STORY]

Author: [YOUR NAME HERE]`,
                        permissions: '-rw-r--r--',
                        size: 256,
                        createdAt: new Date(),
                        modifiedAt: new Date(),
                      },
                    },
                  },
                },
              },
              sandbox: {
                name: 'sandbox',
                type: 'directory',
                permissions: 'drwxr-xr-x',
                size: 4096,
                createdAt: new Date(),
                modifiedAt: new Date(),
                children: {
                  'README.md': {
                    name: 'README.md',
                    type: 'file',
                    content: `# 🏖️ Sandbox - Free Testing Area

Welcome to your sandbox! 

Here, you can:
- Test all the commands you've learned
- Create your own files and directories  
- Experiment safely
- Practice your new aliases

## Tips
- Create whatever you want
- Delete, copy, move at will
- This is your training space!

## Cleanup commands
\`\`\`bash
rm -rf folder/  # Delete specific directory
rm file.txt     # Delete specific file
ls -la          # Check what remains
\`\`\`

Have fun! 🚀`,
                    permissions: '-rw-r--r--',
                    size: 512,
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                  },
                },
              },
              '.bashrc': {
                name: '.bashrc',
                type: 'file',
                content: `# ~/.bashrc - Tutorial configuration

# Environment variables
export TUTORIAL_MODE=true
export EDITOR=vi
export PAGER=cat

# Basic aliases (already configured)
alias ll='ls -l'
alias la='ls -la'
alias ..='cd ..'
alias ...='cd ../..'

# Special tutorial aliases
alias lessons='cd ~/lessons'
alias sandbox='cd ~/sandbox'

# Welcome message
echo "💡 Tutorial mode active! Type 'lessons' to begin."
`,
                permissions: '-rw-r--r--',
                size: 512,
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
            content: `Terminal Tutorial v1.0.0
Built with React Router v7, TypeScript 5.0+, and TailwindCSS v4
Interactive Unix terminal learning environment

Features:
- Progressive lessons from basics to advanced concepts
- Hands-on practice with real terminal commands
- Interactive file system for safe experimentation
- Built-in vi editor training
- Progress tracking and challenges
- Sandbox environment for free practice

Learning Path:
- 01-basics: Navigation fundamentals (ls, cd, pwd, cat)
- 02-files: File management (touch, mkdir, cp, mv, rm)
- 03-editor: Vi editor mastery (modes, editing, saving)
- 04-redirection: I/O redirection and pipes (>, >>, <)
- 05-advanced: Environment variables, .bashrc, aliases

Technical Stack:
- React Router v7 (CSR mode)
- TypeScript with strict typing
- TailwindCSS v4 with Catppuccin theme
- Comprehensive test coverage
- Safe learning environment with no system access`,
            permissions: '-r--r--r--',
            size: 896,
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
                    children: createManualPages('tutorial'),
                  },
                },
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
              'tutorial.log': {
                name: 'tutorial.log',
                type: 'file',
                content: `[2024-01-01 10:00:00] Tutorial mode initialized
[2024-01-01 10:00:01] Learning environment ready
[2024-01-01 10:00:02] All lessons and exercises loaded
[2024-01-01 10:00:03] Sandbox environment prepared
[2024-01-01 10:00:04] Tutorial ready for interactive learning`,
                permissions: '-rw-r--r--',
                size: 256,
                createdAt: new Date(),
                modifiedAt: new Date(),
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
          '.tutorial_admin.md': {
            name: '.tutorial_admin.md',
            type: 'file',
            content: `# Tutorial Administration

This tutorial provides a comprehensive learning environment for Unix terminal commands.

## Lesson Structure
1. **01-basics**: Navigation fundamentals (ls, cd, pwd, cat)
2. **02-creation**: File and directory creation (touch, mkdir)
3. **03-management**: File operations (cp, mv, rm)
4. **04-editor**: Vi editor training (modes, editing, saving)
5. **05-reading**: File reading and paging (cat, head, tail, less)
6. **06-search**: Text search and filtering (grep, find)
7. **07-redirections**: Environment variables and aliases (export, alias)
8. **08-pipes-chaining**: Pipes and command chaining (|, &&, ||, ;)

## Safety Features
- Isolated learning environment
- No system access or modification
- Safe file operations within tutorial filesystem
- Progress tracking without external dependencies

## Learning Objectives
- Master essential Unix commands for navigation and file operations
- Understand file system navigation and directory structure
- Learn text editing with vi and modal editing concepts
- Practice file reading, searching, and text filtering techniques
- Configure shell environment with variables and aliases
- Master pipes and command chaining for powerful workflows

Built for interactive, hands-on learning! 🎓`,
            permissions: '-rw-------',
            size: 768,
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
 * @param mode - The filesystem mode ('default', 'portfolio', or 'tutorial')
 * @returns The complete filesystem structure for the specified mode
 */
export function getFilesystemByMode(mode: FilesystemMode = 'default'): FileSystemNode {
  switch (mode) {
    case 'portfolio':
      return createPortfolioFilesystem();
    case 'tutorial':
      return createTutorialFilesystem();
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
export const FILESYSTEM_MODES = ['default', 'portfolio', 'tutorial'] as const;
export type FilesystemMode = (typeof FILESYSTEM_MODES)[number];
