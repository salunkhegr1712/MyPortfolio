import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-notification.component.html',
  styleUrls: ['./page-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNotificationComponent implements OnInit {
  showNotification = false;
  private hasShownNotification = false;
  private hasPlayedSound = false;
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private notificationTimeoutId: number | undefined;
  private hideTimeoutId: number | undefined;

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimers());
  }

  ngOnInit() {
    this.notificationTimeoutId = window.setTimeout(() => {
      if (!this.hasShownNotification) {
        this.showContactNotification();
      }
    }, 10000);
  }

  private showContactNotification() {
    this.showNotification = true;
    this.hasShownNotification = true;
    this.cdr.markForCheck();
    
    // Play bell sound
    this.playBellSound();

    // Auto-hide after 10 seconds
    this.hideTimeoutId = window.setTimeout(() => {
      this.hideNotification();
    }, 10000);
  }

  private playBellSound() {
    if (this.hasPlayedSound) {
      return;
    }
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    this.hasPlayedSound = true;
    const audioContext = new AudioContextCtor();
    let activeOscillators = 2;

    const teardown = () => {
      if (--activeOscillators === 0) {
        audioContext.close().catch(() => undefined);
      }
    };

    const playTone = (frequency: number, delay: number, duration: number, gainValue: number) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(gainValue, audioContext.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime + delay);
      oscillator.stop(audioContext.currentTime + delay + duration);
      oscillator.addEventListener('ended', teardown, { once: true });
    };

    playTone(800, 0, 0.5, 0.3);
    playTone(600, 0.1, 0.4, 0.2);
  }

  hideNotification() {
    this.showNotification = false;
    this.cdr.markForCheck();
  }

  navigateToContact() {
    this.router.navigate(['/contact']);
    this.hideNotification();
  }

  private clearTimers(): void {
    if (this.notificationTimeoutId) {
      clearTimeout(this.notificationTimeoutId);
      this.notificationTimeoutId = undefined;
    }
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = undefined;
    }
  }
}
