import { Injectable, TemplateRef, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PanelConfig {
  readonly title: string;
  readonly content?: TemplateRef<unknown> | string;
  readonly closable?: boolean;
  readonly pinnable?: boolean;
  readonly width?: number;
}

export interface PanelState {
  readonly id: string;
  readonly config: PanelConfig;
  readonly pinned: boolean;
  readonly openedAt: number;
}

const DEFAULT_MAX_PANELS = 6;

@Injectable({
  providedIn: 'root'
})
export class StackService implements OnDestroy {
  private maxPanels = DEFAULT_MAX_PANELS;
  private readonly stackSubject = new BehaviorSubject<ReadonlyArray<PanelState>>([]);
  readonly stack$ = this.stackSubject.asObservable();
  private idCounter = 0;

  constructor() {}

  ngOnDestroy(): void {
    this.stackSubject.complete();
  }

  /**
   * Opens a new panel and returns its unique ID
   */
  open(panel: PanelConfig): string {
    const id = this.generateId();
    const newPanel: PanelState = {
      id,
      config: { closable: true, pinnable: true, ...panel },
      pinned: false,
      openedAt: Date.now()
    };

    const currentStack = this.stackSubject.value;
    let updatedStack: ReadonlyArray<PanelState> = [newPanel, ...currentStack];

    // Enforce stack cap: remove oldest non-pinned panels if exceeding limit
    updatedStack = this.enforceStackCap(updatedStack);

    this.stackSubject.next(updatedStack);
    return id;
  }

  /**
   * Closes a panel by ID
   */
  close(panelId: string): void {
    this.stackSubject.next(
      this.stackSubject.value.filter(panel => panel.id !== panelId)
    );
  }

  /**
   * Pins a panel to prevent auto-collapse
   */
  pin(panelId: string): void {
    this.stackSubject.next(this.updatePanel(panelId, { pinned: true }));
  }

  /**
   * Unpins a panel, making it eligible for auto-collapse
   */
  unpin(panelId: string): void {
    const updatedStack = this.updatePanel(panelId, { pinned: false });
    this.stackSubject.next(this.enforceStackCap(updatedStack));
  }

  /**
   * Returns observable of current stack (top to bottom)
   */
  getStack(): Observable<ReadonlyArray<PanelState>> {
    return this.stack$;
  }

  /**
   * Returns current stack value (for testing)
   */
  getCurrentStack(): ReadonlyArray<PanelState> {
    return this.stackSubject.value;
  }

  /**
   * Sets the maximum number of panels allowed in the stack
   */
  setMaxPanels(max: number): void {
    this.maxPanels = Math.max(1, Math.floor(max));
    const updatedStack = this.enforceStackCap(this.stackSubject.value);
    this.stackSubject.next(updatedStack);
  }

  /**
   * Moves a panel to the top of the stack, reopening it if it exists
   */
  reopen(panelId: string): void {
    const panels = this.stackSubject.value;
    const target = panels.find(panel => panel.id === panelId);
    if (!target) {
      return;
    }

    const updatedStack = [{ ...target, openedAt: Date.now() }, ...panels.filter(panel => panel.id !== panelId)];
    this.stackSubject.next(this.enforceStackCap(updatedStack));
  }

  /**
   * Generates a unique panel ID
   */
  private generateId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    this.idCounter += 1;
    return `panel-${Date.now()}-${this.idCounter}`;
  }

  /**
   * Enforces stack cap by removing oldest non-pinned panels
   * Pinned panels are always kept regardless of cap
   */
  private enforceStackCap(stack: ReadonlyArray<PanelState>): ReadonlyArray<PanelState> {
    if (stack.length <= this.maxPanels) {
      return stack;
    }

    // Separate pinned and non-pinned panels
    const pinned = stack.filter(p => p.pinned);
    const unpinned = stack.filter(p => !p.pinned);

    // Keep only the most recent non-pinned panels that fit within the cap
    const availableSlots = Math.max(0, this.maxPanels - pinned.length);
    const keptUnpinned = unpinned.slice(0, availableSlots);

    // Merge back: pinned panels + recent unpinned panels, maintaining original order
    const keptIds = new Set([...pinned.map(p => p.id), ...keptUnpinned.map(p => p.id)]);
    return stack.filter(p => keptIds.has(p.id));
  }

  private updatePanel(panelId: string, changes: Partial<PanelState>): ReadonlyArray<PanelState> {
    return this.stackSubject.value.map(panel =>
      panel.id === panelId ? { ...panel, ...changes } : panel
    );
  }
}
