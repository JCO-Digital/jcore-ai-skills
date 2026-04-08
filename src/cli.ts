import path from "node:path";

import { buildRepository, installTarget } from "./repository.js";
import { TARGETS, type Target } from "./types.js";

function isTarget(value: string): value is Target {
  return TARGETS.includes(value as Target);
}

function printHelp(): void {
  console.log(`jcore-ai-skills

Usage:
  npm run build
  npm run install:claude
  npm run install:cursor
  npm run install:copilot -- --dest /path/to/target-repo

Direct CLI:
  tsx src/cli.ts build
  tsx src/cli.ts install --target claude
  tsx src/cli.ts install --target cursor
  tsx src/cli.ts install --target copilot --dest /path/to/target-repo
`);
}

function parseInstallOptions(argumentsList: string[]): { target: Target; dest?: string } {
  let target: Target | undefined;
  let dest: string | undefined;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];

    switch (argument) {
      case "--target": {
        const nextValue = argumentsList[index + 1];

        if (!nextValue || !isTarget(nextValue)) {
          throw new Error(`--target must be one of: ${TARGETS.join(", ")}`);
        }

        target = nextValue;
        index += 1;
        break;
      }
      case "--dest": {
        const nextValue = argumentsList[index + 1];

        if (!nextValue) {
          throw new Error("--dest requires a value.");
        }

        dest = nextValue;
        index += 1;
        break;
      }
      default:
        throw new Error(`Unknown argument "${argument}".`);
    }
  }

  if (!target) {
    throw new Error("--target is required for install.");
  }

  return { target, dest };
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  const repoRoot = process.cwd();

  switch (command) {
    case undefined:
    case "--help":
    case "-h":
      printHelp();
      return;
    case "build": {
      const skills = await buildRepository(repoRoot);
      console.log(`Built ${skills.length} skill(s) into ${path.join(repoRoot, "dist")}`);
      return;
    }
    case "install": {
      const options = parseInstallOptions(rest);
      const installDirectory = await installTarget(repoRoot, options.target, options.dest);
      console.log(`Installed ${options.target} outputs into ${installDirectory}`);
      return;
    }
    default:
      throw new Error(`Unknown command "${command}". Use --help for usage.`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exitCode = 1;
});
