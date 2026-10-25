// Provider registry - monsmain build: only the providers this install serves.
import opencode from "./opencode.js";
import opencodeConsole from "./opencode-console.js";
import opencodeGo from "./opencode-go.js";
import nvidia from "./nvidia.js";

export default [
  opencode,
  opencodeConsole,
  opencodeGo,
  nvidia,
];
