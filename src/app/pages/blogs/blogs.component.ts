import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { BlogSummary } from '../../models/portfolio.models';
import { ContentService } from '../../content/content.service';
import { PatternsDirective } from '../../patterns.directive';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterModule, PatternsDirective],
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogsComponent {
  private readonly contentService = inject(ContentService);
  
  blogs$ = this.contentService.getBlogsContent();

  trackByBlogId(_: number, blog: BlogSummary): string {
    return blog.id;
  }
}
