import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  @Input() showRecaptchaStub = false;

  formData: ContactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  errors: FormErrors = {};
  submitted = false;
  showSuccess = false;

  alternateContacts = [
    {
      type: 'Email',
      value: 'ghanasham@example.com',
      href: 'mailto:ghanasham@example.com',
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
      type: 'LinkedIn',
      value: 'linkedin.com/in/ghanasham',
      href: 'https://linkedin.com/in/ghanasham',
      icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z'
    },
    {
      type: 'GitHub',
      value: 'github.com/ghanasham',
      href: 'https://github.com/ghanasham',
      icon: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
    }
  ];

  // Validate single field
  validateField(field: keyof ContactForm): void {
    this.errors[field] = undefined;

    const value = this.formData[field].trim();

    if (!value) {
      this.errors[field] = `${this.capitalizeFirst(field)} is required`;
      return;
    }

    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.errors[field] = 'Please enter a valid email address';
      }
    }

    if (field === 'message' && value.length < 10) {
      this.errors[field] = 'Message must be at least 10 characters';
    }
  }

  // Validate entire form
  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    (Object.keys(this.formData) as Array<keyof ContactForm>).forEach(field => {
      this.validateField(field);
      if (this.errors[field]) {
        isValid = false;
      }
    });

    return isValid;
  }

  // Submit form
  submitContact(event: Event): void {
    event.preventDefault();
    this.submitted = true;

    if (!this.validateForm()) {
      return;
    }

    // Placeholder submission logic (logs to console)
    console.log('Form submitted:', this.formData);

    // Show success message
    this.showSuccess = true;

    // Reset form
    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    this.submitted = false;

    // Hide success message after 5 seconds
    setTimeout(() => {
      this.showSuccess = false;
    }, 5000);
  }

  // Helper: capitalize first letter
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Track by function for ngFor
  trackByType(index: number, contact: any): string {
    return contact.type;
  }
}
