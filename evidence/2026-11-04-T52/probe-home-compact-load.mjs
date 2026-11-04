// T52 — "trang chủ gọn và load nhanh": đo **trước** rồi **sau** trên cùng một máy,
// cùng `dist/`, cùng hồ sơ. Không đo bằng cảm giác.
//
// Bốn nhóm số:
//   GỌN    chiều cao trang (cuộn hết bao nhiêu), số node DOM trong <main>, số mục
//           nhiệm vụ bị **lặp** (mỗi việc hiện hai lần: ô biểu tượng + danh sách),
//           và vị trí từng khối so với màn hình đầu.
//   NHANH  FCP/DCL/load, số byte JS+CSS trình duyệt thật sự tải (`transferSize`),
//           và số animation CSS chạy **vô hạn** trên Home (vẽ lại mỗi frame, tốn pin
//           trên máy yếu dù không đổi gì).
//   ĐÚNG   trang vẫn còn đủ 4 môn, 3 nhiệm vụ, nút "Học tiếp" ≥44px, không tràn ngang.
//   ẢNH    375×667 và 1280×800 để người soát nhìn được, không chỉ tin JSON.
//
// Chạy:
//   npm run build && node qa/run-one.mjs evidence/2026-11-04-T52/probe-home-compact-load.mjs
//   T52_LABEL=sau node qa/run-one.mjs evidence/2026-11-04-T52/probe-home-compact-load.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const LABEL = process.env.T52_LABEL || 'truoc';

/**
 * Ngưỡng chốt sau khi đo hiện trạng (`probe-baseline.txt`). Đặt ở đây để probe **đỏ**
 * trên bản cũ chứ không phải một công cụ chỉ biết khen.
 */
const EXPECT = {
  // Trang 375×667: bản cũ 3 781 px (5.67 màn) ⇒ 3 349 px (5.02 màn); trần chốt 3 400.
  pageHeight375: 3400,
  // Trang 1280×800: bản cũ 3 109 px ⇒ 2 665 px; trần chốt 2 700.
  pageHeight1280: 2700,
  // DOM trong <main>: bản cũ 399 node ⇒ 365 node; trần chốt 380.
  mainNodes: 380,
  // Không việc nào được hiện hai lần (ô biểu tượng + dòng danh sách).
  duplicateQuestTitles: 0,
  // Animation CSS vô hạn: bản cũ 5 (bounce, float, gradient-pan, pulse-slow, pulse-subtle)
  // ⇒ 3 (bounce, float, pulse-subtle); trần chốt 3.
  infiniteAnimations: 3,
  // Entry chunk (index-*.js) từng nằm trên đường tới first paint: bản cũ 219 963 byte,
  // bản sau 201 040 byte. Trần chốt 205 kB (209 920 byte).
  entryBytes: 209920,
};

const VIEWPORTS = [
  { name: '375', width: 375, height: 667 },
  { name: '1280', width: 1280, height: 800 },
];

