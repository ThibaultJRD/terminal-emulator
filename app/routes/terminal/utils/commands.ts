import type {
  CommandResult,
  FileSystemState,
  CommandHandler,
  OutputSegment,
} from "@/routes/terminal/types/filesystem";
import {
  getNodeAtPath,
  getCurrentDirectory,
  resolvePath,
  formatPath,
  createFile,
  createDirectory,
  deleteNode,
} from "@/routes/terminal/utils/filesystem";
import { renderMarkdown } from "@/routes/terminal/utils/markdown";

export const commands: Record<string, CommandHandler> = {
  cd: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      filesystem.currentPath = ["home", "user"];
      return { success: true, output: "" };
    }

    const targetPath = resolvePath(filesystem, args[0]);
    const targetNode = getNodeAtPath(filesystem, targetPath);

    if (!targetNode) {
      return {
        success: false,
        output: "",
        error: `cd: no such file or directory: ${args[0]}`,
      };
    }

    if (targetNode.type !== "directory") {
      return {
        success: false,
        output: "",
        error: `cd: not a directory: ${args[0]}`,
      };
    }

    filesystem.currentPath = targetPath;
    return { success: true, output: "" };
  },

  ls: (args: string[], filesystem: FileSystemState): CommandResult => {
    const showHidden = args.includes("-a");
    const showDetails = args.includes("-l");
    const pathArg = args.find((arg) => !arg.startsWith("-"));

    const targetPath = pathArg
      ? resolvePath(filesystem, pathArg)
      : filesystem.currentPath;
    const targetNode = getNodeAtPath(filesystem, targetPath);

    if (!targetNode) {
      return {
        success: false,
        output: "",
        error: `ls: cannot access '${pathArg}': No such file or directory`,
      };
    }

    if (targetNode.type === "file") {
      return { success: true, output: targetNode.name };
    }

    if (!targetNode.children) {
      return { success: true, output: "" };
    }

    const entries = Object.values(targetNode.children)
      .filter((node) => showHidden || !node.name.startsWith("."))
      .sort((a, b) => {
        if (a.type === "directory" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "directory") return 1;
        return a.name.localeCompare(b.name);
      });

    if (showDetails) {
      const outputSegments: OutputSegment[] = [];
      entries.forEach((node, index) => {
        if (index > 0) {
          outputSegments.push({ text: "\n", type: "normal" });
        }
        const type = node.type === "directory" ? "d" : "-";
        const permissions = node.permissions || "rwxr-xr-x";
        const size = node.size || 0;
        const date = node.modifiedAt.toLocaleDateString();

        outputSegments.push({
          text: `${type}${permissions} ${size.toString().padStart(8)} ${date} `,
          type: "normal",
        });
        outputSegments.push({ text: node.name, type: node.type });
      });

      return { success: true, output: outputSegments };
    } else {
      const outputSegments: OutputSegment[] = [];
      entries.forEach((node, index) => {
        if (index > 0) {
          outputSegments.push({ text: "  ", type: "normal" });
        }
        outputSegments.push({ text: node.name, type: node.type });
      });

      return { success: true, output: outputSegments };
    }
  },

  pwd: (args: string[], filesystem: FileSystemState): CommandResult => {
    return { success: true, output: formatPath(filesystem.currentPath) };
  },

  touch: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      return {
        success: false,
        output: "",
        error: "touch: missing file operand",
      };
    }

    const filename = args[0];
    if (filename.includes("/")) {
      return {
        success: false,
        output: "",
        error: "touch: cannot create file with path separators",
      };
    }

    const currentDir = getCurrentDirectory(filesystem);
    if (
      !currentDir ||
      currentDir.type !== "directory" ||
      !currentDir.children
    ) {
      return {
        success: false,
        output: "",
        error: "touch: cannot access current directory",
      };
    }

    if (currentDir.children[filename]) {
      currentDir.children[filename].modifiedAt = new Date();
      return { success: true, output: "" };
    }

    const success = createFile(
      filesystem,
      filesystem.currentPath,
      filename,
      ""
    );
    if (!success) {
      return {
        success: false,
        output: "",
        error: `touch: cannot create '${filename}'`,
      };
    }

    return { success: true, output: "" };
  },

  cat: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      return { success: false, output: "", error: "cat: missing file operand" };
    }

    const filename = args[0];
    const currentDir = getCurrentDirectory(filesystem);
    if (
      !currentDir ||
      currentDir.type !== "directory" ||
      !currentDir.children
    ) {
      return {
        success: false,
        output: "",
        error: "cat: cannot access current directory",
      };
    }

    const file = currentDir.children[filename];
    if (!file) {
      return {
        success: false,
        output: "",
        error: `cat: ${filename}: No such file or directory`,
      };
    }

    if (file.type === "directory") {
      return {
        success: false,
        output: "",
        error: `cat: ${filename}: Is a directory`,
      };
    }

    const content = file.content || "";
    
    // Check if it's a markdown file
    if (filename.endsWith('.md')) {
      return { success: true, output: renderMarkdown(content) };
    }
    
    return { success: true, output: content };
  },

  mkdir: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      return { success: false, output: "", error: "mkdir: missing operand" };
    }

    const dirname = args[0];
    if (dirname.includes("/")) {
      return {
        success: false,
        output: "",
        error: "mkdir: cannot create directory with path separators",
      };
    }

    const currentDir = getCurrentDirectory(filesystem);
    if (
      !currentDir ||
      currentDir.type !== "directory" ||
      !currentDir.children
    ) {
      return {
        success: false,
        output: "",
        error: "mkdir: cannot access current directory",
      };
    }

    if (currentDir.children[dirname]) {
      return {
        success: false,
        output: "",
        error: `mkdir: cannot create directory '${dirname}': File exists`,
      };
    }

    const success = createDirectory(
      filesystem,
      filesystem.currentPath,
      dirname
    );
    if (!success) {
      return {
        success: false,
        output: "",
        error: `mkdir: cannot create directory '${dirname}'`,
      };
    }

    return { success: true, output: "" };
  },

  rm: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      return { success: false, output: "", error: "rm: missing operand" };
    }

    const filename = args[0];
    const currentDir = getCurrentDirectory(filesystem);
    if (
      !currentDir ||
      currentDir.type !== "directory" ||
      !currentDir.children
    ) {
      return {
        success: false,
        output: "",
        error: "rm: cannot access current directory",
      };
    }

    const file = currentDir.children[filename];
    if (!file) {
      return {
        success: false,
        output: "",
        error: `rm: cannot remove '${filename}': No such file or directory`,
      };
    }

    if (file.type === "directory") {
      return {
        success: false,
        output: "",
        error: `rm: cannot remove '${filename}': Is a directory`,
      };
    }

    const success = deleteNode(filesystem, filesystem.currentPath, filename);
    if (!success) {
      return {
        success: false,
        output: "",
        error: `rm: cannot remove '${filename}'`,
      };
    }

    return { success: true, output: "" };
  },

  rmdir: (args: string[], filesystem: FileSystemState): CommandResult => {
    if (args.length === 0) {
      return { success: false, output: "", error: "rmdir: missing operand" };
    }

    const dirname = args[0];
    const currentDir = getCurrentDirectory(filesystem);
    if (
      !currentDir ||
      currentDir.type !== "directory" ||
      !currentDir.children
    ) {
      return {
        success: false,
        output: "",
        error: "rmdir: cannot access current directory",
      };
    }

    const dir = currentDir.children[dirname];
    if (!dir) {
      return {
        success: false,
        output: "",
        error: `rmdir: failed to remove '${dirname}': No such file or directory`,
      };
    }

    if (dir.type === "file") {
      return {
        success: false,
        output: "",
        error: `rmdir: failed to remove '${dirname}': Not a directory`,
      };
    }

    if (dir.children && Object.keys(dir.children).length > 0) {
      return {
        success: false,
        output: "",
        error: `rmdir: failed to remove '${dirname}': Directory not empty`,
      };
    }

    const success = deleteNode(filesystem, filesystem.currentPath, dirname);
    if (!success) {
      return {
        success: false,
        output: "",
        error: `rmdir: failed to remove '${dirname}'`,
      };
    }

    return { success: true, output: "" };
  },

  clear: (args: string[], filesystem: FileSystemState): CommandResult => {
    return { success: true, output: "CLEAR" };
  },

  help: (args: string[], filesystem: FileSystemState): CommandResult => {
    const helpText = [
      "Available commands:",
      "  cd [dir]     - Change directory",
      "  ls [-a] [-l] - List directory contents",
      "  pwd          - Print working directory",
      "  touch <file> - Create empty file or update timestamp",
      "  cat <file>   - Display file contents",
      "  mkdir <dir>  - Create directory",
      "  rm <file>    - Remove file",
      "  rmdir <dir>  - Remove empty directory",
      "  clear        - Clear terminal",
      "  help         - Show this help message",
    ].join("\n");

    return { success: true, output: helpText };
  },
};

export function executeCommand(
  input: string,
  filesystem: FileSystemState
): CommandResult {
  const parts = input.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  if (!command) {
    return { success: true, output: "" };
  }

  const handler = commands[command];
  if (!handler) {
    return {
      success: false,
      output: "",
      error: `${command}: command not found`,
    };
  }

  return handler(args, filesystem);
}
