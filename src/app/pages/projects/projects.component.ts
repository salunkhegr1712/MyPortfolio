import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

export interface Project {
  id: string;
  title: string;
  summary: string;
  tech: string[];
  image?: string;
  demoUrl?: string;
  repoUrl?: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  @Input() projects: Project[] = [
    {
      id: '1',
      title: 'Data Pipeline Orchestrator',
      summary: 'Scalable ETL pipeline using Apache Spark and Azure Databricks',
      tech: ['Spark', 'Azure', 'Python', 'Databricks'],
      image: '',
      demoUrl: 'https://example.com/demo1',
      repoUrl: 'https://github.com/example/project1'
    },
    {
      id: '2',
      title: 'Microservices Platform',
      summary: 'Spring Boot microservices with Kafka event streaming',
      tech: ['Java', 'Spring Boot', 'Kafka', 'Docker'],
      image: '',
      demoUrl: '',
      repoUrl: 'https://github.com/example/project2'
    },
    {
      id: '3',
      title: 'Real-time Analytics Dashboard',
      summary: 'Real-time data visualization with streaming analytics',
      tech: ['Angular', 'TypeScript', 'WebSocket', 'D3.js'],
      image: '',
      demoUrl: 'https://example.com/demo3',
      repoUrl: 'https://github.com/example/project3'
    }
  ];

  selectedTech: string | null = null;
  
  // Get unique tech tags from all projects
  get allTechTags(): string[] {
    const techSet = new Set<string>();
    this.projects.forEach(project => {
      project.tech.forEach(tech => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }

  // Filter projects by selected tech
  get filteredProjects(): Project[] {
    if (!this.selectedTech) {
      return this.projects;
    }
    return this.projects.filter(project => 
      project.tech.includes(this.selectedTech!)
    );
  }

  // Toggle tech filter
  toggleTechFilter(tech: string): void {
    this.selectedTech = this.selectedTech === tech ? null : tech;
  }

  // Check if tech is selected
  isTechSelected(tech: string): boolean {
    return this.selectedTech === tech;
  }

  // Track by function for ngFor performance
  trackByProjectId(index: number, project: Project): string {
    return project.id;
  }
}
