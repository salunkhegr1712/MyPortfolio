import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  readonly navLinks = [
    { label: 'Home', route: '/home' },
    { label: 'Blog', route: '/blogs' },
    { label: 'Projects', route: '/projects' },
    { label: 'Skills', route: '/skills' },
    { label: 'About', route: '/about' },
    { label: 'Contact', route: '/contact' }
  ] as const;

  readonly menuIconPath = 'M4 6h16M4 12h16M4 18h16';
  readonly closeIconPath = 'M6 18L18 6M6 6l12 12';

  mobileOpen = false;

  private readonly destroyRef = inject(DestroyRef);
  private focusTimeoutId: number | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearFocusTimeout());
  }

  toggleMobileMenu(): void {
    this.mobileOpen = !this.mobileOpen;
    if (this.mobileOpen) {
      this.focusFirstMobileLink();
    } else {
      this.clearFocusTimeout();
    }
  }

  closeMobileMenu(): void {
    if (!this.mobileOpen) {
      return;
    }
    this.mobileOpen = false;
    this.clearFocusTimeout();
  }

  handleMobileLinkClick(): void {
    this.closeMobileMenu();
  }

  private focusFirstMobileLink(): void {
    this.clearFocusTimeout();
    this.focusTimeoutId = window.setTimeout(() => {
      const firstLink = document.querySelector<HTMLElement>('#mobile-menu a');
      firstLink?.focus();
    }, 50);
  }

  private clearFocusTimeout(): void {
    if (this.focusTimeoutId) {
      clearTimeout(this.focusTimeoutId);
      this.focusTimeoutId = undefined;
    }
  }
}
