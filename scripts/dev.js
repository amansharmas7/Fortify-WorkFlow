import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apiPath = path.join(rootDir, "server", "index.js");
const vitePath = path.join(rootDir, "node_modules", "vite", "bin", "vite.js");
const children = new Set();
let stopping = false;

function stopAll(exitCode) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

function start(label, script, args = []) {
  const child = spawn(process.execPath, [script, ...args], {
    cwd: rootDir,
    env: process.env,
    stdio: "inherit",
  });
  children.add(child);
  child.on("error", (error) => {
    process.stderr.write(label + " failed to start: " + error.message + "\n");
    stopAll(1);
  });
  child.on("exit", (code) => {
    children.delete(child);
    if (!stopping) {
      process.stderr.write(label + " stopped; shutting down the other development process.\n");
      stopAll(code || 1);
    }
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

start("Gemini API", apiPath);
start("Vite frontend", vitePath, ["--port=3000", "--host=0.0.0.0"]);
