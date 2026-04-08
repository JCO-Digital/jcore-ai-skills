export const TARGETS = ["claude", "cursor", "copilot"] as const;

export type Target = (typeof TARGETS)[number];

export type CopilotAgent = "agent" | "ask" | "edit";

export interface SkillFrontmatter {
  name: string;
  title: string;
  description: string;
  targets?: Target[];
  copilot?: {
    agent?: CopilotAgent;
  };
}

export interface LoadedSkill {
  name: string;
  title: string;
  description: string;
  targets: Target[];
  copilotAgent: CopilotAgent;
  body: string;
  sourceDirectory: string;
  supportFiles: string[];
}
