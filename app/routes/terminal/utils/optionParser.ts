export interface ParsedOptions {
  flags: Set<string>;
  positionalArgs: string[];
}

export function parseOptions(args: string[]): ParsedOptions {
  const flags = new Set<string>();
  const positionalArgs: string[] = [];

  for (const arg of args) {
    if (arg.startsWith('-') && arg.length > 1) {
      if (arg.startsWith('--')) {
        // Long option like --help
        flags.add(arg.slice(2));
      } else {
        // Short option(s) like -a or -la
        const shortFlags = arg.slice(1);
        for (const flag of shortFlags) {
          flags.add(flag);
        }
      }
    } else {
      positionalArgs.push(arg);
    }
  }

  return { flags, positionalArgs };
}
