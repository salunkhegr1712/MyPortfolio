import { Injectable, TemplateRef, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PanelConfig {
  title: string;
  content?: TemplateRef<any> | string;
  closable?: boolean;
  pinnable?: boolean;
  width?: number;
}

export interface PanelState {
  id: string;
  config: PanelConfig;
  pinned: boolean;
  openedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class StackService implements OnDestroy {
  private readonly DEFAULT_MAX_PANELS = 6;
  private maxPanels: number;
  private stackSubject = new BehaviorSubject<PanelState[]>([]);
  private idCounter = 0;

  constructor() {
    this.maxPanels = this.DEFAULT_MAX_PANELS;
  }

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
    let updatedStack = [newPanel, ...currentStack];

    // Enforce stack cap: remove oldest non-pinned panels if exceeding limit
    updatedStack = this.enforceStackCap(updatedStack);

    this.stackSubject.next(updatedStack);
    return id;
  }

  /**
   * Closes a panel by ID
   */
  close(panelId: string): void {
    const currentStack = this.stackSubject.value;
    const updatedStack = currentStack.filter(panel => panel.id !== panelId);
    this.stackSubject.next(updatedStack);
  }

  /**
   * Pins a panel to prevent auto-collapse
   */
  pin(panelId: string): void {
    const currentStack = this.stackSubject.value;
    const updatedStack = currentStack.map(panel =>
      panel.id === panelId ? { ...panel, pinned: true } : panel
    );
    this.stackSubject.next(updatedStack);
  }

  /**
   * Unpins a panel, making it eligible for auto-collapse
   */
  unpin(panelId: string): void {
    const currentStack = this.stackSubject.value;
    const updatedStack = currentStack.map(panel =>
      panel.id === panelId ? { ...panel, pinned: false } : panel
    );
    
    // Re-enforce cap after unpinning in case we're over limit
    const cappedStack = this.enforceStackCap(updatedStack);
    this.stackSubject.next(cappedStack);
  }

  /**
   * Returns observable of current stack (top to bottom)
   */
  getStack(): Observable<PanelState[]> {
    return this.stackSubject.asObservable();
  }

  /**
   * Returns current stack value (for testing)
   */
  getCurrentStack(): PanelState[] {
    return this.stackSubject.value;
  }

  /**
   * Sets the maximum number of panels allowed in the stack
   */
  setMaxPanels(max: number): void {
    this.maxPanels = max;
    const updatedStack = this.enforceStackCap(this.stackSubject.value);
    this.stackSubject.next(updatedStack);
  }

  /**
   * Generates a unique panel ID
   */
  private generateId(): string {
    this.idCounter++;
    return `panel-${Date.now()}-${this.idCounter}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enforces stack cap by removing oldest non-pinned panels
   * Pinned panels are always kept regardless of cap
   */
  private enforceStackCap(stack: PanelState[]): PanelState[] {
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
}
