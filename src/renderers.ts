import type { LoadedSkill, Target } from "./types.js";

function quoteYaml(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function renderSkillFrontmatter(skill: LoadedSkill): string {
  return [
    "---",
    `name: ${skill.name}`,
    `description: ${skill.description}`,
    "---",
  ].join("\n");
}

export function renderClaudeSkill(skill: LoadedSkill): string {
  return `${renderSkillFrontmatter(skill)}\n\n${skill.body.trim()}\n`;
}

export function renderCursorSkill(skill: LoadedSkill): string {
  return `${renderSkillFrontmatter(skill)}\n\n${skill.body.trim()}\n`;
}

export function renderCopilotPrompt(skill: LoadedSkill): string {
  return [
    "---",
    `agent: ${quoteYaml(skill.copilotAgent)}`,
    `description: ${quoteYaml(skill.description)}`,
    "---",
    "",
    skill.body.trim(),
    "",
  ].join("\n");
}

export function renderTargetFile(skill: LoadedSkill, target: Target): string {
  switch (target) {
    case "claude":
      return renderClaudeSkill(skill);
    case "cursor":
      return renderCursorSkill(skill);
    case "copilot":
      return renderCopilotPrompt(skill);
    default: {
      const unreachableTarget: never = target;
      throw new Error(`Unsupported target: ${unreachableTarget}`);
    }
  }
}