const readHome = () => {
  const main = document.querySelector('main') || document.body;
  const inner = window.innerHeight;
  const nodes = main.querySelectorAll('*').length;

  // Mục nhiệm vụ: mỗi việc có tiêu đề. Bản cũ vẽ **hai lần** (ô biểu tượng cắt 10 ký tự
  // + dòng danh sách đầy đủ) ⇒ đếm text node bắt đầu bằng 8 ký tự đầu của tên việc.
  const questRows = [...main.querySelectorAll('button[aria-label^="Nhiệm vụ "]')].map((b) =>
    (b.getAttribute('aria-label') || '').replace(/^Nhiệm vụ \d: /, '').replace(/ - đã hoàn thành$/, '')
  );
  // Thẻ gợi ý của DecisionEngine **được phép** nhắc lại tên việc (đó là toàn bộ mục đích
  // của nó) ⇒ bỏ cả cây con đó khỏi phép đếm, chỉ tìm chỗ lặp trong phần nhiệm vụ.
  const decisionCard = main.querySelector('[data-testid="decision-engine-card"]');
  const textNodes = [];
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (decisionCard && decisionCard.contains(n)) continue;
    const t = n.textContent.trim();
    if (t) textNodes.push(t);
  }
  const duplicateQuestTitles = questRows.filter((title) => {
    // Bản cũ: ô biểu tượng in `title.slice(0,10) + '…'`, danh sách in tên đầy đủ ⇒ khớp **cả hai**
    // dạng. So khớp nguyên chuỗi (không so tiền tố) để hai việc cùng mở đầu "Học 2 bài"
    // không bị tính nhầm là một.
    const short = title.slice(0, 10) + '…';
    return textNodes.filter((t) => t === title || t === short).length > 1;
  });

  const animations = (document.getAnimations ? document.getAnimations() : []).filter((a) => {
    const timing = a.effect && a.effect.getTiming ? a.effect.getTiming() : null;
    return timing && timing.iterations === Infinity && a.playState === 'running';
  });

  const headings = [...main.querySelectorAll('h1, h2, h3, h4')].map((h) => ({
    text: h.textContent.trim().slice(0, 32),
    top: Math.round(h.getBoundingClientRect().top),
    visibleFirstScreen: h.getBoundingClientRect().top < inner,
  }));

  // Khối lớn nhất: đi xuống chuỗi một-con cho tới thân Home rồi đo từng con trực tiếp.
  // Không có bảng này thì "gọn hơn" chỉ là một câu nói; có nó mới biết cắt vào đâu.
  let root = main;
  while (root.children.length === 1) root = root.children[0];
  const blocks = [...root.children].map((el) => ({
    h: Math.round(el.getBoundingClientRect().height),
    text: (el.querySelector('h1,h2,h3,h4')?.textContent || el.textContent || '').trim().slice(0, 28),
  }));

  const cta = [...main.querySelectorAll('button')].find((b) =>
    /^(Học tiếp|Bắt đầu:|Đang tải)/.test((b.getAttribute('aria-label') || b.textContent || '').trim())
  );
  const subjectCards = [...main.querySelectorAll('button')].filter((b) => b.textContent.includes('Môn Học Lớp 1'));

  const paint = {};
  for (const p of performance.getEntriesByType('paint')) paint[p.name] = Math.round(p.startTime);
  const nav = performance.getEntriesByType('navigation')[0];
  let js = 0;
  let css = 0;
  const requestedChunks = [];
  let entryBytes = null;
  let entrySizes = null;
  for (const r of performance.getEntriesByType('resource')) {
    if (r.initiatorType === 'script' || /\.js(\?|$)/.test(r.name)) js += r.transferSize || 0;
    if (r.initiatorType === 'link' || /\.css(\?|$)/.test(r.name)) css += r.transferSize || 0;
    const name = r.name.split('/').pop();
    if (/\.js$/.test(name)) requestedChunks.push(name);
    // Entry là chunk `index-*.js` mà index.html nạp trực tiếp — nó chặn first paint.
    if (/^index-[^/]+\.js$/.test(name) && entryBytes === null) {
      entrySizes = {
        transferSize: r.transferSize,
        encodedBodySize: r.encodedBodySize,
        decodedBodySize: r.decodedBodySize,
      };
      // Byte **giải nén** là lượng JS máy bé phải parse trước first paint; nén gzip chỉ
      // nói về đường truyền nên không dùng làm trần.
      entryBytes = r.decodedBodySize || null;
    }
  }

  return {
    pageHeight: document.documentElement.scrollHeight,
    innerHeight: inner,
    screensOfScroll: Number((document.documentElement.scrollHeight / inner).toFixed(2)),
    mainNodes: nodes,
    duplicateQuestTitles,
    questRowCount: questRows.length,
    subjectCardCount: subjectCards.length,
    infiniteAnimations: animations.length,
    animationNames: animations.map((a) => a.animationName).sort(),
    headings,
    blocks,
    cta: cta
      ? {
          label: (cta.getAttribute('aria-label') || cta.textContent || '').trim().slice(0, 40),
          height: Math.round(cta.getBoundingClientRect().height),
        }
      : null,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
    paint,
    domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd) : null,
    load: nav ? Math.round(nav.loadEventEnd) : null,
    transferredJs: js,
    transferredCss: css,
    transferredTotal: js + css,
    requestedChunks,
    entryBytes,
    entrySizes,
  };
};

