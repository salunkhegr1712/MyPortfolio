import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AlternateContact } from '../../models/portfolio.models';
import { ContentService } from '../../content/content.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

  alternateContacts: ReadonlyArray<AlternateContact> = [];

  private readonly contentService = inject(ContentService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private hideSuccessTimeoutId: number | undefined;

  constructor() {
    this.contentService
      .getContactContent()
      .pipe(takeUntilDestroyed())
      .subscribe(({ alternateContacts }) => {
        this.alternateContacts = alternateContacts ?? [];
        this.cdr.markForCheck();
      });

    this.destroyRef.onDestroy(() => this.clearHideSuccessTimeout());
  }

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

    this.showSuccess = true;

    this.formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    this.submitted = false;

    this.scheduleHideSuccessMessage();
    this.cdr.markForCheck();
  }

  // Helper: capitalize first letter
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Track by function for ngFor
  trackByType(index: number, contact: AlternateContact): string {
    return contact.type;
  }

  private scheduleHideSuccessMessage(): void {
    this.clearHideSuccessTimeout();
    this.hideSuccessTimeoutId = window.setTimeout(() => {
      this.showSuccess = false;
      this.cdr.markForCheck();
    }, 5000);
  }

  private clearHideSuccessTimeout(): void {
    if (this.hideSuccessTimeoutId) {
      clearTimeout(this.hideSuccessTimeoutId);
      this.hideSuccessTimeoutId = undefined;
    }
  }
}
