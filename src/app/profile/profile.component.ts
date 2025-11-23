import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PatternsDirective } from '../patterns.directive';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, PatternsDirective, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  private _accentColor = '#0ea5a4';

  @Input()
  set accentColor(color: string | null) {
    this._accentColor = color ?? '#0ea5a4';
  }

  get accentColor(): string {
    return this._accentColor;
  }
}