export default async function run(page, ui) {
  const out = { steps: [], errors: [], facts: {}, failedAt: null, shots: [] };
  const fail = (at, msg) => {
    out.errors.push(`${at}: ${msg}`);
    if (!out.failedAt) out.failedAt = at;
  };

  // `run-one.mjs` đã mở trang một lần trước khi gọi probe ⇒ lần nạp sau đụng cache ấm và
  // Resource Timing trả `encodedBodySize = 0`. Tắt cache qua CDP để số byte là **thật**.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });

  await page.goto(ui.origin + '/', { waitUntil: 'networkidle' });
  await dismissLevelUpCelebration(page);

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(900);
    const m = await page.evaluate(readHome);
    out.facts['vp' + vp.name] = m;

    const at = 'vp' + vp.name;
    if (m.overflowX > 0) fail(at, `tràn ngang ${m.overflowX}px`);
    if (m.subjectCardCount !== 4) fail(at, `có ${m.subjectCardCount} thẻ môn, mong 4`);
    if (m.questRowCount !== 3) fail(at, `có ${m.questRowCount} nhiệm vụ, mong 3`);
    if (m.duplicateQuestTitles.length > EXPECT.duplicateQuestTitles) {
      fail(at, `mỗi việc hiện hai lần [${m.duplicateQuestTitles.join(', ')}] ⇒ còn khối danh sách lặp`);
    }
    if (!m.cta) fail(at, 'không tìm thấy nút "Học tiếp"');
    else if (m.cta.height < 44) fail(at, `nút "${m.cta.label}" cao ${m.cta.height}px < 44px`);
    // Hộp đăng nhập chỉ mở khi ba mẹ bấm banner ⇒ mã của nó không được nằm trong
    // lượt tải đầu. Ghi lại để soát; phép **đo cứng** cho "load nhanh" là entry dưới đây.
    if (m.requestedChunks.some((c) => c.startsWith('AccountModal-'))) {
      fail(at, 'AccountModal đã tải ngay khi mở Home ⇒ chưa tách khỏi lượt tải đầu');
    }
    // Entry `index-*.js` chặn first paint: bản cũ 219 963 byte (214.8 kB) ⇒ 201 040 byte
    // (196.3 kB). Trần chốt 205 kB (209 920 byte), đo bằng `decodedBodySize` của trình duyệt.
    if (m.entryBytes === null) fail(at, 'không đọc được kích thước entry chunk từ resource timing');
    else if (m.entryBytes > EXPECT.entryBytes) {
      fail(at, `entry ${m.entryBytes} byte > ${EXPECT.entryBytes} byte ⇒ code chưa được tách khỏi lượt tải đầu`);
    }
    if (m.infiniteAnimations > EXPECT.infiniteAnimations) {
      fail(at, `${m.infiniteAnimations} animation vô hạn đang chạy [${m.animationNames.join(', ')}] ⇒ tốn frame trên máy yếu`);
    }
    if (vp.name === '375') {
      if (m.mainNodes > EXPECT.mainNodes) fail(at, `${m.mainNodes} node DOM trong <main> > ${EXPECT.mainNodes}`);
      if (m.pageHeight > EXPECT.pageHeight375) {
        fail(at, `trang cao ${m.pageHeight}px > ${EXPECT.pageHeight375}px (${m.screensOfScroll} màn) ⇒ chưa gọn`);
      }
    } else {
      if (m.pageHeight > EXPECT.pageHeight1280) {
        fail(at, `trang cao ${m.pageHeight}px > ${EXPECT.pageHeight1280}px ⇒ chưa gọn`);
      }
    }

    await page.screenshot({ path: path.join(OUT, `0${vp.name === '375' ? 1 : 2}-home-${vp.name}-${LABEL}.png`) });
    out.shots.push(`0${vp.name === '375' ? 1 : 2}-home-${vp.name}-${LABEL}.png`);
    out.steps.push({ step: at, pageHeight: m.pageHeight, mainNodes: m.mainNodes, infiniteAnimations: m.infiniteAnimations });
  }

  out.facts.label = LABEL;
  out.facts.expected = EXPECT;
  return out;
}
