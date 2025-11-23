import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, HostListener, Input, Output, TemplateRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelState } from '../stack.service';

@Component({
  selector: 'app-stack-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stack-panel.component.html',
  styleUrls: ['./stack-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackPanelComponent implements AfterViewInit {
  @Input() state!: PanelState;
  @Input() collapsed = false;
  @Output() close = new EventEmitter<string>();
  @Output() pinToggle = new EventEmitter<{ id: string; pinned: boolean }>();
  @Output() reopen = new EventEmitter<string>();

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    // Move focus to panel header when opened (not collapsed)
    if (!this.collapsed) {
      setTimeout(() => {
        const header = this.elementRef.nativeElement.querySelector<HTMLElement>('.panel-header');
        if (header) {
          header.focus();
        }
      }, 150); // Delay for slide-in animation
    }
  }

  /**
   * Handle Escape key to close panel
   */
  @HostListener('keydown.escape')
  handleEscape(): void {
    if (this.state.config.closable && !this.collapsed) {
      this.onClose();
    }
  }

  /**
   * Handle Ctrl/Cmd+P to toggle pin
   */
  @HostListener('keydown.control.p')
  @HostListener('keydown.meta.p')
  handlePinShortcut(): void {
    if (this.state.config.pinnable && !this.collapsed) {
      this.onPinToggle();
    }
  }

  onClose(): void {
    if (this.state.config.closable) {
      this.close.emit(this.state.id);
    }
  }

  onPinToggle(): void {
    if (this.state.config.pinnable) {
      this.pinToggle.emit({ id: this.state.id, pinned: !this.state.pinned });
    }
  }

  onReopen(): void {
    this.reopen.emit(this.state.id);
  }

  /**
   * Check if content is a TemplateRef
   */
  isTemplateRef(): boolean {
    return this.state.config.content instanceof TemplateRef;
  }

  /**
   * Get string content
   */
  getStringContent(): string {
    return typeof this.state.config.content === 'string' ? this.state.config.content : '';
  }
}
