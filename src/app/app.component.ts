import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PageNotificationComponent } from './shared/page-notification/page-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PageNotificationComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
