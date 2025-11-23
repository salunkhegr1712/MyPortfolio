import { Routes } from '@angular/router';

export const routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
    title: 'Home | Ghanasham Salunkhe'
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
    title: 'Projects | Ghanasham Salunkhe'
  },
  {
    path: 'skills',
    loadComponent: () => import('./pages/skills/skills.component').then(m => m.SkillsComponent),
    title: 'Skills | Ghanasham Salunkhe'
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'About | Ghanasham Salunkhe'
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contact | Ghanasham Salunkhe'
  },
  { path: '**', redirectTo: 'home' }
] satisfies Routes;
