import { useEffect, useRef } from 'react';

export type ModalHistoryOptions = {
  /** Lớp phủ *trong* modal đang che bảng (vd "Chọn Màn & Độ Khó"). */
  overlayOpen?: boolean;
  /** Cách đóng lớp phủ đó. Không có thì Esc không được chặn. */
  onCloseOverlay?: () => void;
};

/**
 * T46C — quyết định Esc thuộc về ai. Trả về `true` khi Esc phải **đóng lớp phủ** thay vì
 * thoát modal. `hasCloseHandler` bắt buộc: nếu nơi gọi quên đưa lối đóng mà lớp phủ vẫn
 * mở thì phím sẽ bị nuốt, bé không còn cách nào thoát bằng bàn phím.
 */
export function shouldEscapeCloseOverlay(overlayOpen: boolean, hasCloseHandler: boolean): boolean {
  return overlayOpen && hasCloseHandler;
}

/**
 * T01B/1 — Esc + nút Back của trình duyệt/điện thoại đóng modal game & bài học.
 *
 * Khi modal mở, đẩy 1 entry vào history. Nhấn Back (popstate) hoặc Esc sẽ gọi
 * `onExit`. Nút đóng trong modal nên gọi `requestClose()` trả về để tự bóc
 * entry đã đẩy (tránh kẹt 1 entry thừa trong history).
 *
 * T46C: `window` keydown nằm **ngoài** cây DOM của lớp phủ trong modal, nên Esc trước
 * đây thoát luôn trò chơi khi bảng đang bị che. Giờ Esc **lồng nhau**: lần một đóng lớp
 * phủ (entry history **giữ nguyên**), lần hai mới thoát.
 *
 * An toàn khi không có DOM (test/node): mọi truy cập window/history được guard.
 */
export function useModalHistory(onExit: () => void, options?: ModalHistoryOptions) {
  const exitRef = useRef(onExit);
  exitRef.current = onExit;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const pushedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.history === 'undefined') return;
    try {
      window.history.pushState({ kbModal: true }, '');
      pushedRef.current = true;
    } catch {
      pushedRef.current = false;
    }

    const handlePopState = () => {
      // Chỉ phản ứng khi chính entry của modal bị bóc.
      pushedRef.current = false;
      exitRef.current();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        const closeOverlay = optionsRef.current?.onCloseOverlay;
        if (shouldEscapeCloseOverlay(Boolean(optionsRef.current?.overlayOpen), typeof closeOverlay === 'function')) {
          // Lớp phủ ăn Esc: đóng nó, **không** bóc entry history của modal.
          closeOverlay?.();
          return;
        }
        // Đi qua history để entry được bóc gọn, popstate sẽ gọi onExit.
        if (pushedRef.current) {
          try {
            window.history.back();
            return;
          } catch {
            /* rớt xuống gọi trực tiếp */
          }
        }
        pushedRef.current = false;
        exitRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      // Modal tự đóng mà không qua history (ví dụ nút "Tiếp tục học" gọi
      // onExit trực tiếp) mà entry còn: bóc entry để nút Back sau này không
      // phải bấm 2 lần. Trường hợp đóng qua Back/Esc/X thì pushedRef đã
      // false nên không back() lần nữa.
      if (pushedRef.current) {
        pushedRef.current = false;
        try {
          window.history.back();
        } catch {
          /* bỏ qua: entry thừa vô hại */
        }
      }
    };
  }, []);

  /**
   * Dùng cho nút đóng (X) của modal: bóc entry history để popstate gọi onExit.
   * Nếu history không dùng được thì gọi onExit trực tiếp.
   */
  const requestClose = () => {
    if (typeof window !== 'undefined' && pushedRef.current) {
      try {
        window.history.back();
        return;
      } catch {
        /* rớt xuống gọi trực tiếp */
      }
    }
    pushedRef.current = false;
    exitRef.current();
  };

  return { requestClose };
}
