import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map } from 'rxjs';
import {
  AboutContent,
  ContactContent,
  ProjectsContent,
  SkillsContent,
  BlogsContent,
  Blog,
} from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  private readonly aboutContent$ = this.loadJson<AboutContent>('assets/content/about.json');
  private readonly projectsContent$ = this.loadJson<ProjectsContent>('assets/content/projects.json');
  private readonly skillsContent$ = this.loadJson<SkillsContent>('assets/content/skills.json');
  private readonly contactContent$ = this.loadJson<ContactContent>('assets/content/contact.json');
  private readonly blogsContent$ = this.loadJson<BlogsContent>('assets/blogs/index.json').pipe(
    map(content => ({
      ...content,
      blogs: [...content.blogs].sort((a, b) => this.compareDatesDesc(a.date, b.date))
    }))
  );

  getAboutContent(): Observable<AboutContent> {
    return this.aboutContent$;
  }

  getProjectsContent(): Observable<ProjectsContent> {
    return this.projectsContent$;
  }

  getSkillsContent(): Observable<SkillsContent> {
    return this.skillsContent$;
  }

  getContactContent(): Observable<ContactContent> {
    return this.contactContent$;
  }

  getBlogsContent(): Observable<BlogsContent> {
    return this.blogsContent$;
  }

  getBlogById(id: string): Observable<Blog> {
    return this.loadJson<Blog>(`assets/blogs/${id}.json`);
  }

  private loadJson<T>(path: string): Observable<T> {
    return this.http.get<T>(path).pipe(shareReplay(1));
  }

  private compareDatesDesc(dateA: string, dateB: string): number {
    const toTime = (value: string) => {
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    return toTime(dateB) - toTime(dateA);
  }
}
