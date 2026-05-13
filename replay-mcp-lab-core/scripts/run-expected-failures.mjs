import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";

const command = process.argv[2] ?? "npx";
const args = process.argv.slice(3);

if (!args.length) {
  console.error("Usage: node run-expected-failures.mjs <command> <args...>");
  process.exit(2);
}

const child = spawn(resolveCommand(command), args, {
  cwd: process.cwd(),
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("error", error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(2);
});

child.on("exit", code => {
  if (code === 0) {
    console.error("Expected at least one diagnostic failure, but the command passed.");
    process.exit(1);
  }

  console.log(`Diagnostic failure command exited with ${code}; treating this as expected.`);
  process.exit(0);
});

function resolveCommand(binary) {
  if (binary.includes("/") || binary.includes("\\")) {
    return binary;
  }

  let current = process.cwd();
  const root = parse(current).root;

  while (true) {
    const extension = process.platform === "win32" ? ".cmd" : "";
    const candidate = join(current, "node_modules", ".bin", `${binary}${extension}`);
    if (existsSync(candidate)) {
      return candidate;
    }

    if (current === root) {
      return binary;
    }

    current = dirname(current);
  }
}
