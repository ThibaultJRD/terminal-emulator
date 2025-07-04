export interface FileSystemNode {
  name: string;
  type: "file" | "directory";
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
}

export interface OutputSegment {
  text: string;
  type?: "directory" | "file" | "normal" | "header-1" | "header-2" | "header-3" | "header-symbol" 
       | "bold" | "italic" | "inline-code" | "code-block" | "code-block-border" | "link" 
       | "blockquote" | "blockquote-symbol" | "list-bullet" | "list-number" | "hr";
}

export interface TerminalState {
  history: string[];
  historyIndex: number;
  currentInput: string;
  output: string[];
  filesystem: FileSystemState;
}

export type Command =
  | "cd"
  | "ls"
  | "touch"
  | "cat"
  | "mkdir"
  | "rm"
  | "rmdir"
  | "pwd"
  | "echo"
  | "wc"
  | "clear"
  | "help";

export interface CommandHandler {
  (args: string[], filesystem: FileSystemState): CommandResult;
}

