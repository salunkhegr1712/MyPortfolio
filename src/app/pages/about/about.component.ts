import { ChangeDetectionStrategy, Component, Input, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CompetitiveExamResult, EducationEntry, TimelineEntry } from '../../models/portfolio.models';
import { ContentService } from '../../content/content.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AboutComponent {
  private readonly contentService = inject(ContentService);

  readonly aboutContent = toSignal(this.contentService.getAboutContent(), {
    initialValue: undefined
  });

  constructor() {
    // Debug: Check if data is loading
    setTimeout(() => {
      console.log('About Content:', this.aboutContent());
      console.log('Name:', this.name());
      console.log('Bio:', this.bio());
    }, 1000);
  }

  private readonly nameOverride = signal<string | null>(null);
  private readonly bioOverride = signal<string | null>(null);
  private readonly resumePathOverride = signal<string | null>(null);
  private readonly headshotOverride = signal<string | null>(null);

  readonly name = computed(() => {
    const override = this.nameOverride();
    if (override) return override;
    const content = this.aboutContent();
    return content?.name ?? '';
  });
  
  readonly bio = computed(() => {
    const override = this.bioOverride();
    if (override) return override;
    const content = this.aboutContent();
    return content?.bio ?? '';
  });
  
  readonly resumePath = computed(() => {
    const override = this.resumePathOverride();
    if (override) return override;
    const content = this.aboutContent();
    return content?.resumePath ?? '';
  });
  
  readonly headshot = computed(() => {
    const override = this.headshotOverride();
    if (override) return override;
    const content = this.aboutContent();
    return content?.headshot ?? '';
  });

  @Input()
  set nameInput(value: string) {
    this.nameOverride.set(value ?? '');
  }

  @Input()
  set bioInput(value: string) {
    this.bioOverride.set(value ?? '');
  }

  @Input()
  set resumePathInput(value: string) {
    this.resumePathOverride.set(value ?? '');
  }

  @Input()
  set headshotInput(value: string) {
    this.headshotOverride.set(value ?? '');
  }

  readonly hasResume = computed(() => Boolean(this.resumePath()));

  readonly technologies = computed(() => {
    const content = this.aboutContent();
    return content?.technologies ?? [];
  });
  
  readonly timeline = computed(() => {
    const content = this.aboutContent();
    return content?.timeline ?? [];
  });
  
  readonly education = computed(() => {
    const content = this.aboutContent();
    return content?.education ?? [];
  });
  
  readonly competitiveExams = computed(() => {
    const content = this.aboutContent();
    return content?.competitiveExams ?? [];
  });

  // Scroll to contact section
  scrollToContact(): void {
    // Simple scroll to contact section if it exists on page
    const contactElement = document.getElementById('contact-section');
    if (contactElement) {
      contactElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to contact route if separate page
      window.location.href = '/contact';
    }
  }

  // Track by function for ngFor performance
  trackByYear(index: number, entry: TimelineEntry): string {
    return entry.year;
  }

  trackByTech(index: number, tech: string): string {
    return tech;
  }

  trackByEducation(index: number, entry: EducationEntry): string {
    return `${entry.year}-${entry.degree}`;
  }

  trackByExam(index: number, exam: CompetitiveExamResult): string {
    return `${exam.exam}-${exam.year}`;
  }
}
