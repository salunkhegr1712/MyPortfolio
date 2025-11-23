import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { TimelineEntry } from '../../models/portfolio.models';
import { ContentService } from '../../content/content.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private readonly cdr = inject(ChangeDetectorRef);

  private nameOverride = false;
  private bioOverride = false;
  private resumeOverride = false;
  private headshotOverride = false;

  private _name = '';
  private _bio = '';
  private _resumePath = '';
  private _headshot = '';

  technologies: ReadonlyArray<string> = [];
  timeline: ReadonlyArray<TimelineEntry> = [];

  constructor() {
    this.contentService
      .getAboutContent()
      .pipe(takeUntilDestroyed())
      .subscribe((content) => {
        if (!this.nameOverride) {
          this._name = content.name;
        }
        if (!this.bioOverride) {
          this._bio = content.bio;
        }
        if (!this.resumeOverride) {
          this._resumePath = content.resumePath;
        }
        if (!this.headshotOverride) {
          this._headshot = content.headshot;
        }

        this.technologies = content.technologies ?? [];
        this.timeline = content.timeline ?? [];
        this.cdr.markForCheck();
      });
  }

  @Input()
  set name(value: string) {
    this.nameOverride = true;
    this._name = value ?? '';
  }

  get name(): string {
    return this._name;
  }

  @Input()
  set bio(value: string) {
    this.bioOverride = true;
    this._bio = value ?? '';
  }

  get bio(): string {
    return this._bio;
  }

  @Input()
  set resumePath(value: string) {
    this.resumeOverride = true;
    this._resumePath = value ?? '';
  }

  get resumePath(): string {
    return this._resumePath;
  }

  @Input()
  set headshot(value: string) {
    this.headshotOverride = true;
    this._headshot = value ?? '';
  }

  get headshot(): string {
    return this._headshot;
  }

  // Check if resume file exists (simplified check)
  get hasResume(): boolean {
    return Boolean(this._resumePath);
  }

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
}
