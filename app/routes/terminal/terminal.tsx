import type { Route } from "./+types/terminal";
import { Terminal } from "~/routes/terminal/components/Terminal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terminal Emulator" },
    {
      name: "description",
      content: "A web-based terminal emulator with Catppuccin theme",
    },
  ];
}

export default function TerminalScreen() {
  return <Terminal />;
}
