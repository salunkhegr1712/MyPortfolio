import { ChangeDetectionStrategy, Component, inject, signal, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { Blog } from '../../models/portfolio.models';
import { ContentService } from '../../content/content.service';
import { PatternsDirective } from '../../patterns.directive';
import { FormatBlogContentPipe } from '../../shared/format-blog-content.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, PatternsDirective, FormatBlogContentPipe],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogDetailComponent implements AfterViewInit {
  private readonly contentService = inject(ContentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  blog = signal<Blog | null>(null);
  notFound = signal(false);

  constructor() {
    this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        takeUntilDestroyed()
      )
      .subscribe(blogId => {
        if (blogId) {
          this.loadBlog(blogId);
        }
      });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupCopyFunction();
    }
  }

  private loadBlog(blogId: string): void {
    this.contentService.getBlogById(blogId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (blog) => {
          this.blog.set(blog);
          this.notFound.set(false);
        },
        error: () => {
          this.blog.set(null);
          this.notFound.set(true);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/blogs']);
  }

  private setupCopyFunction(): void {
    (window as any).copyCode = (codeId: string) => {
      const codeElement = document.getElementById(codeId);
      if (!codeElement) return;

      const rawCode = codeElement.getAttribute('data-raw');
      if (!rawCode) return;

      // Decode HTML entities
      const textarea = document.createElement('textarea');
      textarea.innerHTML = rawCode;
      const decodedCode = textarea.value;

      // Copy to clipboard
      navigator.clipboard.writeText(decodedCode).then(() => {
        // Find the button and update its text
        const codeBlock = document.querySelector(`[data-code-id="${codeId}"]`);
        if (codeBlock) {
          const button = codeBlock.querySelector('.copy-btn');
          const copyText = button?.querySelector('.copy-text');
          if (copyText) {
            const originalText = copyText.textContent;
            copyText.textContent = 'Copied!';
            setTimeout(() => {
              copyText.textContent = originalText;
            }, 2000);
          }
        }
      }).catch(err => {
        console.error('Failed to copy code:', err);
      });
    };
  }
}
