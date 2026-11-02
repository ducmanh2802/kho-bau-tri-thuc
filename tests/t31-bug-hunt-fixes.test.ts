import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (rel: string) => fs.readFileSync(path.resolve(rel), 'utf8');

describe('T31 — sửa lỗi tìm được khi quét toàn bộ probe', () => {
  describe('popup giới thiệu bài (SubjectScreen) phải là hộp thoại đúng nghĩa', () => {
    const src = read('src/components/subject/SubjectScreen.tsx');

    it('dùng useFocusTrap và gắn ref vào khối role=dialog', () => {
      expect(src).toContain("import { useFocusTrap } from '../../hooks/useFocusTrap'");
      expect(src).toMatch(/useFocusTrap<HTMLDivElement>\(!!showLessonPopup\)/);
      expect(src).toContain('ref={lessonPopupRef}');
      expect(src).toContain('tabIndex={-1}');
    });

    it('dialog có aria-label lấy từ tên bài và Esc đóng được', () => {
      expect(src).toContain('aria-label={showLessonPopup.title}');
      expect(src).toMatch(/event\.key === 'Escape'/);
      expect(src).toContain('setShowLessonPopup(null)');
    });
  });

  describe('header không đẩy nút Ba Mẹ ra ngoài màn hình', () => {
    it('nhãn chữ của AuthButton chỉ hiện từ xl (1280px), dưới đó là icon', () => {
      const auth = read('src/components/auth/AuthButton.tsx');
      expect(auth).toContain('hidden xl:inline text-amber-950 font-black whitespace-nowrap');
      expect(auth).not.toContain('min-[480px]:inline');
      expect(auth).not.toContain('min-[420px]:inline');
    });
  });

  describe('câu thoại của gấu là tiếng Việt thật và TTS đọc đúng câu', () => {
    const header = read('src/components/common/Header.tsx');
    const phraseBlock = header.slice(
      header.indexOf('const bearReactionPhrases'),
      header.indexOf('export const Header')
    );

    it('không còn ký tự Hàn hay câu tiếng Anh vô nghĩa', () => {
      expect(phraseBlock).not.toMatch(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/);
      expect(phraseBlock).not.toContain('Bouncing!');
      expect(phraseBlock).not.toContain('Hết lâu rưỡi!');
    });

    it('TTS đọc chính câu vừa chọn, không đọc "chanh"/"huh"', () => {
      expect(phraseBlock).toContain('sound.speak(phrase');
      expect(phraseBlock).not.toContain("'chanh'");
      expect(phraseBlock).not.toContain("'huh'");
      expect(phraseBlock).not.toContain('new SpeechSynthesisUtterance');
    });

    it('lời chào có dấu đúng, không còn "bé oir"', () => {
      expect(header).not.toContain('bé oir');
      expect(header).toContain('Chào buổi sáng, bé ơi!');
    });
  });

  describe('cờ vua 3D có đường lùi khi máy không có WebGL', () => {
    const canvas = read('src/components/learning/chess/chess3d/Chess3DCanvas.tsx');
    const game = read('src/components/learning/chess/ChessGame.tsx');

    it('kiểm tra context webgl trước khi dựng scene', () => {
      // T38: phép thử chuyển vào module thuần `webglSupport.probeWebGL` (test được
      // bằng canvas giả) — ở đây chỉ khoá rằng canvas gọi nó và rút bàn khi không có.
      expect(canvas).toContain('probeWebGL(');
      expect(canvas).toMatch(/if \(!probe\.supported\) \{\s*onUnsupported\?\.\(\)/);
    });

    it('bắt lỗi khi tạo WebGLRenderer và chuyển sang bàn 2D', () => {
      expect(canvas).toMatch(/try \{\s*renderer = new THREE\.WebGLRenderer/);
      expect(canvas).toContain('onUnsupported?.();');
      expect(game).toMatch(/onUnsupported=\{\(\) => \{\s*setViewMode\('2d'\)/);
    });

    it('giải phóng hình học của quân khi dựng lại thế cờ', () => {
      expect(canvas).toContain('child.geometry.dispose()');
    });
  });

  describe('probe đo đúng đại lượng, không đỏ giả', () => {
    it('mobile: so câu hỏi đã bỏ đồng hồ lesson-timer', () => {
      const src = read('qa/mobile.mjs');
      expect(src).toContain('data-testid="lesson-timer"');
      expect(src).toContain('const questionText = ()');
      expect(src).not.toMatch(/promptBefore = await page\.locator\('\[role=dialog\]'\)\.innerText/);
    });

    it('golden-path: chờ thẻ gợi ý nạp xong trước khi đọc', () => {
      const src = read('qa/golden-path.mjs');
      expect(src).toContain('data-testid="decision-engine-card"');
    });

    it('lib: dọn màn chúc mừng bằng cách CHỜ nó mount, không đếm tức thời', () => {
      // Modal lên cấp nạp lazy (src/App.tsx:80) và mở theo hiệu ứng `profile.xp`
      // (src/App.tsx:184-201): `count()` hồi trước trả 0 rồi bỏ qua, để lại overlay che
      // nút bên dưới — đúng lỗi CI đo được ở check-run 125463507371.
      const src = read('qa/lib.mjs');
      expect(src).toContain(".waitFor({ state: 'visible'");
      expect(src).not.toMatch(/if \(!\(await dialog\.count\(\)\)\) return false;/);
    });

    it('golden-path: dọn overlay lên cấp trước khi mở Đấu Trường', () => {
      const src = read('qa/golden-path.mjs');
      expect(src).toMatch(/await dismissLevelUpCelebration\(page\);\s*await openCompetitionHub\(page\);/);
    });

    it('CI: annotation kể lại lần chạy THẤT BẠI, không chạy lại probe lần hai', () => {
      // Run 41504913606 trên `8e6f9f5` (commit chỉ đổi tài liệu): bước "QA probe" failure
      // nhưng annotation in ra `QA PASS — 28 step(s), 0 errors`. Lý do: bước chẩn đoán chạy
      // lại probe từ đầu nên nó mô tả **lần thứ hai** (ăn may), còn lần đỏ thật thì mất.
      const wf = read('.github/workflows/03-qa-browser.yml');
      const diag = wf.slice(wf.indexOf('- name: Đưa lỗi probe lên annotation'));
      expect(diag).toMatch(/\[ -s probe-run\.log \]/);
      const probeStep = wf.slice(wf.indexOf('- name: QA probe'), wf.indexOf('- name: Đưa lỗi probe lên annotation'));
      expect(probeStep).toContain('| tee probe-run.log');
      expect(probeStep).toContain('PIPESTATUS[0]');
    });

    it('CI: job QA thôi continue-on-error — từ đây probe đỏ làm đỏ cả run', () => {
      // Cờ `continue-on-error: true` từng biến MỌI lần job failure thành run success
      // (phát hiện ở run 41487472845): không probe nào thật sự chặn được merge. Nó chỉ đáng
      // tồn tại trong giai đoạn chuyển tiếp, và giai đoạn đó đã khép sau ba lượt xanh liên
      // tiếp trên `main` (`2d2ca27` run 41515106575 · `c9fd2b4` run 41516820864 · `eb4b7b2`
      // run 41518983585). Test này giữ cho cờ không quay lại.
      const wf = read('.github/workflows/03-qa-browser.yml');
      const jobHeader = wf.slice(wf.indexOf('qa-smoke:'), wf.indexOf('    steps:'));
      expect(jobHeader).not.toMatch(/^\s*continue-on-error\s*:/m);
      expect(jobHeader).toContain('timeout-minutes: 25');
    });

    it('focus: nhận diện nút bài học bằng data-testid', () => {
      const src = read('qa/focus.mjs');
      expect(src).toContain('triggerTestId');
      expect(src).toContain("document.activeElement?.getAttribute('data-testid')");
    });

    it('t01b: CTA trang chủ dò theo nhãn hiện tại', () => {
      const src = read('qa/t01b-fixes.mjs');
      expect(src).toContain('Học tiếp|Bắt đầu:');
      expect(src).not.toContain('/Bản Đồ Học Tập/');
    });

    it('offline: poll trạng thái service worker thay vì đọc một lần', () => {
      const src = read('qa/offline-pwa.mjs');
      expect(src).toContain('for (let i = 0; i < 120; i += 1)');
      expect(src).toContain("reg.active.state === 'activated'");
    });

    it('p41 curriculum: chấp nhận màn kết quả còn mở sau câu cuối', () => {
      const src = read('qa/p41-curriculum-quality.mjs');
      expect(src).toContain('resultScreen');
      expect(src).toContain('!completion.lessonModalOpen || completion.resultScreen');
    });

    it('p41 font: đóng hộp mừng lên level trước khi bấm tiếp', () => {
      const src = read('qa/p41-font-visual.mjs');
      expect(src).toContain('dismissLevelUpCelebration(page)');
      expect(src).toContain('[aria-label^="Chúc mừng"]');
    });
  });

  describe('khung sân chơi GameModalWrapper không làm co hẹp trò chơi con', () => {
    const wrapper = read('src/components/games/GameModalWrapper.tsx');
    const catchGame = read('src/components/games/CatchFallingLettersGame.tsx');

    it('GameModalWrapper giữ w-full h-full ở vùng sân chơi để con không co thành sợi chỉ', () => {
      expect(wrapper).toContain('w-full flex-1 relative overflow-hidden');
      expect(wrapper).toContain('w-full h-full flex-1 min-w-0 min-h-0 flex flex-col items-center justify-center overflow-hidden');
      expect(wrapper).toContain('self-stretch');
    });

    it('CatchFallingLettersGame có min-h-[360px] và khởi tạo bóng ngay khi vào game', () => {
      expect(catchGame).toContain('min-h-[360px]');
      expect(catchGame).toContain('min-w-full self-stretch');
      expect(catchGame).toContain('setBubbles((prev) => {');
      expect(catchGame).toContain('if (prev.length > 0) return prev;');
    });
  });
});

