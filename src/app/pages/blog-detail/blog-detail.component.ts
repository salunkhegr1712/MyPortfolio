import { ChangeDetectionStrategy, Component, inject, signal, AfterViewInit, PLATFORM_ID, Inject, HostListener } from '@angular/core';
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
    // No initialization needed for copy function as we use event delegation
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

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const button = target.closest('.copy-btn') as HTMLElement;
    
    if (button) {
      const codeId = button.getAttribute('data-target-id');
      if (codeId) {
        this.copyCode(codeId, button);
      }
    }
  }

  private copyCode(codeId: string, button: HTMLElement): void {
    const codeElement = document.getElementById(codeId);
    if (!codeElement) return;

    const text = codeElement.textContent || '';
    
    navigator.clipboard.writeText(text).then(() => {
      const copyText = button.querySelector('.copy-text');
      const svg = button.querySelector('svg');
      
      if (copyText) {
        copyText.textContent = 'Copied!';
        copyText.classList.add('text-emerald-400');
        copyText.classList.remove('text-slate-400');
      }

      if (svg) {
        svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />';
        svg.classList.add('text-emerald-400');
        svg.classList.remove('text-slate-400');
      }

      setTimeout(() => {
        if (copyText) {
          copyText.textContent = 'Copy';
          copyText.classList.remove('text-emerald-400');
          copyText.classList.add('text-slate-400');
        }
        if (svg) {
          svg.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />';
          svg.classList.remove('text-emerald-400');
          svg.classList.add('text-slate-400');
        }
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  }
}
