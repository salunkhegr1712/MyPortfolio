import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPatterns]',
  standalone: true
})
export class PatternsDirective implements OnInit, OnDestroy {
  @Input() intensity: number = 0.25; // 0-1 scale for movement amplitude

  private svgElement: SVGElement | null = null;
  private patternGroup: SVGGElement | null = null;
  private rafId: number | null = null;
  private prefersReducedMotion = false;
  private boundPointerMoveHandler: ((e: PointerEvent) => void) | null = null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Check user's motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create and attach SVG pattern
    this.createSvgPattern();

    // Only add pointer tracking if animations are allowed
    if (!this.prefersReducedMotion) {
      this.attachPointerListeners();
    }
  }

  ngOnDestroy(): void {
    // Clean up pointer listeners
    if (this.boundPointerMoveHandler) {
      this.el.nativeElement.removeEventListener('pointermove', this.boundPointerMoveHandler);
    }

    // Cancel any pending animation frame
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    // Remove SVG from DOM
    if (this.svgElement && this.svgElement.parentNode) {
      this.renderer.removeChild(this.el.nativeElement, this.svgElement);
    }
  }

  /**
   * Creates an inline SVG pattern with circles and arcs
   */
  private createSvgPattern(): void {
    const host = this.el.nativeElement;
    
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
    const gridSize = 40; // spacing between dots
    const dotRadius = 1.5;
    const hostWidth = host.offsetWidth || 800;
    const hostHeight = host.offsetHeight || 600;

    for (let x = 0; x < hostWidth + gridSize; x += gridSize) {
      for (let y = 0; y < hostHeight + gridSize; y += gridSize) {
        const circle = this.renderer.createElement('circle', 'svg');
        this.renderer.setAttribute(circle, 'cx', x.toString());
        this.renderer.setAttribute(circle, 'cy', y.toString());
        this.renderer.setAttribute(circle, 'r', dotRadius.toString());
        this.renderer.setAttribute(circle, 'fill', '#0ea5a4');
        this.renderer.setAttribute(circle, 'opacity', '0.15');
        this.renderer.appendChild(this.patternGroup, circle);
      }
    }

    // Add subtle arcs for visual interest
    const numArcs = 6;
    for (let i = 0; i < numArcs; i++) {
      const arc = this.renderer.createElement('path', 'svg');
      const startX = Math.random() * hostWidth;
      const startY = Math.random() * hostHeight;
      const endX = startX + (Math.random() * 200 - 100);
      const endY = startY + (Math.random() * 200 - 100);
      const controlX = (startX + endX) / 2 + (Math.random() * 100 - 50);
      const controlY = (startY + endY) / 2 + (Math.random() * 100 - 50);

      const d = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
      this.renderer.setAttribute(arc, 'd', d);
      this.renderer.setAttribute(arc, 'stroke', '#0ea5a4');
      this.renderer.setAttribute(arc, 'stroke-width', '1');
      this.renderer.setAttribute(arc, 'fill', 'none');
      this.renderer.setAttribute(arc, 'opacity', '0.1');
      this.renderer.appendChild(this.patternGroup, arc);
    }

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
        this.rafId = requestAnimationFrame(() => {
          this.updatePatternTransform(lastX, lastY);
          ticking = false;
        });
        ticking = true;
      }
    };

    this.el.nativeElement.addEventListener('pointermove', this.boundPointerMoveHandler, { passive: true });
  }

  /**
   * Updates SVG pattern transform based on pointer position
   * Movement is constrained to 2-6px translation and ±3deg rotation
   */
  private updatePatternTransform(clientX: number, clientY: number): void {
    if (!this.patternGroup) return;

    const host = this.el.nativeElement;
    const rect = host.getBoundingClientRect();

    // Normalize pointer position to -1 to 1 range
    const normalizedX = ((clientX - rect.left) / rect.width - 0.5) * 2;
    const normalizedY = ((clientY - rect.top) / rect.height - 0.5) * 2;

    // Apply intensity scaling
    const scaledX = normalizedX * this.intensity;
    const scaledY = normalizedY * this.intensity;

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
}
