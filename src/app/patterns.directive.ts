import { DestroyRef, Directive, ElementRef, Input, NgZone, OnDestroy, OnInit, Renderer2, inject } from '@angular/core';

const DOT_GRID_SIZE = 40;
const DOT_RADIUS = 1.5;
const ARC_TEMPLATES = [
  { start: [0.1, 0.2], control: [0.15, 0.05], end: [0.4, 0.25] },
  { start: [0.6, 0.15], control: [0.7, 0.35], end: [0.9, 0.2] },
  { start: [0.2, 0.7], control: [0.35, 0.9], end: [0.55, 0.75] },
  { start: [0.7, 0.65], control: [0.85, 0.55], end: [0.95, 0.85] },
  { start: [0.05, 0.45], control: [0.25, 0.35], end: [0.45, 0.5] },
  { start: [0.55, 0.4], control: [0.65, 0.2], end: [0.8, 0.45] }
] as const;

@Directive({
  selector: '[appPatterns]',
  standalone: true
})
export class PatternsDirective implements OnInit, OnDestroy {
  @Input() intensity = 0.25; // 0-1 scale for movement amplitude

  private svgElement: SVGElement | null = null;
  private patternGroup: SVGGElement | null = null;
  private rafId: number | null = null;
  private prefersReducedMotion = false;
  private boundPointerMoveHandler: ((e: PointerEvent) => void) | null = null;
  private readonly renderer = inject(Renderer2);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private resizeObserver: ResizeObserver | null = null;
  private motionQuery: MediaQueryList | null = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined' && 'matchMedia' in window) {
      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.prefersReducedMotion = this.motionQuery.matches;
    }
    this.rebuildPattern();

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.rebuildPattern());
      this.resizeObserver.observe(this.host);
    }

    // Only add pointer tracking if animations are allowed
    if (!this.prefersReducedMotion) {
      this.attachPointerListeners();
    }

    if (this.motionQuery) {
      const addListener = this.motionQuery.addEventListener?.bind(this.motionQuery);
      const removeListener = this.motionQuery.removeEventListener?.bind(this.motionQuery);

      if (addListener && removeListener) {
        addListener('change', this.handleMotionPreferenceChange);
        this.destroyRef.onDestroy(() => removeListener('change', this.handleMotionPreferenceChange));
      } else if ('addListener' in this.motionQuery && 'removeListener' in this.motionQuery) {
        const legacyAdd = (this.motionQuery as MediaQueryList).addListener.bind(this.motionQuery);
        const legacyRemove = (this.motionQuery as MediaQueryList).removeListener.bind(this.motionQuery);
        legacyAdd(this.handleMotionPreferenceChange);
        this.destroyRef.onDestroy(() => legacyRemove(this.handleMotionPreferenceChange));
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up pointer listeners
    if (this.boundPointerMoveHandler) {
      this.host.removeEventListener('pointermove', this.boundPointerMoveHandler);
    }

    // Cancel any pending animation frame
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    // Remove SVG from DOM
    if (this.svgElement && this.svgElement.parentNode) {
      this.renderer.removeChild(this.host, this.svgElement);
    }

    this.resizeObserver?.disconnect();
  }

  /**
   * Creates an inline SVG pattern with circles and arcs
   */
  private createSvgPattern(): void {
    const host = this.host;
    
    // Create SVG element
    this.svgElement = this.renderer.createElement('svg', 'svg') as SVGElement;
    this.renderer.setAttribute(this.svgElement, 'class', 'pattern-svg');
    this.renderer.setAttribute(this.svgElement, 'aria-hidden', 'true');
    this.renderer.setAttribute(this.svgElement, 'focusable', 'false');
    this.renderer.setStyle(this.svgElement, 'position', 'absolute');
    this.renderer.setStyle(this.svgElement, 'inset', '0');
    this.renderer.setStyle(this.svgElement, 'width', '100%');
    this.renderer.setStyle(this.svgElement, 'height', '100%');
    this.renderer.setStyle(this.svgElement, 'pointer-events', 'none');
    this.renderer.setStyle(this.svgElement, 'overflow', 'visible');

    // Create pattern group that will be transformed
    this.patternGroup = this.renderer.createElement('g', 'svg') as SVGGElement;
    this.renderer.setAttribute(this.patternGroup, 'class', 'pattern-group');
    this.renderer.setStyle(this.patternGroup, 'will-change', 'transform');

    // Generate grid of circles (dots)
    const hostWidth = host.offsetWidth || 800;
    const hostHeight = host.offsetHeight || 600;

    for (let x = 0; x < hostWidth + DOT_GRID_SIZE; x += DOT_GRID_SIZE) {
      for (let y = 0; y < hostHeight + DOT_GRID_SIZE; y += DOT_GRID_SIZE) {
        const circle = this.renderer.createElement('circle', 'svg');
        this.renderer.setAttribute(circle, 'cx', x.toString());
        this.renderer.setAttribute(circle, 'cy', y.toString());
        this.renderer.setAttribute(circle, 'r', DOT_RADIUS.toString());
        this.renderer.setAttribute(circle, 'fill', '#0ea5a4');
        this.renderer.setAttribute(circle, 'opacity', '0.15');
        this.renderer.appendChild(this.patternGroup, circle);
      }
    }

    // Add subtle arcs for visual interest using memoized templates
    ARC_TEMPLATES.forEach(template => {
      const arc = this.renderer.createElement('path', 'svg');
      const startX = template.start[0] * hostWidth;
      const startY = template.start[1] * hostHeight;
      const endX = template.end[0] * hostWidth;
      const endY = template.end[1] * hostHeight;
      const controlX = template.control[0] * hostWidth;
      const controlY = template.control[1] * hostHeight;

      const d = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
      this.renderer.setAttribute(arc, 'd', d);
      this.renderer.setAttribute(arc, 'stroke', '#0ea5a4');
      this.renderer.setAttribute(arc, 'stroke-width', '1');
      this.renderer.setAttribute(arc, 'fill', 'none');
      this.renderer.setAttribute(arc, 'opacity', '0.1');
      this.renderer.appendChild(this.patternGroup, arc);
    });

    this.renderer.appendChild(this.svgElement, this.patternGroup);
    this.renderer.appendChild(host, this.svgElement);
  }

  /**
   * Attaches pointer move listener with rAF throttling
   */
  private attachPointerListeners(): void {
    let ticking = false;
    let lastX = 0;
    let lastY = 0;

    this.boundPointerMoveHandler = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;

      // Throttle to 60fps using requestAnimationFrame
      if (!ticking) {
        this.ngZone.runOutsideAngular(() => {
          this.rafId = requestAnimationFrame(() => {
            this.updatePatternTransform(lastX, lastY);
            ticking = false;
          });
        });
        ticking = true;
      }
    };

    this.host.addEventListener('pointermove', this.boundPointerMoveHandler, { passive: true });
  }

  /**
   * Updates SVG pattern transform based on pointer position
   * Movement is constrained to 2-6px translation and ±3deg rotation
   */
  private updatePatternTransform(clientX: number, clientY: number): void {
    if (!this.patternGroup) return;

    const host = this.host;
    const rect = host.getBoundingClientRect();

    // Normalize pointer position to -1 to 1 range
    const normalizedX = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const normalizedY = ((clientY - rect.top) / rect.height - 0.5) * 2;

    // Apply intensity scaling
    const clampedIntensity = Math.max(0, Math.min(1, this.intensity));
    const scaledX = normalizedX * clampedIntensity;
    const scaledY = normalizedY * clampedIntensity;

    // Calculate translation (2-6px range)
    const maxTranslate = 6;
    const translateX = scaledX * maxTranslate;
    const translateY = scaledY * maxTranslate;

    // Calculate rotation (±3deg range)
    const maxRotate = 3;
    const rotate = (scaledX + scaledY) / 2 * maxRotate;

    // Apply transform
    const transform = `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`;
    this.renderer.setStyle(this.patternGroup, 'transform', transform);
  }

  private rebuildPattern(): void {
    if (this.svgElement && this.svgElement.parentNode) {
      this.renderer.removeChild(this.host, this.svgElement);
    }
    this.createSvgPattern();
  }

  private handleMotionPreferenceChange = (event: MediaQueryListEvent): void => {
    this.prefersReducedMotion = event.matches;
    if (this.prefersReducedMotion && this.boundPointerMoveHandler) {
      this.host.removeEventListener('pointermove', this.boundPointerMoveHandler);
      this.boundPointerMoveHandler = null;
    } else if (!this.prefersReducedMotion && !this.boundPointerMoveHandler) {
      this.attachPointerListeners();
    }
  };

  private get host(): HTMLElement {
    return this.hostRef.nativeElement;
  }
}
