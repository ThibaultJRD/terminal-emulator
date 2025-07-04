import type { Route } from "./+types/home";
import { Terminal } from "../components/Terminal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Terminal Emulator" },
    { name: "description", content: "A web-based terminal emulator with Catppuccin theme" },
  ];
}

export default function Home() {
  return <Terminal />;
}
