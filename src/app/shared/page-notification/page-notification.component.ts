import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-page-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-notification.component.html',
  styleUrl: './page-notification.component.scss'
})
export class PageNotificationComponent implements OnInit {
  showNotification = false;
  private hasShownNotification = false;
  private hasPlayedSound = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Only show once per session, 10 seconds after first page load
    setTimeout(() => {
      if (!this.hasShownNotification) {
        this.showContactNotification();
      }
    }, 10000);
  }

  private showContactNotification() {
    this.showNotification = true;
    this.hasShownNotification = true;
    
    // Play bell sound
    this.playBellSound();

    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideNotification();
    }, 10000);
  }

  private playBellSound() {
    // Create a simple bell "ting" sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First tone (higher pitch)
    const oscillator1 = audioContext.createOscillator();
    const gainNode1 = audioContext.createGain();
    
    oscillator1.connect(gainNode1);
    gainNode1.connect(audioContext.destination);
    
    oscillator1.frequency.value = 800; // Bell frequency
    oscillator1.type = 'sine';
    
    gainNode1.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator1.start(audioContext.currentTime);
    oscillator1.stop(audioContext.currentTime + 0.5);
    
    // Second tone (slightly lower, delayed)
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.value = 600;
      oscillator2.type = 'sine';
      
      gainNode2.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.4);
    }, 100);
  }

  hideNotification() {
    this.showNotification = false;
  }

  navigateToContact() {
    this.router.navigate(['/contact']);
    this.hideNotification();
  }
}
