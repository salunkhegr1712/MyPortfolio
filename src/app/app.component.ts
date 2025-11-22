import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageNotificationComponent } from './shared/page-notification/page-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PageNotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'portfolio';
}
