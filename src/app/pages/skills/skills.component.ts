import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SkillCategory } from '../../models/portfolio.models';
import { ContentService } from '../../content/content.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkillsComponent {
  private readonly contentService = inject(ContentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private _skills: ReadonlyArray<SkillCategory> = [];
  private hasInputOverride = false;
  private latestContentSkills: ReadonlyArray<SkillCategory> = [];

  selectedCategory: string | null = null;

  constructor() {
    this.contentService
      .getSkillsContent()
      .pipe(takeUntilDestroyed())
      .subscribe(({ categories }) => {
        this.latestContentSkills = categories ?? [];
        if (!this.hasInputOverride) {
          this.setSkills(this.latestContentSkills);
          this.cdr.markForCheck();
        }
      });
  }

  @Input()
  set skills(value: ReadonlyArray<SkillCategory> | null) {
    if (value && value.length) {
      this.hasInputOverride = true;
      this.setSkills(value);
      return;
    }

    this.hasInputOverride = false;
    this.setSkills(this.latestContentSkills);
  }

  get skills(): ReadonlyArray<SkillCategory> {
    return this._skills;
  }

  // Select a category
  selectCategory(categoryName: string): void {
    this.selectedCategory = this.selectedCategory === categoryName ? null : categoryName;
  }

  // Check if category is selected
  isCategorySelected(categoryName: string): boolean {
    return this.selectedCategory === categoryName || this.selectedCategory === null;
  }

  // Export skills as JSON file
  exportSkills(): void {
    const dataStr = JSON.stringify(this.skills, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'skills.json';
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  }

  // Track by function for ngFor performance
  trackByCategoryName(index: number, category: SkillCategory): string {
    return category.name;
  }

  trackBySkillName(index: number, skill: SkillCategory['skills'][number]): string {
    return skill.name;
  }

  private setSkills(skills: ReadonlyArray<SkillCategory>): void {
    this._skills = skills;
  }
}
