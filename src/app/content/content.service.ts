import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import {
  AboutContent,
  ContactContent,
  ProjectsContent,
  SkillsContent,
} from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  private readonly aboutContent$ = this.loadJson<AboutContent>('assets/content/about.json');
  private readonly projectsContent$ = this.loadJson<ProjectsContent>('assets/content/projects.json');
  private readonly skillsContent$ = this.loadJson<SkillsContent>('assets/content/skills.json');
  private readonly contactContent$ = this.loadJson<ContactContent>('assets/content/contact.json');

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

  private loadJson<T>(path: string): Observable<T> {
    return this.http.get<T>(path).pipe(shareReplay(1));
  }
}
