export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: Record<string, FileSystemNode>;
  permissions?: string;
  size?: number;
  createdAt: Date;
  modifiedAt: Date;
}

export interface FileSystemState {
  root: FileSystemNode;
  currentPath: string[];
}

export interface CommandResult {
  success: boolean;
  output: string | OutputSegment[];
  error?: string;
  exitCode: number;
}

export interface OutputSegment {
  text: string;
  type?:
    | 'directory'
    | 'file'
    | 'normal'
    | 'header-1'
    | 'header-2'
    | 'header-3'
    | 'header-symbol'
    | 'bold'
    | 'italic'
    | 'inline-code'
    | 'code-block'
    | 'code-block-border'
    | 'link'
    | 'blockquote'
    | 'blockquote-symbol'
    | 'list-bullet'
    | 'list-number'
    | 'hr'
    | 'user'
    | 'separator'
    | 'host'
    | 'path'
    | 'prompt-symbol'
    | 'command';
  url?: string;
}

export interface TerminalState {
  currentInput: string;
  output: string[];
  filesystem: FileSystemState;
  aliasManager: import('~/routes/terminal/utils/aliasManager').AliasManager;
  environmentManager: import('~/routes/terminal/utils/environmentManager').EnvironmentManager;
  lastExitCode: number;
}

export type Command =
  | 'cd'
  | 'ls'
  | 'touch'
  | 'cat'
  | 'mkdir'
  | 'rm'
  | 'rmdir'
  | 'pwd'
  | 'echo'
  | 'wc'
  | 'clear'
  | 'help'
  | 'vi'
  | 'reset-fs'
  | 'storage-info'
  | 'alias'
  | 'unalias'
  | 'source'
  | 'export'
  | 'env'
  | 'unset';

export interface CommandHandler {
  (
    args: string[],
    filesystem: FileSystemState,
    aliasManager?: import('~/routes/terminal/utils/aliasManager').AliasManager,
    currentMode?: import('~/constants/defaultFilesystems').FilesystemMode,
    lastExitCode?: number,
    environmentManager?: import('~/routes/terminal/utils/environmentManager').EnvironmentManager,
  ): CommandResult;
}
