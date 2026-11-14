import { useLayoutEffect, useRef } from 'react';

interface RectPos {
  top: number;
  left: number;
}

interface FlipOptions {
  duration?: number; // ms, default 340
  easing?: string; // cubic-bezier curve, default smooth physical spring
}

/**
 * useFlipList: Implements First-Last-Invert-Play (FLIP) layout animation
 * using the high-performance Web Animations API (Element.prototype.animate).
 *
 * When items in a list or grid change order (drag-and-drop, up/down arrows,
 * sort, reverse), the DOM elements physically slide from their previous
 * coordinates to their new positions with hardware GPU acceleration.
 */
export function useFlipList<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string,
  options: FlipOptions = {}
) {
  const {
    duration = 340,
    easing = 'cubic-bezier(0.2, 0.95, 0.3, 1)',
  } = options;

  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const prevPositions = useRef<Map<string, RectPos>>(new Map());
  const activeAnimations = useRef<Map<string, Animation>>(new Map());

  // Callback ref to register a DOM node for a key
  const registerItem = (key: string) => (el: HTMLElement | null) => {
    if (el) {
      itemRefs.current.set(key, el);
    } else {
      itemRefs.current.delete(key);
      activeAnimations.current.delete(key);
    }
  };

  useLayoutEffect(() => {
    const currentPositions = new Map<string, RectPos>();

    // 1. Measure all current (Last) positions after DOM render
    items.forEach((item, index) => {
      const key = keyExtractor(item, index);
      const el = itemRefs.current.get(key);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      currentPositions.set(key, { top: rect.top, left: rect.left });

      const oldPos = prevPositions.current.get(key);
      if (oldPos) {
        // Calculate difference (First - Last = Invert)
        const deltaX = oldPos.left - rect.left;
        const deltaY = oldPos.top - rect.top;

        // If the item physically moved by more than 0.5px in any direction
        if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
          // Cancel previous in-flight animation on this element if any
          const existingAnim = activeAnimations.current.get(key);
          if (existingAnim) {
            existingAnim.cancel();
          }

          // Use native Web Animations API for 60fps GPU compositor sliding
          if (typeof el.animate === 'function') {
            const anim = el.animate(
              [
                {
                  transform: `translate3d(${deltaX}px, ${deltaY}px, 0)`,
                  zIndex: 20,
                  boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.15)',
                },
                {
                  transform: 'translate3d(0, 0, 0)',
                  zIndex: 1,
                  boxShadow: 'none',
                },
              ],
              {
                duration,
                easing,
                fill: 'none',
              }
            );

            activeAnimations.current.set(key, anim);
            anim.onfinish = () => {
              activeAnimations.current.delete(key);
            };
          } else {
            // Fallback for environments lacking Element.animate
            el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
            el.style.transition = 'none';
            void el.offsetHeight; // Force layout flush
            requestAnimationFrame(() => {
              el.style.transition = `transform ${duration}ms ${easing}`;
              el.style.transform = 'translate3d(0, 0, 0)';
            });
          }
        }
      }
    });

    // 2. Save current positions for next reorder comparison
    prevPositions.current = currentPositions;
  }, [items, keyExtractor, duration, easing]);

  return { registerItem };
}

