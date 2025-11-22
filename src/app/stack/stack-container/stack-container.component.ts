import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StackService, PanelState } from '../stack.service';
import { StackPanelComponent } from '../stack-panel/stack-panel.component';

@Component({
  selector: 'app-stack-container',
  standalone: true,
  imports: [CommonModule, StackPanelComponent],
  templateUrl: './stack-container.component.html',
  styleUrl: './stack-container.component.scss'
})
export class StackContainerComponent implements OnInit, OnDestroy {
  @Input() maxVisible = 3;

  stack: PanelState[] = [];
  private destroy$ = new Subject<void>();

  constructor(private stackService: StackService) {}

  ngOnInit(): void {
    // Subscribe to stack changes
    this.stackService.getStack()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stack => {
        this.stack = stack;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check if a panel should be collapsed to badge view
   * Panels beyond maxVisible and not pinned are collapsed
   */
  isPanelCollapsed(index: number, panel: PanelState): boolean {
    return index >= this.maxVisible && !panel.pinned;
  }

  /**
   * Handle panel close event
   */
  onPanelClose(panelId: string): void {
    this.stackService.close(panelId);
  }

  /**
   * Handle pin toggle event
   */
  onPinToggle(event: { id: string; pinned: boolean }): void {
    if (event.pinned) {
      this.stackService.unpin(event.id);
    } else {
      this.stackService.pin(event.id);
    }
  }

  /**
   * Handle reopen from badge
   * Move panel to top of stack
   */
  onPanelReopen(panelId: string): void {
    const panel = this.stack.find(p => p.id === panelId);
    if (panel) {
      // Close and re-open to move to top
      this.stackService.close(panelId);
      setTimeout(() => {
        this.stackService.open(panel.config);
      }, 50);
    }
  }

  /**
   * Programmatically open a sample panel (for testing)
   */
  openSamplePanel(title: string, content: string): void {
    this.stackService.open({ title, content });
  }

  /**
   * TrackBy function for ngFor performance
   */
  trackByPanelId(index: number, panel: PanelState): string {
    return panel.id;
  }
}

