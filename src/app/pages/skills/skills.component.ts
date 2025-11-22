import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

export interface Skill {
  name: string;
  level: number; // 0-100
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss'
})
export class SkillsComponent {
  @Input() skills: SkillCategory[] = [
    {
      name: 'Backend Development',
      skills: [
        { name: 'Java', level: 90 },
        { name: 'Spring Boot', level: 85 },
        { name: 'Python', level: 80 },
        { name: 'Node.js', level: 75 }
      ]
    },
    {
      name: 'Big Data & Cloud',
      skills: [
        { name: 'Apache Spark', level: 85 },
        { name: 'Databricks', level: 80 },
        { name: 'Azure', level: 75 },
        { name: 'Kafka', level: 70 }
      ]
    },
    {
      name: 'DevOps & Tools',
      skills: [
        { name: 'Docker', level: 80 },
        { name: 'Kubernetes', level: 70 },
        { name: 'Git', level: 90 },
        { name: 'CI/CD', level: 75 }
      ]
    },
    {
      name: 'Frontend & Languages',
      skills: [
        { name: 'TypeScript', level: 85 },
        { name: 'Angular', level: 80 },
        { name: 'SQL', level: 85 },
        { name: 'NoSQL', level: 75 }
      ]
    }
  ];

  selectedCategory: string | null = null;

  // Select a category
  selectCategory(categoryName: string): void {
    this.selectedCategory = this.selectedCategory === categoryName ? null : categoryName;
  }

  // Check if category is selected
  isCategorySelected(categoryName: string): boolean {
    return this.selectedCategory === categoryName || this.selectedCategory === null;
  }

  // Export skills as JSON file
  exportSkills(): void {
    const dataStr = JSON.stringify(this.skills, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'skills.json';
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  }

  // Track by function for ngFor performance
  trackByCategoryName(index: number, category: SkillCategory): string {
    return category.name;
  }

  trackBySkillName(index: number, skill: Skill): string {
    return skill.name;
  }
}
