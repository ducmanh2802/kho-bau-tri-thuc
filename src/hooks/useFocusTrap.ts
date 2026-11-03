import { useEffect, useRef } from 'react';

/** Elements that can receive keyboard focus, in DOM order. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * T42/C — hộp thoại chỉ được kéo focus về mình khi focus **chưa** nằm trong nó.
 *
 * Bản cũ gọi `focus()` lên phần tử đầu tiên vô điều kiện ở ba thời điểm (mount,
 * +50 ms, +150 ms). Ba mẹ mở Cổng Xác Nhận, bấm vào ô số và gõ ngay trong
 * 150 ms ⇒ con trỏ bị giật về nút ✕ và chữ số mất. Focus đã ở trong hộp thoại
 * là ý định của người dùng, không phải thứ để "re-assert".
 */
export function shouldMoveFocusIntoDialog(activeElement: Element | null, container: HTMLElement): boolean {
  if (!activeElement) return true;
  return !container.contains(activeElement);
}

/**
 * Keeps keyboard focus inside a modal and restores it on close.
 *
 * §24 accessibility: without this, a child using Tab (or a switch-capable
 * device) can walk out of an open dialog into the page behind it, which is
 * disorienting and hides the dialog from screen-reader users.
 *
 * Usage:
 *   const ref = useFocusTrap<HTMLDivElement>(isOpen);
 *   <div ref={ref} role="dialog" aria-modal="true" tabIndex={-1}> … </div>
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(active: boolean) {
  const ref = useRef<T | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    // Remember where focus came from so we can hand it back on close.
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        // offsetParent === null means display:none, so it is not reachable.
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
      );

    // Move focus into the dialog on open. The first focusable can be painted
    // a tick later (lazy chunk, layout), so re-assert once after paint.
    const focusIntoDialog = () => {
      const current = document.activeElement;
      if (!shouldMoveFocusIntoDialog(current, container)) return;
      const items = focusables();
      const target = items[0] ?? container;
      target.focus({ preventScroll: true });
    };
    // Immediate focus attempt
    focusIntoDialog();
    // Deferred focus after paint
    const deferred = window.setTimeout(focusIntoDialog, 50);
    // Additional deferred focus after next paint
    const deferred2 = window.setTimeout(focusIntoDialog, 150);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;

      // If focus is outside the dialog, bring it back in
      if (!container.contains(current as Node)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
        return;
      }

      if (event.shiftKey && (current === first || !container.contains(current))) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && (current === last || !container.contains(current))) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.clearTimeout(deferred);
      window.clearTimeout(deferred2);
      document.removeEventListener('keydown', handleKeyDown, true);
      // Restore focus to the element that had it before the dialog opened
      if (previouslyFocusedRef.current && document.contains(previouslyFocusedRef.current)) {
        previouslyFocusedRef.current.focus({ preventScroll: true });
      }
    };
  }, [active]);

  return ref;
}