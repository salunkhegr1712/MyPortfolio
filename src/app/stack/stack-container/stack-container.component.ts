import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StackService, PanelState } from '../stack.service';
import { StackPanelComponent } from '../stack-panel/stack-panel.component';

@Component({
  selector: 'app-stack-container',
  standalone: true,
  imports: [CommonModule, StackPanelComponent],
  templateUrl: './stack-container.component.html',
  styleUrls: ['./stack-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StackContainerComponent implements OnInit {
  @Input() maxVisible = 3;

  stack: ReadonlyArray<PanelState> = [];
  private readonly stackService = inject(StackService);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.stackService.getStack()
      .pipe(takeUntilDestroyed())
      .subscribe(stack => {
        this.stack = stack;
        this.cdr.markForCheck();
      });
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
      this.stackService.pin(event.id);
    } else {
      this.stackService.unpin(event.id);
    }
  }

  /**
   * Handle reopen from badge
   * Move panel to top of stack
   */
  onPanelReopen(panelId: string): void {
    this.stackService.reopen(panelId);
  }

  /**
   * TrackBy function for ngFor performance
   */
  trackByPanelId(index: number, panel: PanelState): string {
    return panel.id;
  }
}

