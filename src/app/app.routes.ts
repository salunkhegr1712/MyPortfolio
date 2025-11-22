import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  { path: 'home', component: ProfileComponent, pathMatch: 'full' },
  { path: 'projects', loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent) },
  { path: 'skills', loadComponent: () => import('./pages/skills/skills.component').then(m => m.SkillsComponent) },
  { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) },
  { path: '**', redirectTo: '/home' }
];
