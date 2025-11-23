export interface Project {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly tech: ReadonlyArray<string>;
  readonly image: string;
  readonly demoUrl: string;
  readonly repoUrl: string;
  readonly role: string;
  readonly duration: string;
  readonly impact: string;
  readonly notes: ReadonlyArray<string>;
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
  readonly role?: string;
  readonly degree?: string;
  readonly institution?: string;
  readonly description?: string;
}

export interface EducationEntry {
  readonly year: string;
  readonly degree: string;
  readonly institution: string;
  readonly score?: string;
  readonly description?: string;
}

export interface CompetitiveExamResult {
  readonly exam: string;
  readonly year: string;
  readonly percentile?: string;
  readonly score?: string;
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
  readonly education?: ReadonlyArray<EducationEntry>;
  readonly competitiveExams?: ReadonlyArray<CompetitiveExamResult>;
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

export interface Blog {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly author: string;
  readonly date: string;
  readonly image: string;
  readonly tags: ReadonlyArray<string>;
  readonly readTime: number; // in minutes
}

export interface BlogSummary {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly author: string;
  readonly date: string;
  readonly image: string;
  readonly tags: ReadonlyArray<string>;
  readonly readTime: number; // in minutes
}

export interface BlogsContent {
  readonly blogs: ReadonlyArray<BlogSummary>;
}
