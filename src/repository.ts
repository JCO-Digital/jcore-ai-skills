import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import matter from "gray-matter";

import { renderTargetFile } from "./renderers.js";
import { TARGETS, type CopilotAgent, type LoadedSkill, type SkillFrontmatter, type Target } from "./types.js";

const SKILLS_DIRECTORY = "skills";
const DIST_DIRECTORY = "dist";

function isTarget(value: string): value is Target {
  return TARGETS.includes(value as Target);
}

function resolveHomePath(inputPath: string): string {
  if (inputPath === "~") {
    return os.homedir();
  }

  if (inputPath.startsWith("~/")) {
    return path.join(os.homedir(), inputPath.slice(2));
  }

  return path.resolve(inputPath);
}

function normalizeCopilotAgent(agent: string | undefined): CopilotAgent {
  if (agent === undefined) {
    return "agent";
  }

  switch (agent) {
    case "agent":
    case "ask":
    case "edit":
      return agent;
    default:
      throw new Error(`Invalid copilot agent "${agent}". Expected one of: agent, ask, edit.`);
  }
}

function validateSkillFrontmatter(data: SkillFrontmatter, directoryName: string): Omit<LoadedSkill, "body" | "sourceDirectory" | "supportFiles"> {
  if (!data.name || !/^[a-z0-9-]{1,64}$/.test(data.name)) {
    throw new Error(`Skill "${directoryName}" has an invalid name. Use lowercase letters, numbers, and hyphens only.`);
  }

  if (!data.title || !data.title.trim()) {
    throw new Error(`Skill "${directoryName}" is missing a non-empty title.`);
  }

  if (!data.description || !data.description.trim()) {
    throw new Error(`Skill "${directoryName}" is missing a non-empty description.`);
  }

  const targets = data.targets ?? [...TARGETS];

  for (const target of targets) {
    if (!isTarget(target)) {
      throw new Error(`Skill "${data.name}" uses unsupported target "${target}".`);
    }
  }

  return {
    name: data.name,
    title: data.title.trim(),
    description: data.description.trim(),
    targets,
    copilotAgent: normalizeCopilotAgent(data.copilot?.agent),
  };
}

async function listSupportFiles(skillDirectory: string): Promise<string[]> {
  const entries = await readdir(skillDirectory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name !== "skill.md")
    .map((entry) => path.join(skillDirectory, entry.name));
}

export async function loadSkills(repoRoot: string): Promise<LoadedSkill[]> {
  const skillsRoot = path.join(repoRoot, SKILLS_DIRECTORY);
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const skills: LoadedSkill[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillDirectory = path.join(skillsRoot, entry.name);
    const sourceFile = path.join(skillDirectory, "skill.md");

    try {
      await stat(sourceFile);
    } catch {
      continue;
    }

    const source = await readFile(sourceFile, "utf8");
    const parsed = matter(source);
    const frontmatter = validateSkillFrontmatter(parsed.data as SkillFrontmatter, entry.name);

    skills.push({
      ...frontmatter,
      body: parsed.content.trim(),
      sourceDirectory: skillDirectory,
      supportFiles: await listSupportFiles(skillDirectory),
    });
  }

  if (skills.length === 0) {
    throw new Error("No skills found. Add at least one source skill under skills/<skill-name>/skill.md.");
  }

  return skills.sort((left, right) => left.name.localeCompare(right.name));
}

async function writeTargetOutput(repoRoot: string, skill: LoadedSkill, target: Target): Promise<void> {
  let destinationDirectory: string;
  let outputFilename: string;

  switch (target) {
    case "claude":
      destinationDirectory = path.join(repoRoot, DIST_DIRECTORY, "claude", skill.name);
      outputFilename = "SKILL.md";
      break;
    case "cursor":
      destinationDirectory = path.join(repoRoot, DIST_DIRECTORY, "cursor", skill.name);
      outputFilename = "SKILL.md";
      break;
    case "copilot":
      destinationDirectory = path.join(repoRoot, DIST_DIRECTORY, "copilot", ".github", "prompts");
      outputFilename = `${skill.name}.prompt.md`;
      break;
    default: {
      const unreachableTarget: never = target;
      throw new Error(`Unsupported target: ${unreachableTarget}`);
    }
  }

  await mkdir(destinationDirectory, { recursive: true });
  await writeFile(path.join(destinationDirectory, outputFilename), renderTargetFile(skill, target), "utf8");

  if (target === "copilot") {
    return;
  }

  for (const supportFile of skill.supportFiles) {
    await cp(supportFile, path.join(destinationDirectory, path.basename(supportFile)), { force: true });
  }
}

export async function buildRepository(repoRoot: string): Promise<LoadedSkill[]> {
  const distRoot = path.join(repoRoot, DIST_DIRECTORY);
  const skills = await loadSkills(repoRoot);

  await rm(distRoot, { recursive: true, force: true });

  for (const skill of skills) {
    for (const target of skill.targets) {
      await writeTargetOutput(repoRoot, skill, target);
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    skills: skills.map((skill) => ({
      name: skill.name,
      title: skill.title,
      targets: skill.targets,
    })),
  };

  await mkdir(distRoot, { recursive: true });
  await writeFile(path.join(distRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return skills;
}

export async function installTarget(repoRoot: string, target: Target, destination?: string): Promise<string> {
  await buildRepository(repoRoot);

  let sourceDirectory: string;
  let installDirectory: string;

  switch (target) {
    case "claude":
      sourceDirectory = path.join(repoRoot, DIST_DIRECTORY, "claude");
      installDirectory = destination ? resolveHomePath(destination) : path.join(os.homedir(), ".claude", "skills");
      break;
    case "cursor":
      sourceDirectory = path.join(repoRoot, DIST_DIRECTORY, "cursor");
      installDirectory = destination ? resolveHomePath(destination) : path.join(os.homedir(), ".cursor", "skills");
      break;
    case "copilot": {
      const destinationRoot = destination ? resolveHomePath(destination) : repoRoot;
      sourceDirectory = path.join(repoRoot, DIST_DIRECTORY, "copilot", ".github", "prompts");
      installDirectory = path.join(destinationRoot, ".github", "prompts");
      break;
    }
    default: {
      const unreachableTarget: never = target;
      throw new Error(`Unsupported target: ${unreachableTarget}`);
    }
  }

  await mkdir(installDirectory, { recursive: true });
  await cp(sourceDirectory, installDirectory, { recursive: true, force: true });

  return installDirectory;
}
