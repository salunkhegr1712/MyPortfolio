import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

export interface TimelineEntry {
  year: string;
  role: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  @Input() name = 'Ghanasham Salunkhe';
  @Input() bio = 'Experienced Backend Engineer and Data Engineer specializing in building scalable data pipelines and microservices architectures. Passionate about leveraging cloud technologies and big data frameworks to solve complex business problems.';
  @Input() resumePath = '/assets/resume.pdf';
  @Input() headshot = ''; // Optional headshot image

  technologies: string[] = [
    'Java',
    'Spring Boot',
    'Apache Spark',
    'Databricks',
    'Azure',
    'Python',
    'TypeScript',
    'Docker',
    'Kubernetes',
    'Kafka'
  ];

  timeline: TimelineEntry[] = [
    {
      year: '2023 - Present',
      role: 'Senior Data Engineer',
      description: 'Leading data pipeline development using Spark and Azure Databricks for enterprise-scale analytics.'
    },
    {
      year: '2021 - 2023',
      role: 'Backend Engineer',
      description: 'Designed and implemented microservices architecture using Spring Boot and event-driven patterns.'
    },
    {
      year: '2019 - 2021',
      role: 'Software Developer',
      description: 'Developed full-stack applications and contributed to cloud migration initiatives.'
    },
    {
      year: '2017 - 2019',
      role: 'Junior Developer',
      description: 'Started career building REST APIs and learning distributed systems fundamentals.'
    }
  ];

  // Check if resume file exists (simplified check)
  get hasResume(): boolean {
    return Boolean(this.resumePath);
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
