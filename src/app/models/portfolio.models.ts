export interface Project {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly tech: ReadonlyArray<string>;
  readonly image?: string;
  readonly demoUrl?: string;
  readonly repoUrl?: string;
}

export interface Skill {
  readonly name: string;
  readonly level: number; // 0-100 scale
}

export interface SkillCategory {
  readonly name: string;
  readonly skills: ReadonlyArray<Skill>;
}

export interface TimelineEntry {
  readonly year: string;
  readonly role: string;
  readonly description: string;
}

export interface AlternateContact {
  readonly type: string;
  readonly value: string;
  readonly href: string;
  readonly icon: string;
}

export interface AboutContent {
  readonly name: string;
  readonly bio: string;
  readonly resumePath: string;
  readonly headshot: string;
  readonly technologies: ReadonlyArray<string>;
  readonly timeline: ReadonlyArray<TimelineEntry>;
}

export interface ProjectsContent {
  readonly projects: ReadonlyArray<Project>;
}

export interface SkillsContent {
  readonly categories: ReadonlyArray<SkillCategory>;
}

export interface ContactContent {
  readonly alternateContacts: ReadonlyArray<AlternateContact>;
}
