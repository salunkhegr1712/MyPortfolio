import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Project } from '../../models/portfolio.models';
import { ContentService } from '../../content/content.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsComponent {
  private readonly contentService = inject(ContentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private _projects: ReadonlyArray<Project> = [];
  private hasInputOverride = false;
  private latestContentProjects: ReadonlyArray<Project> = [];

  allTechTags: ReadonlyArray<string> = [];
  filteredProjects: ReadonlyArray<Project> = [];
  selectedTech: string | null = null;

  constructor() {
    this.contentService
      .getProjectsContent()
      .pipe(takeUntilDestroyed())
      .subscribe(({ projects }) => {
        this.latestContentProjects = projects ?? [];
        if (!this.hasInputOverride) {
          this.setProjects(this.latestContentProjects);
          this.cdr.markForCheck();
        }
      });
  }

  @Input()
  set projects(projects: ReadonlyArray<Project> | null) {
    if (projects && projects.length) {
      this.hasInputOverride = true;
      this.setProjects(projects);
      return;
    }

    this.hasInputOverride = false;
    this.setProjects(this.latestContentProjects);
  }

  get projects(): ReadonlyArray<Project> {
    return this._projects;
  }

  toggleTechFilter(tech: string): void {
    this.selectedTech = this.selectedTech === tech ? null : tech;
    this.applyFilter();
  }

  clearTechFilter(): void {
    this.selectedTech = null;
    this.applyFilter();
  }

  isTechSelected(tech: string): boolean {
    return this.selectedTech === tech;
  }

  trackByProjectId(_: number, project: Project): string {
    return project.id;
  }

  trackByTechTag(_: number, tech: string): string {
    return tech;
  }

  private applyFilter(): void {
    this.filteredProjects = this.selectedTech
      ? this._projects.filter(project => project.tech.includes(this.selectedTech!))
      : this._projects;
  }

  private computeAllTechTags(projects: ReadonlyArray<Project>): ReadonlyArray<string> {
    const techSet = new Set<string>();
    projects.forEach(project => project.tech.forEach(tag => techSet.add(tag)));
    return Array.from(techSet).sort();
  }

  private setProjects(projects: ReadonlyArray<Project>): void {
    this._projects = projects;
    this.allTechTags = this.computeAllTechTags(projects);
    this.applyFilter();
  }
}
