# RTM — Requirements Traceability Matrix
## KHO BÁU TRI THỨC — LỚP 1 (mã tài liệu KBT-RTM-1.0)

> Ma trận hai chiều: **xuôi** (nghiệp vụ → yêu cầu → code → test → probe → gate) và
> **ngược** (test/probe → yêu cầu, để tìm thứ đang chạy mà không phục vụ yêu cầu nào).
>
> Nguyên tắc ghi: một dòng RTM chỉ được coi là **ĐẠT** khi ô Test **hoặc** Probe có thật
> và chạy được. Không có ô "sẽ test". Không có yêu cầu nào được ghi mà không trỏ file.
>
> **Ngày chốt:** 2026-10-29, đo lại 2026-10-30 sau merge `origin/main`, bổ sung tầng US/TC (§10) ngày 2026-11-02 · nguồn yêu cầu: [`SRS.md`](SRS.md) · nghiệp vụ: [`BRD.md`](BRD.md)
> · kiến trúc: [`ARCHITECTURE.md`](ARCHITECTURE.md) · ca kiểm thử: [`../plan/TEST_CASES.md`](../plan/TEST_CASES.md).

**Cột Gate:** `V` = `npm run verify` · `Q` = probe Playwright trên `dist/` (`qa/run-one.mjs`) ·
`1`/`2`/`3`/`4` = workflow `.github/workflows/01-quality.yml…04-release.yml` ·
`H` = git hook trong `scripts/hooks/`.

---

## 1. Truy vết xuôi cấp nghiệp vụ (BR → yêu cầu)

| ID nghiệp vụ | Nội dung | Yêu cầu liên quan | Bằng chứng tổng | Trạng thái |
|---|---|---|---|---|
| BG-01 | Bé tự học 15–20 phút/ngày không cần người lớn | FR-S01…S06, FR-L06…L11, FR-Y02, NFR-A03 | `qa/golden-path.mjs` (17 bước), `qa/mobile-golden.mjs` | **CHƯA ĐO ĐƯỢC** — dữ liệu nằm `localStorage`, cloud-sync là tuỳ chọn nên vẫn không có aggregate server-side (ADR-01/ADR-16) |
| BG-02 | Chỉ rõ điểm yếu theo kỹ năng | FR-L01, FR-L04…L08, FR-E07, FR-E08, FR-P07 | `tests/decision-engine.test.ts`, `tests/competition-readiness.test.ts` | ĐẠT (máy), chưa đạt (người dùng thật) |
| BG-03 | Không sai nội dung (đáp án, dấu, kiến thức) | FR-L01, FR-E01, FR-E05, NFR-C04, NFR-C05 | `tests/content-quality.test.ts`, `tests/exam-fidelity.test.ts`, `tests/math-typography.test.ts`, `tests/vietnamese-rhymes.test.ts` | ĐẠT — 0 lỗi validator, 18 WARNING đã xoá (P42/T20B) |
| BG-04 | Dùng được trên điện thoại gia đình, offline | FR-Y01, FR-Y03, FR-Y04, NFR-R01, NFR-A01…A04, FR-G09 | `qa/offline-pwa.mjs`, `qa/mobile.mjs`, `qa/responsive-a11y.mjs`, `qa/games.mjs` @195 px | ĐẠT |
| BG-05 | Phụ huynh tin về dữ liệu của con | NFR-C01, NFR-C02, NFR-C03, FR-Y07, FR-Y08, FR-P04…P06 | `tests/firebase-auth-sync.test.ts`, `tests/parent-and-demo.test.ts`, `tests/t23-mcp-servers.test.ts` | ĐẠT (máy) — chưa đóng được phần "phụ huynh hiểu đúng" vì sync mới có test mock, chưa có UI xoá dữ liệu cloud (BRD R-08) |
| BG-06 | Đổi nội dung không phá tiến độ cũ | NFR-R02, NFR-R03, NFR-R04, DC-01…DC-17 | `tests/exam-fidelity.test.ts`, `tests/t18a-motivation.test.ts`, `tests/reading-fluency.test.ts`, `tests/decision-engine-storage.test.ts` | ĐẠT |
| R-01…R-08 (rủi ro BRD) | Xem `BRD.md` §6 | NFR-M01, NFR-P01, NFR-C03, ADR-05, ADR-08 | `npm run check:budget`, `.ai/CURRENT.md`, `isDemoData` | ĐANG KIỂM SOÁT |

---

## 2. Ma trận FR → nguồn → test → probe → gate

### 2.1 FR-S — Vỏ ứng dụng

| ID | Nguồn (`file:line`) | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| FR-S01 | `src/types/index.ts:254`, `src/App.tsx` | — (typecheck) | `qa/golden-path.mjs` | V,1,2 | ĐẠT |
| FR-S02 | `src/hooks/useModalHistory.ts:20` | `tests/t01b-ui-fixes.test.ts` | `qa/focus.mjs` | V,3 | ĐẠT |
| FR-S03 | `src/components/home/HomeScreen.tsx`, DC-02 | `tests/t07-subject-path.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-S04 | `src/components/common/Header.tsx` | `tests/mobile-layout.test.ts` | `qa/responsive-a11y.mjs` | V,3 | ĐẠT |
| FR-S05 | `src/components/world/WorldMapScreen.tsx`, `src/services/levelEngine.ts` | `tests/t07-subject-path.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-S06 | `src/data/{vietnamese,math,english,life}Curriculum.ts`, `src/components/subject/SubjectScreen.tsx` | `tests/t07-subject-path.test.ts`, `tests/vietnamese-curriculum.test.ts`, `tests/math-curriculum.test.ts`, `tests/english-curriculum.test.ts`, `tests/life-curriculum.test.ts`, `tests/t41a-parent-controls.test.ts` | `qa/mobile-home.mjs`, `qa/parent-controls.mjs` | V,3 | ĐẠT |
| FR-S07 | `src/components/parent/ParentDashboardModal.tsx:135` (đáp án `gateQuestion.ans`; đề sinh tại render dòng 50–72) | `tests/parent-and-demo.test.ts`, `tests/t41f-parent-gate.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-S08 | `src/hooks/useFocusTrap.ts` | `tests/t20a-hooks-order.test.ts` | `qa/decision-engine-a11y.mjs` | V,3 | ĐẠT |
| FR-S09 | `src/data/contentSafety.ts`, `src/index.css` | `tests/p41-font-encoding.test.ts`, `tests/math-typography.test.ts` | `qa/p41-font-visual.mjs` | V,1,3 | ĐẠT |
| FR-S10 | `src/services/demoSeed.ts` | `tests/parent-and-demo.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |

### 2.2 FR-L — Học & Learning OS

| ID | Nguồn | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| FR-L01 | `src/data/competitionTaxonomy.ts` | `tests/competition-bank.test.ts` | — | V,1 | ĐẠT |
| FR-L02 | `src/components/learning/questions/*.tsx` (8 file) | `tests/lesson-matching.test.ts`, `tests/t16-math-contract.test.ts`, `tests/t29-lesson-smooth.test.ts` | `qa/lesson-types.mjs`, `qa/lesson-smooth.mjs` | V,3 | ĐẠT |
| FR-L03 | `src/services/answerCheck.ts` | `tests/answerCheck.test.ts` | `qa/lesson-types.mjs` | V,1 | ĐẠT |
| FR-L04 | `src/services/learningOS.ts` | `tests/personas-and-learning-os.test.ts`, `tests/kidbox-learning-os.test.ts`, `tests/t41b-decision-clock.test.ts` | `qa/decision-engine.mjs` | V,1 | ĐẠT |
| FR-L05 | `src/types/learningOS.ts`, DC-04 | `tests/learning-engine.test.ts` | — | V,1 | ĐẠT |
| FR-L06 | `src/services/decisionEngine.ts`, `src/config/policy.ts:146` | `tests/decision-engine.test.ts`, `tests/decision-engine-storage.test.ts`, `tests/t40-parent-facing-ids.test.ts`, `tests/t41b-decision-clock.test.ts` | `qa/decision-engine.mjs` | V,1,3 | ĐẠT |
| FR-L07 | `src/components/learning/NextBestActionCard.tsx` | `tests/personas-and-learning-os.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-L08 | `src/services/adaptive.ts`, `src/components/review/DailyReviewScreen.tsx` | `tests/learning-engine.test.ts`, `tests/date-utils.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-L09 | `src/services/adaptiveDifficulty.ts`, `src/config/policy.ts:464` | `tests/adaptive-difficulty.test.ts` | — | V,1 | ĐẠT |
| FR-L10 | `src/types/learningOS.ts:179`, `src/services/storage.ts:206` | `tests/fatigue-reset.test.ts` | — | V,1 | ĐẠT |
| FR-L11 | `src/services/sessionComposer.ts`, `src/services/storage.ts:202` | `tests/session-composer.test.ts` | `qa/lesson-types.mjs` | V,1 | ĐẠT |
| FR-L12 | `src/services/learningOS.ts` | `tests/lesson-completion.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |

### 2.3 FR-G — Trò chơi

| ID | Nguồn | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| FR-G01 | `src/data/gamesCatalog.ts:24` | `tests/games-all.test.ts`, `tests/games-content.test.ts` | `qa/games.mjs` | V,1,3 | ĐẠT |
| FR-G02 | `docs/SDLC.md` §3.1 | `tests/t23-mcp-servers.test.ts` (so 4 danh sách) | `qa/games.mjs` (`GAME_TITLES`) | V,1,3 | ĐẠT |
| FR-G03 | `src/components/games/registry.ts` (31 × `lazy`) | `tests/t02c-startup-split.test.ts`, `tests/bundle-budget.test.ts` | `qa/t02-smoke.mjs` | V,2 | ĐẠT |
| FR-G04 | `src/data/gameLevels.ts`, `src/hooks/useGameStage.ts` | `tests/t08-games-hub.test.ts`, `tests/game-content.test.ts`, `tests/t25-difficulty-ladder.test.ts` | `qa/games.mjs`, `qa/tier6-ladder-evidence.mjs` | V,3 | ĐẠT |
| FR-G05 | `src/config/policy.ts:297`, `src/data/games/*.ts` | `tests/game-content.test.ts`, `tests/t15-viet-games.test.ts`, `tests/t16-math-games.test.ts`, `tests/t17a-english-games.test.ts`, `tests/t17b-coding.test.ts`, `tests/t17b-scientist.test.ts`, `tests/t21-fun-games.test.ts`, `tests/t25-difficulty-ladder.test.ts` | `qa/games.mjs` | V,1,3 | ĐẠT |
| FR-G06 | `src/hooks/useGameStage.ts`, DC-08 | `tests/t08-games-hub.test.ts` | `qa/games.mjs` | V,3 | ĐẠT |
| FR-G07 | DC-09 (`kho_bau_game_first_seen`) | `tests/game-rewards.test.ts` | `qa/games.mjs` | V,1,3 | ĐẠT |
| FR-G08 | `src/components/games/GameModalWrapper.tsx`, `src/hooks/useFocusTrap.ts` | `tests/t01b-ui-fixes.test.ts`, `tests/t43-game-pause.test.ts` (chỉ phần **vỏ modal**: nút tạm + lớp phủ render có/không theo `isRealtime`) | `qa/focus.mjs`, `qa/kidbox-focus.mjs`, `qa/game-pause.mjs` | V,3 | ĐẠT — riêng *hành vi* tạm dừng chưa có FR, xem ghi chú sau bảng FR-G ở `SRS.md` §4.3 và dòng §10 |
| FR-G09 | `qa/games.mjs` @195 px | `tests/mobile-layout.test.ts` | `qa/games.mjs`, `qa/mobile-golden.mjs` | V,3 | ĐẠT |

### 2.4 FR-R — Luyện đọc

| ID | Nguồn | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| FR-R01 | `src/types/reading.ts` | `tests/reading-fluency.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-R02 | `src/data/readingContent.ts:280`, `:798` | `tests/reading-fluency.test.ts` | `qa/golden-path.mjs` | V,1 | ĐẠT |
| FR-R03 | `src/data/readingContent.ts:818`, `src/services/readingEngine.ts` | `tests/reading-fluency.test.ts` | — | V,1 | ĐẠT |
| FR-R04 | `src/services/readingEngine.ts`, `src/config/policy.ts:94` | `tests/reading-fluency.test.ts`, `tests/curriculum-quality-p41.test.ts`, `tests/t40-parent-facing-ids.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-R05 | `src/types/reading.ts`, DC-06 | `tests/reading-fluency.test.ts` | — | V,1 | ĐẠT |
| FR-R06 | `src/components/reading/ReadingFluencyScreen.tsx` | `tests/reading-fluency.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-R07 | `src/components/parent/ParentDashboardModal.tsx` | `tests/parent-and-demo.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |

### 2.5 FR-E — Thi thử

| ID | Nguồn | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| FR-E01 | `src/data/competitionQuestions.ts:20`, `competitionBankP36.ts`, `competitionBankTournament.ts` | `tests/competition-bank.test.ts`, `tests/competition-p36.test.ts` | `qa/question-types.mjs` | V,1,3 | ĐẠT |
| FR-E02 | `src/types/competition.ts:21`, `src/data/competitionExamFormats.ts` | `tests/exam-fidelity.test.ts` | `qa/question-types.mjs` | V,3 | ĐẠT |
| FR-E03 | `src/data/competitionBlueprints.ts:13` | `tests/exam-fidelity.test.ts` | `qa/question-types.mjs` | V,1,3 | ĐẠT |
| FR-E04 | `src/services/competitionEngine.ts:128`, `src/services/competitionQuality.ts` | `tests/exam-fidelity.test.ts:84` | `qa/question-types.mjs` | V,1 | ĐẠT (16/16 shortfall = 0) |
| FR-E05 | `src/services/competitionEngine.ts` | `tests/competition-engine.test.ts` | — | V,1 | ĐẠT |
| FR-E06 | `src/components/competition/CompetitionExamModal.tsx` | `tests/competition-engine.test.ts` | `qa/question-types.mjs` | V,3 | ĐẠT |
| FR-E07 | `src/types/competition.ts` (CompetitionExamResult) | `tests/competition-readiness.test.ts` | `qa/question-types.mjs` | V,3 | ĐẠT |
| FR-E08 | `src/types/competition.ts:123`, `src/config/policy.ts:80` | `tests/competition-readiness.test.ts` | — | V,1 | ĐẠT |
| FR-E09 | `src/config/policy.ts:53`, `src/components/competition/ReadinessView.tsx` | `tests/competition-readiness.test.ts`, `tests/exam-fidelity.test.ts` (sourceNote) | `qa/question-types.mjs` | V,1,3 | ĐẠT |
| FR-E10 | DC-05 | `tests/competition-readiness.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-E11 | `src/services/tournament.ts`, `src/data/competitionBankTournament.ts` | `tests/competition-bank.test.ts`, `tests/competition-p36.test.ts` | — | V,1 | ĐẠT |

### 2.6 FR-N — Tiếng Anh / Kid's Box / IOE

| ID | Nguồn | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| FR-N01 | `src/services/britishSpeech.ts` | `tests/voice-persona.test.ts` | `qa/audio.mjs` | V,3 | ĐẠT |
| FR-N02 | `src/config/policy.ts:445` | `tests/kidbox-activities.test.ts` | `qa/audio.mjs` | V,1 | ĐẠT |
| FR-N03 | `src/services/kidBoxEngine.ts`, `src/config/policy.ts:364` | `tests/kidbox-curriculum.test.ts`, `tests/kidbox-learning-os.test.ts` | `qa/kidbox-focus.mjs` | V,3 | ĐẠT |
| FR-N04 | `src/data/kidBoxCurriculum.ts:38`, `:87` | `tests/kidbox-curriculum.test.ts` | `qa/golden-path.mjs` | V,1 | **CHƯA ĐẠT** (0 unit — cần nguồn, ADR-15) |
| FR-N05 | `src/components/english/KidBoxActivityPlayer.tsx` | `tests/kidbox-activities.test.ts`, `tests/kidbox-bridge-practice.test.ts` | `qa/kidbox-focus.mjs` | V,3 | ĐẠT |
| FR-N06 | `src/services/englishMasteryStore.ts`, `kho_bau_ioe_store` | `tests/p32-english-mastery.test.ts`, `tests/english-ioe.test.ts` | — | V,1 | ĐẠT |
| FR-N07 | `src/data/englishCurriculum.ts:2767`, `src/data/englishSkillTaxonomy.ts:21` | `tests/english-curriculum.test.ts`, `tests/t12b-english-units.test.ts` | `qa/p41-curriculum-quality.mjs` | V,1,3 | ĐẠT |

### 2.7 FR-M — Động lực

| ID | Nguồn | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| FR-M01 | `src/services/levelEngine.ts` | `tests/t18a-motivation.test.ts`, `tests/t20a-levelup-hooks.test.tsx` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-M02 | `src/services/stickerEngine.ts`, `src/data/stickers.ts` | `tests/t18a-motivation.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-M03 | `src/services/shopEngine.ts`, `src/data/shopCatalog.ts` | `tests/t14c-logic.test.ts`, `tests/t14c-storage.test.ts` | — | V,1 | ĐẠT |
| FR-M04 | `src/services/questEngine.ts`, `src/data/questPool.ts` | `tests/t14c-logic.test.ts`, `tests/date-utils.test.ts` | — | V,1 | ĐẠT |
| FR-M05 | `src/services/streakEngine.ts` | `tests/t18a-motivation.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-M06 | `src/services/achievementEngine.ts`, `src/data/achievementCatalog.ts` | `tests/t01-achievements.test.ts` | `qa/t01-hotfix.mjs` | V,3 | ĐẠT |
| FR-M07 | `src/components/achievements/AchievementsGardenScreen.tsx`, DC-13 | `tests/t14c-storage.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-M08 | `src/components/motivation/GachaMachineScreen.tsx` | — | `qa/golden-path.mjs` | V,3 | ĐẠT (probe-only) |
| FR-M09 | `src/services/sound.ts`, `src/services/questionAudio.ts` | `tests/question-audio-routing.test.ts` | `qa/audio.mjs` | V,3 | ĐẠT |
| FR-M10 | `src/services/praiseEngine.ts`, `src/data/contentSafety.ts` | `tests/praise-engine.test.ts`, `tests/content-quality.test.ts`, `tests/content-validator-t02c.test.ts`, `tests/t02d-content-fixes.test.ts` | `qa/p41-curriculum-quality.mjs` | V,1,3 | ĐẠT |

### 2.8 FR-P — Phụ huynh

| ID | Nguồn | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| FR-P01 | `src/components/parent/ParentDashboardModal.tsx`, `src/services/rewardLabels.ts` | `tests/parent-and-demo.test.ts`, `tests/t40-parent-facing-ids.test.ts`, `tests/t41a-parent-controls.test.ts` | `qa/golden-path.mjs`, `qa/parent-controls.mjs` | V,3 | ĐẠT |
| FR-P02 | `src/components/parent/ScreenTimeModal.tsx` | `tests/t01b-ui-fixes.test.ts` | `qa/focus.mjs` | V,3 | ĐẠT |
| FR-P03 | DC-10, `src/services/storage.ts` | `tests/t14c-storage.test.ts` | — | V,1 | ĐẠT |
| FR-P04 | `src/services/storage.ts` (export JSON) | `tests/parent-and-demo.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-P05 | `src/services/storage.ts` (import) | `tests/parent-and-demo.test.ts` | — | V,1 | ĐẠT |
| FR-P06 | `src/components/parent/ParentDashboardModal.tsx`, `src/services/storage.ts` (`resetProgress` + allowlist `RESET_KEEP_KEYS`) | `tests/parent-and-demo.test.ts`, `tests/t43a-reset-progress-sweeps-child-data.test.ts` | `evidence/2026-11-03-T43/probe-t43-reset.mjs` (probe bằng chứng, không đặt trong `qa/` ⇒ không lọt vào số probe 30) | V,3 | ĐẠT |
| FR-P07 | `src/components/parent/ParentDashboardModal.tsx:850` (`{row.accuracy}% / chuẩn {row.gate}%`), `src/services/competitionQuality.ts` | `tests/competition-readiness.test.ts` | `qa/golden-path.mjs` | V,3 | ĐẠT |
| FR-P08 | `src/components/parent/KidBoxParentPanel.tsx` | `tests/kidbox-bridge-practice.test.ts` | `qa/kidbox-focus.mjs` | V,3 | **CHƯA ĐẠT** (phụ thuộc FR-N04) |

### 2.9 FR-Y — Hệ thống

| ID | Nguồn | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| FR-Y01 | `public/manifest.webmanifest`, `public/icon-*.png` | — | `qa/offline-pwa.mjs` | V,2,3 | ĐẠT (probe-only) |
| FR-Y02 | `src/hooks/useSpeak.ts`, `src/services/britishSpeech.ts`, `src/services/speechText.ts` | `tests/voice-persona.test.ts`, `tests/question-audio-routing.test.ts`, `tests/t24-speech-math-operators.test.ts` | `qa/audio.mjs` | V,3 | ĐẠT |
| FR-Y03 | `src/services/pwa.ts`, `public/sw.js`, `scripts/sw-precache.mjs` | `tests/pwa.test.ts`, `tests/sw-precache.test.ts` | `qa/offline-pwa.mjs` | V,1,2,3 | ĐẠT |
| FR-Y04 | `public/sw.js` (cache không chứa dữ liệu bé) | `tests/sw-precache.test.ts` | `qa/offline-pwa.mjs` | V,3 | ĐẠT |
| FR-Y05 | `src/components/system/UpdateBanner.tsx` | `tests/pwa.test.ts` | `qa/offline-pwa.mjs` | V,3 | ĐẠT |
| FR-Y06 | `src/index.css`, `public/fonts` | `tests/p41-font-encoding.test.ts` | `qa/p41-font-visual.mjs` | V,3 | ĐẠT |
| FR-Y07 | `src/App.tsx` (@vercel/analytics mặc định) | `tests/firebase-auth-sync.test.ts` | `qa/t02-smoke.mjs` (network) | V,1 | ĐẠT |
| FR-Y08 | `src/services/firebase.ts:82`, `src/components/auth/AccountModal.tsx` | `tests/firebase-auth-sync.test.ts:86` (offline khi chưa đăng nhập) | `qa/golden-path.mjs` | V,1 | ĐẠT |
| FR-Y09 | `src/services/cloudMerge.ts:171` (luật hợp nhất thuần), `src/services/cloudSync.ts:228` (kéo + gộp + đẩy), `:20` (chỉ theo dõi auth khi máy từng đăng nhập), `firestore.rules` | `tests/firebase-auth-sync.test.ts`, `tests/t41d-cloud-merge.test.ts` (28), `tests/t41d-cloud-sync-race.test.ts` (12) — đều mock | — | V,1 | ĐẠT MỘT PHẦN — chưa test với project Firebase thật, chưa có UI xoá dữ liệu cloud |

### 2.10 FR-C — Cờ tướng

| ID | Nguồn | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| FR-C01 | `src/components/learning/cotuong/CotuongBoard3D.tsx` (CSS transform, không import `three`) | `tests/cotuong-engine.test.ts` | `qa/golden-path.mjs` | V,1 | ĐẠT |
| FR-C02 | `src/components/learning/cotuong/CotuongBoard3D.tsx`, `src/index.css` (`.ct-piece*`) | `tests/cotuong-engine.test.ts`, `tests/t30-cotuong-piece-depth.test.ts` | `qa/cotuong-depth.mjs` | V,1,3 | ĐẠT |
| FR-C03 | `src/components/learning/cotuong/cotuongEngine.ts` | `tests/cotuong-engine.test.ts` | — | V,1 | ĐẠT |
| FR-C04 | `src/components/learning/cotuong/cotuongEngine.ts` | `tests/cotuong-engine.test.ts` (mã, tượng, pháo, tốt, tướng đối mặt, tự bỏ chiếu, `applyMove`) | — | V,1 | ĐẠT |
| FR-C05 | `src/components/learning/chess/ChessTutorial.tsx`, `ChessMoveDemo.tsx` | — | `qa/golden-path.mjs` | V,3 | ĐẠT (probe-only) |
| FR-C06 | `src/components/learning/chess/chess3d/Chess3DCanvas.tsx`, `pieceGeometries.ts`, `boardBuilder.ts`, `src/App.tsx:20` (lazy) | `tests/chess-3d.test.ts` (mesh 12 quân có shadow, 64 ô + hitbox, marker, đi nước mở đầu với engine) | `qa/games.mjs` | V,1,2 | ĐẠT |

---

## 3. Ma trận NFR

| ID | Nguồn | Test | Probe | Gate | Trạng thái |
|---|---|---|---|---|---|
| NFR-P01 | `scripts/check-bundle-budget.mjs` (`MAIN_CHUNK_BUDGET_BYTES`) + trần boot graph 500 kB (`tests/t39-first-load-graph.test.ts`) | `tests/bundle-budget.test.ts`, `tests/t39-first-load-graph.test.ts` | — (bằng chứng trình duyệt chạy bằng script tạm ngoài `qa/`, catalog vẫn là 30 probe) | V,2 | ĐẠT — entry 211.2 kB / 600 kB và **dưới mục tiêu 450 kB từ T39**; boot graph 425.5 kB; `three-vendor` 572.6 + `firebase-vendor` 723.0 ở ngoài entry, có gate riêng bằng ADR-17 |
| NFR-P02 | `src/components/games/registry.ts` | `tests/t02c-startup-split.test.ts` | `qa/t02-smoke.mjs` | V,2 | ĐẠT |
| NFR-P03 | `src/components/learning/cotuong/cotuongEngine.ts` (node budget) | `tests/cotuong-engine.test.ts` | — | V,1 | ĐẠT |
| NFR-P04 | `src/config/policy.ts:297` | `tests/game-content.test.ts` | — | V,1 | ĐẠT |
| NFR-A01 | `src/hooks/useFocusTrap.ts` | `tests/t01b-ui-fixes.test.ts` | `qa/focus.mjs`, `qa/kidbox-focus.mjs`, `qa/decision-engine-a11y.mjs` | V,3 | ĐẠT |
| NFR-A02 | `src/hooks/useSpeak.ts` | `tests/voice-persona.test.ts` | `qa/audio.mjs` | V,3 | ĐẠT |
| NFR-A03 | `src/components/ui/KidButton.tsx`, `qa/question-types.mjs` | `tests/lesson-matching.test.ts` | `qa/question-types.mjs`, `qa/responsive-a11y.mjs` | V,3 | ĐẠT |
| NFR-A04 | `src/index.css:414` (`@media (prefers-reduced-motion: reduce)`) | — | `qa/responsive-a11y.mjs` | V,3 | ĐẠT (probe-only) |
| NFR-A05 | `docs/P31_PERFORMANCE_ACCESSIBILITY.md` | — | `qa/responsive-a11y.mjs` | V,3 | ĐẠT (probe-only) |
| NFR-R01 | `public/sw.js`, `src/services/pwa.ts` | `tests/pwa.test.ts` | `qa/offline-pwa.mjs` | V,2,3 | ĐẠT |
| NFR-R02 | `src/services/storage.ts:128`, `:191` | `tests/exam-fidelity.test.ts`, `tests/t18a-motivation.test.ts`, `tests/reading-fluency.test.ts`, `tests/t40-parent-facing-ids.test.ts` | — | V,1 | ĐẠT |
| NFR-R03 | `src/services/storage.ts:276` (`readJSONObject`) | `tests/decision-engine-storage.test.ts`, `tests/kidbox-learning-os.test.ts` | — | V,1 | ĐẠT |
| NFR-R04 | `src/services/storage.ts`, `src/services/learningOS.ts` | `tests/lesson-completion.test.ts`, `tests/game-rewards.test.ts`, `tests/personas-and-learning-os.test.ts` | `qa/games.mjs` | V,1,3 | ĐẠT |
| NFR-C01 | `src/services/storage.ts` (nguồn thật), `src/services/cloudSync.ts:20` (chỉ sync khi đã đăng nhập), `firestore.rules` | `tests/firebase-auth-sync.test.ts`, `tests/t41d-cloud-sync-race.test.ts` | `qa/offline-pwa.mjs` | V,1 | ĐẠT (mặc định) — phần cloud mirror mới đạt một phần, xem FR-Y09 |
| NFR-C02 | `.gitignore` (`progress/`) | `tests/t23-mcp-servers.test.ts` | — | V,1,H | ĐẠT |
| NFR-C03 | `mcp/sample-export.json` (`isDemoData`), `src/services/demoSeed.ts` | `tests/t23-mcp-servers.test.ts`, `tests/parent-and-demo.test.ts` | `qa/golden-path.mjs` | V,1 | ĐẠT |
| NFR-C04 | `src/data/contentSafety.ts` | `tests/content-quality.test.ts`, `tests/praise-engine.test.ts` | `qa/p41-curriculum-quality.mjs` | V,1,3 | ĐẠT |
| NFR-C05 | `src/data/competitionBlueprints.ts:10` (`ORIGINAL_SOURCE_NOTE`) | `tests/exam-fidelity.test.ts` | `qa/question-types.mjs` | V,1 | ĐẠT |
| NFR-C06 | `docs/P27_5_EXAM_FIDELITY.md`, `src/data/competitionQuestions.ts` | `tests/competition-bank.test.ts` | — | V,1 | ĐẠT |
| NFR-M01 | `package.json` (`verify`, `verify:quick`) | — | — | V,H,1,2 | ĐẠT |
| NFR-M02 | `src/config/policy.ts` (17 export, có rationale) | test theo từng policy block | — | V,1 | ĐẠT |
| NFR-M03 | ADR-03; `src/services/answerCheck.ts` | `tests/answerCheck.test.ts`, `tests/competition-engine.test.ts` | `qa/question-types.mjs` | V,1 | ĐẠT |
| NFR-M04 | `tests/` naming | 120 file / 1508 test | — | V,H,1 | ĐẠT |
| NFR-M05 | `package.json` (8 runtime deps; `@types/three` sai chỗ — nợ #8 ARCHITECTURE §13) | `tests/t23-mcp-servers.test.ts` | — | V,H,1 | ĐẠT |
| NFR-M06 | `mcp/lib/server.mjs` | `tests/t23-mcp-servers.test.ts` | — | V,1 | ĐẠT |

---

## 4. Truy vết ngược: DC → nguồn

| ID | Key / đối tượng | Nơi khai báo | Pipeline đọc/ghi | Test |
|---|---|---|---|---|
| DC-01 | nguyên tắc mọi store | `src/services/storage.ts:276`, `:295` | `readJSONObject` → migrate → sanitize → default | `tests/decision-engine-storage.test.ts` |
| DC-02 | `kho_bau_child_profile` | `src/services/storage.ts:61` | StorageService | `tests/t07-subject-path.test.ts` |
| DC-03 | `kho_bau_game_progress` | `:71`, `GAME_PROGRESS_SCHEMA_VERSION:102` | StorageService | `tests/game-rewards.test.ts`, `tests/t08-games-hub.test.ts` |
| DC-04 | `kho_bau_learning_os_store` | `:67` | `createEmptyLearningOSStore:157` | `tests/t18a-motivation.test.ts`, `tests/fatigue-reset.test.ts` |
| DC-05 | `kho_bau_competition_history` | `:66` | StorageService | `tests/competition-readiness.test.ts` |
| DC-06 | `kho_bau_reading_store` | `:68`, đọc `:501` | StorageService | `tests/reading-fluency.test.ts` |
| DC-07 | `kho_bau_motivation` | `:81`, ghi `:1350` | StorageService | `tests/t18a-motivation.test.ts` |
| DC-08 | `kho_bau_game_nonce` | `:73` | StorageService | `tests/t08-games-hub.test.ts` |
| DC-09 | `kho_bau_game_first_seen` | `:75` | StorageService | `tests/game-rewards.test.ts` |
| DC-10 | `kho_bau_parent_settings` | `:63` | StorageService | `tests/t14c-storage.test.ts` |
| DC-11 | `kho_bau_analytics` | `:62` | StorageService | `tests/parent-and-demo.test.ts` |
| DC-12 | `kho_bau_achievements` | `:64` | StorageService | `tests/t01-achievements.test.ts` |
| DC-13 | `kho_bau_tree_water` | `:78` | StorageService | `tests/t14c-storage.test.ts` |
| DC-14 | `kho_bau_daily_quests` | `:65` | StorageService | `tests/t14c-logic.test.ts` |
| DC-15 | `kho_bau_english_mastery_store` / `kho_bau_kidbox_store` | `:69`, `:70` | `englishMasteryStore.ts`, `kidBoxStore.ts` | `tests/p32-english-mastery.test.ts`, `tests/kidbox-learning-os.test.ts` |
| DC-16 | `kho_bau_review_days` | `:72`, đọc `:1996` | StorageService | `tests/t14c-logic.test.ts` |
| DC-17 | `kho_bau_ioe_store` **(ngoài registry)** | `src/components/learning/englishIoe/EnglishIoeScreen.tsx:6` | `localStorage` trực tiếp | `tests/english-ioe.test.ts` — **LỖ HỔNG thiết kế**, xem `TASK_PLAN.md` EP-B3 |

---

## 5. Ma trận CI → yêu cầu

| Workflow | Chạy gì | Bảo vệ yêu cầu | Nếu đỏ thì không được |
|---|---|---|---|
| `01-quality.yml` | `npm ci` → `typecheck` → `test:ci` | NFR-M01, và mọi FR có ô Test | merge PR |
| `02-build-artifact.yml` | `npm run build` → `check:budget` → upload `dist/` | NFR-P01, NFR-P02, FR-G03, FR-Y01 | có artifact để QA |
| `03-qa-browser.yml` | download `dist/` → `playwright install chromium` → `node qa/run-one.mjs <probe>` | mọi ô Probe (NFR-A01…A05, FR-Y03, FR-G08/G09…) | release |
| `04-release.yml` | tag `vX.Y.Z` → `npm run verify` → `scripts/release-notes.mjs` → zip + GitHub Release | Business DoD (BRD §8) | phát hành |
| `scripts/hooks/pre-commit` | typecheck + chặn `.env*` | NFR-C01, NFR-M01 | commit |
| `scripts/hooks/commit-msg` | Conventional Commits | quy trình §4 `AGENTS.md` | commit |
| `scripts/hooks/pre-push` | `verify:quick` | NFR-M01 | push |

---

## 6. Ma trận ngược: probe → yêu cầu (tìm probe không chủ đích)

| Probe | Phục vụ | Ghi chú |
|---|---|---|
| `qa/golden-path.mjs` | BG-01…BG-06, FR-S01/03/05/07/10, FR-L07/08/12, FR-R01/R02/R04/R06/R07, FR-M01/02/05/07/08, FR-P01/04/06/07, FR-Y08, FR-C01/C05 | probe chính, bắt buộc xanh trước release |
| `qa/responsive-a11y.mjs` | BG-04, NFR-A03/A04/A05, FR-S04 | 6 viewport + a11y + reduced motion |
| `qa/games.mjs` | FR-G01…G09, NFR-R04 | 31 game, thưởng đúng 1 lần/vòng, @195 px |
| `qa/focus.mjs` | NFR-A01, FR-S02, FR-G08, FR-P02 | trap + restore |
| `qa/offline-pwa.mjs` | BG-04/BG-05, NFR-R01, FR-Y01/Y03/Y04/Y05 | cache-wipe survival, icon decode |
| `qa/audio.mjs` | NFR-A02, FR-M09, FR-N01/N02, FR-Y02 | chống stacked utterance, cổng autoplay, **phép tính `+ − =` đọc thành lời** (`mathOperatorsSpoken`: văn bản thật vào `SpeechSynthesisUtterance`) |
| `qa/mobile.mjs` | BG-04, FR-S03/04 | 4 viewport + xoay + resume |
| `qa/mobile-golden.mjs` | BG-01, BG-04, FR-G09 | 7 chặng @390 px và @195 px, XP giữ nguyên |
| `qa/mobile-home.mjs` | FR-S03, FR-S06 | mànHome trên mobile |
| `qa/kidbox-focus.mjs` | FR-G08, FR-N05, FR-P08 | activity player Kid's Box |
| `qa/lesson-types.mjs` | FR-L02, FR-L03, FR-L11 | 8 kiểu câu hỏi bài học |
| `qa/question-types.mjs` | FR-E02…E09, NFR-A03, NFR-M03 | 7 dạng bài thi, mọi dạng trả lời + chấm được |
| `qa/decision-engine.mjs` | FR-L06 | NBA trên build thật |
| `qa/decision-engine-a11y.mjs` | FR-S08, NFR-A01 | focus + semantics của NBA |
| `qa/p41-curriculum-quality.mjs` | NFR-C04, FR-M10, FR-N07 | chất lượng nội dung |
| `qa/p41-font-visual.mjs` | FR-S09, FR-Y06 | font/dấu không vỡ |
| `qa/p38-browser-probe.cjs` | FR-Y03 (history P38) | probe legacy, vẫn chạy được |
| `qa/t01-hotfix.mjs` | FR-M06 | achievements |
| `qa/t01b-fixes.mjs` | FR-S02, FR-G08, FR-P02 | UI fixes |
| `qa/t02-smoke.mjs` | NFR-P02, FR-Y07 | startup split + network sạch |
| `qa/parent-controls.mjs` | FR-P01, FR-S06, NFR-M04 | quyền ba mẹ trên build thật: công tắc thưởng chặn tiêu sao, màn kết quả không hứa Sao/XP/Vé, CTA mở thẳng bài gợi ý, "Vì sao gợi ý này?" → tab Phân Tích |
| `qa/game-pause.mjs` | **KBT-ISSUE-43** (chưa có FR — ứng viên `FR-G10`), FR-G08 (vỏ modal), NFR-A03/NFR-A05 (nhãn + icon, vùng chạm) | 5 game trên `dist/` @390×844: 0 nút cho trò không đồng hồ, 4 bóng đứng nguyên khi tạm, chạm bóng lúc tạm không ăn điểm (kèm **đối chứng** cùng cú chạm lúc đang chạy xoá bóng), đường đếm ngược của Đường Đua đóng băng rồi chạy lại |
| `qa/lib.mjs`, `qa/run-one.mjs` | (hạ tầng, không phải probe) | runner + helper |

**Kết luận truy vết ngược:** không có probe nào không phục vụ yêu cầu; mỗi probe đều có chủ
đích ở bảng trên.

---

## 7. Ma trận ngược: test không phục vụ yêu cầu nào?

120 file test đều nằm trong ít nhất một dòng §2 hoặc §3 ở trên (mới nhất: `tests/t47g-wrong-turn-visual.test.ts` (6) → NFR-A05 + FR-G03 (`AGENTS.md` §3: mọi lượt đúng/sai có phản hồi âm thanh **+ hình ảnh** — đo được 30 file bật `sound.playWrong()` nhưng chỉ 16 file báo `reportWrong()` cho wrapper, nên 14 trò còn lại phải truyền `mistakes={stage.mistakesInTier}`); rồi `tests/t47f-restart-resets-board.test.ts` (5) → FR-G04 + FR-G08 (bấm "Chơi lại" **cùng màn** phải dựng lại đúng những gì bé nhìn/nghe — deps của hiệu ứng khởi tạo bảng chơi phải có `stage.nonce`, vì `tier`/`roundIdx` không đổi) + FR-G05 (`onRestart` phải nhận `targetTier` để bảng "Chọn Màn & Độ Khó" về được màn dễ hơn trên **mọi** trò, kể cả trò có wrapper riêng); rồi năm file T47 — `tests/t47a-escape-resumes-pause-veil.test.ts` → NFR-A01 + FR-G08 (mọi lớp phủ đang mở phải nhận `Esc` trước, tấm che "Đang tạm dừng" mở khoá chứ không xoá ván); `tests/t47b-unlimited-daily-budget.test.ts` → FR-P03 (giá trị "Không giới hạn" của ba mẹ không bị ép thành 20 phút) + FR-S07; `tests/t47c-parent-settings-broadcast.test.ts` → FR-P03 + FR-Y09 (quyền kiểm soát của ba mẹ phải tới được cloud, tức ghi qua `writeJSON` để phát `kho_bau_storage_change`); `tests/t47d-weekly-challenge-zero-reward-row.test.ts` → FR-M06 (lịch sử phần thưởng chỉ ghi phần thưởng thật); `tests/t47e-tier-picker-easier.test.ts` → FR-G04 + FR-G05 (chọn màn phải đưa bảng về **đúng** màn bé bấm, kể cả màn dễ hơn); trước đó: ba file T46 — `tests/t46a-header-greeting.test.ts` → NFR-A05 + `AGENTS.md` §3 (lời chào theo giờ phải tới được cả bé đã có streak, lời khen chỉ là phụ); `tests/t46b-speaker-button-name.test.ts` → NFR-A05 (mọi nút icon-only trong `src/components/games/**` phải có `aria-label` hoặc `title`); `tests/t46c-escape-closes-overlay-first.test.ts` → NFR-A01 (Esc đối xử với lớp phủ như dialog lồng nhau); trước đó: năm file T45 — `tests/t45a-gacha-parent-limit.test.ts` → FR-P03 (cài đặt trong `kho_bau_parent_settings` phải được tôn trọng thật, 0 = không giới hạn chứ không phải 5) + FR-M08; `tests/t45b-rewards-off-competition.test.ts` → FR-M01 + FR-M06 — cờ "Tắt phần thưởng" phải chặn **mọi** đường cộng XP/Sao, kể cả thi đấu và thành tựu, trong khi dữ liệu học vẫn lưu; `tests/t45c-screen-time-parent-gate.test.ts` → FR-P02 + FR-S07 — bé không được tự nới giờ học, mọi đường tăng `dailyLimitMinutes` phải đi qua cổng ba mẹ; `tests/t45d-overlay-blocks-keyboard.test.ts` → FR-G08 — **chưa có FR nào** phát biểu "bàn phím phải bị chặn khi một lớp phủ đang che bảng chơi", ánh xạ gần nhất là NFR-A01 (thao tác bàn phím) + `AGENTS.md` §3; `tests/t45e-weekly-challenge-rotation.test.ts` → FR-M05 + FR-M06 — id Thử Thách Tuần phải đổi theo tuần thì điều kiện "3 tuần" của thành tựu mới đạt được; trước đó: năm file T44 — `tests/t44a-storage-key-coverage.test.ts` → FR-P06 + NFR-R04 (mọi key dữ liệu bé phải khai báo trong `STORAGE_KEYS`, nên `resetProgress` không thể sót); `tests/t44b-exercise-selection-seeded.test.ts` → FR-G06 + FR-L04 — **chưa có FR nào** phát biểu "đề phải tất định theo `(tier, seed)` ngoài đường xáo đề", ánh xạ gần nhất là ràng buộc bất biến ở `AGENTS.md` §2; `tests/t44c-ui-label-language.test.ts` → NFR-A01 — **chưa có FR/NFR nào** phát biểu "nhãn hiển thị cho bé toàn tiếng Việt có dấu", nguồn quy tắc là `AGENTS.md` §3; `tests/t44d-tap-targets.test.ts` → NFR-A01 + FR-G09 — cỡ nút ≥ 44px cũng chỉ nằm ở `AGENTS.md` §3, và hai hợp đồng mới ở đây là những đích **chỉ probe render thấy** (dải "Màn {tier} ▾" 152×14 và hai nút loa icon-only); `tests/t44e-wrong-answer-feedback.test.ts` → FR-G04 + NFR-R04 — lượt sai phải có **lý do** bằng chữ + tiếng, và điều khiển khoá phải dùng `aria-disabled` để lời giải thích tới được; trước đó: bảy file T42 — `tests/t42a-tier-picker-honest.test.ts` → FR-G04 (6 bậc) + FR-M01 (XP/sao không tự tăng) + NFR-R04; `tests/t42b-listen-pick-answer.test.ts` → FR-G04 (đáp án phải nằm trong tập phương án); `tests/t42c-focus-trap-typing.test.ts` → NFR-A01 + FR-G08 (bẫy focus không cướp con trỏ khi bé đang gõ); `tests/t42d-corrupt-storage-guard.test.ts` → NFR-R04 (một phần tử hỏng không xoá cả danh sách ôn); `tests/t42e-resource-touch-clock.test.ts` → FR-Y09 + NFR-C01 (luật đồng hồ `stateTouchedAt` khi hợp nhất cloud); `tests/t42f-digit-lesson-no-carry.test.ts` → FR-L02 — **chưa có FR nào** phát biểu "cộng/trừ lớp 1 không nhớ/không mượn" nên đây là ánh xạ gần nhất; nợ ghi ở `docs/plan/TASK_PLAN.md` §"Hệ quả chưa đóng"; `tests/t42g-late-state-timers.test.ts` → FR-G06 + NFR-R04 (đề và hẹn giờ dựng lại ở thì render, không kẹt state cũ); trước đó: `tests/t41d-cloud-merge.test.ts` + `tests/t41d-cloud-sync-race.test.ts` → FR-Y09/NFR-C01/A-03 (phép hợp nhất hồ sơ cloud không in tài nguyên, không bỏ hồ sơ demo vào tài khoản thật, và kết quả của phiên đăng nhập cũ không được ghi lên phiên mới); `tests/t41f-parent-gate.test.ts` → FR-P01/NFR-M04 (cổng phụ huynh phải có đề ngay khung hình đầu) + NFR-U01 (probe không tin một lần đọc); `tests/chess-engine-performance.test.ts` (merge `09511d3`) → FR-C06 + NFR-P01 — tên file không theo quy ước `t<NN>-…`, nợ ghi ở §10; `tests/t43-game-pause.test.ts` → FR-G08 + KBT-ISSUE-43 (`docs/issues/43-game-pause.md`), đã ghi ở §6 và §10; `tests/t41c-idempotency.test.ts` → NFR-R04/FR-G04/FR-R05; `tests/t41b-decision-clock.test.ts` → FR-L04/FR-L06; `tests/t41a-parent-controls.test.ts` → FR-P01/FR-S06/NFR-M04; `tests/t40-parent-facing-ids.test.ts` → FR-P01/FR-L06/FR-R04/NFR-R02/NFR-M04; `tests/t39-first-load-graph.test.ts` → NFR-P01/NFR-C01/NFR-M04 + ADR-18; `tests/t38-webgl-fallback.test.ts` → FR-C06/NFR-U01/NFR-M04; `tests/t34-chess-real-set.test.ts` → FR-C06; `tests/t33-feedback-timers.test.ts` → FR-G04/NFR-U01/NFR-M04; `tests/t32-game-stage-reset.test.ts` → FR-G04/NFR-U01/NFR-M04; `tests/chess-3d.test.ts` → FR-C06; `tests/t31-bug-hunt-fixes.test.ts` → FR-C06/NFR-U01/NFR-M04; `tests/firebase-cloud-sync.test.ts` đổi tên thành `tests/firebase-auth-sync.test.ts` → FR-Y08/Y09/NFR-C01; `tests/t24-speech-math-operators.test.ts` → FR-Y02; `tests/t25-difficulty-ladder.test.ts` → FR-G04/G05; `tests/t26-cotuong-puzzles.test.ts` → FR-C06; `tests/t27-lesson-engagement.test.ts` → FR-M01/FR-S08; `tests/t28-ui-polish.test.ts` → NFR-U01/NFR-M04; `tests/t29-lesson-smooth.test.ts` → FR-L02/NFR-M04; `tests/t30-cotuong-piece-depth.test.ts` → FR-C02), **ngoại trừ** các file sau —
chúng bảo vệ *chất lượng nền* chứ không bảo vệ một FR riêng lẻ:

| File | Vai trò thật |
|---|---|
| `tests/bundle-budget.test.ts` | đã ánh xạ NFR-P01 — không phải orphan |
| `tests/t23-mcp-servers.test.ts` | đã ánh xạ NFR-M02/M05/M06, FR-G02 — không phải orphan |
| `tests/date-utils.test.ts` | nền tảng dùng bởi FR-L08 + FR-M04 (không có FR riêng) |
| `tests/t20a-hooks-order.test.ts`, `tests/t20a-levelup-hooks.test.tsx` | quy tắc React (hooks order) — phục vụ FR-S08, FR-M01 |

→ **0 test mồ côi.** Nếu một ngày thêm test không khớp dòng nào, đó là dấu hiệu yêu cầu
chưa được ghi vào SRS (phải thêm FR hoặc xoá test).

---

## 8. Tổng kết độ phủ

| Hạng | Số | Độ phủ |
|---|---|---|
| FR | 88 | **86 ĐẠT** · 1 ĐẠT MỘT PHẦN (FR-Y09 — cloud mirror đã có 40 test T41D nhưng **toàn bộ chạy trên Firestore giả lập**; chưa có project Firebase thật / emulator để chứng minh `firestore.rules` chặn đọc-ghi chéo, xem `HARNESS.md` H-3) · 2 CHƯA ĐẠT (FR-N04, FR-P08 — cùng một nguyên nhân: thiếu nguồn giáo trình) |
| FR có bằng chứng tự động (`tests/`) | 82/88 | 7 FR chỉ có probe (`FR-Y01`, `FR-M08`, `FR-C05`, `FR-S01`, `NFR-A04/A05`…) |
| NFR | 25 | 24 ĐẠT · 1 đạt một phần (NFR-P01: entry **209.9 kB** đã dưới mục tiêu 450 kB từ T39 và trần boot graph 500 kB **đã** vào `verify` nhờ `tests/t39-first-load-graph.test.ts` — đo 424.3 kB; vẫn giữ "một phần" vì `check:budget` — gate riêng — mới chỉ đo entry, chưa đo boot graph, và catalogue vẫn prefetch cả bốn môn sau first paint, nợ #2 `ARCHITECTURE.md` §13) |
| DC | 19 | 19 có nguồn (`STORAGE_KEYS` 17 + 2 key cục bộ) · **2 lỗ hổng thiết kế**: DC-17 `kho_bau_ioe_store` và DC-19 `kho_bau_cloud_session_hint` nằm ngoài registry |
| Probe | 30 | 30/30 có chủ đích (29 `.mjs` + 1 `.cjs`, trừ `lib.mjs`/`run-one.mjs`) |
| Test file | 92 | 92/92 có ánh xạ (`firebase-auth-sync` đổi tên từ `firebase-cloud-sync`; `t40-parent-facing-ids`, `t41a`, `t41b`, `t41c`, `t41d-cloud-merge`, `t41d-cloud-sync-race` thêm mới) |
| US (tầng câu chuyện, §10) | 5 | 5/5 có AC 3 nhánh — **chỉ phủ lát cắt chống ghi trùng**; 83 FR còn lại chưa có US |
| TC (§10 → `TEST_CASES.md`) | 29 | 29 Pass · 0 Fail · 0 Blocked · 0 NotRun trong lát cắt; 2 TC đã chứng minh bắt được lỗi bằng ablation |
| Yêu cầu **không đo được** | 1 | BG-01 (cần telemetry thật — bị chặn bởi ADR-01, không phải lỗi code) |

## 9. Cách cập nhật tài liệu này

1. Thêm FR/NFR/DC trong `SRS.md` ⇒ **bắt buộc** thêm dòng RTM trong cùng PR.
   Khi đóng một lát cắt (hành trình dọc có bằng chứng) ⇒ thêm US + TC vào §10 và
   `docs/plan/TEST_CASES.md` rồi mới được chuyển trạng thái sang ĐẠT.
2. Xoá tính năng trong code ⇒ xoá dòng RTM và dòng SRS (giữ lại lịch sử ở `CHANGELOG.md`).
3. Một dòng RTM chỉ chuyển sang ĐẠT khi output lệnh thật được dán vào PR/Issue —
   không dựa vào số liệu MCP (`AGENTS.md` §1.7, docs/SDLC.md §10).
4. Số liệu kiểm kê (31 game / 475 câu / 1327 test / entry 209.9 kB + boot graph 424.3 kB…) chỉ được sửa khi vừa đo lại
   bằng `npx vitest run`, `npm run check:budget` hoặc `ls`.
5. **Lệch đã biết, chưa sửa:** `SRS.md` có **89** dòng `FR-…` (`grep -cE '^\| FR-[A-Z]+[0-9]+ \|' docs/specs/SRS.md`)
   trong khi hơn mười chỗ khác vẫn ghi "88 FR" — và bảng §8 ở trên đã cộng độ phủ ra **89**
   (86 ĐẠT + 1 ĐẠT MỘT PHẦN + 2 CHƯA ĐẠT). Không được "sửa cho khớp" bằng cách đổi bừa số nào:
   phải rà từng chỗ dẫn và xác nhận FR nào được thêm mà không khai. Ghi ở đây vì lát cắt
   KBT-ISSUE-43 **cố ý không** cấp FR mới (xem ghi chú sau bảng FR-G trong `SRS.md` §4.3),
   nên số FR không đổi và không được dùng làm cớ để đổi hàng loạt.

---

## 10. Chuỗi đầy đủ BR → FR → US → TC → evidence (lát cắt đã đóng)

§2 chỉ truy vết tới cấp **chức năng**. Một chuỗi được coi là *liền mạch* theo nghĩa của khóa học
chỉ khi mỗi mắt còn lại đều trỏ được tới một file chạy được. Repo này đang có **hai** lát cắt như
vậy — chọn theo hành trình dọc, không chọn theo số lượng:

**Lát cắt 1 (T41C — chống ghi trùng & biên lai thưởng).**

**BR** BG-06 (đổi nội dung không phá tiến độ cũ) + BG-05 (phụ huynh tin vào dữ liệu của con)
→ **FR** FR-G04 · FR-G07 · FR-R04 · FR-R05 · FR-M05 · FR-P01 + **NFR** NFR-R04 · NFR-M04
→ **US** US-01 … US-05, mỗi US có AC 3 nhánh (chính / biên / lỗi)
→ **TC** TC-01 … TC-29
→ **evidence** `tests/t41c-idempotency.test.ts` (25 test) · 3 probe JSON · 2 ảnh · 2 phép ablation,
tất cả ở [`evidence/2026-11-02-T41C/`](../../evidence/README.md), commit `d54f341`.

Bảng chiếu (chi tiết từng dòng ở [`docs/plan/TEST_CASES.md`](../plan/TEST_CASES.md) §3):

**Lát cắt 2 (KBT-ISSUE-43 — nút Tạm dừng trò chơi, chạy trọn 6 pha SDLC ngày 2026-11-02).**

**BR** BG-03 (không gây nhầm lẫn cho bé) + BG-04 (dùng được trên điện thoại gia đình)
→ **FR/NFR** FR-G08 (vỏ modal điều khiển trò chơi) · NFR-A03 (vùng chạm ≥ 44 px) · NFR-A05 (icon + chữ,
không chỉ màu) — **không có FR cho chính hành vi "tạm dừng"**; nguồn yêu cầu là Issue, ứng viên
`FR-G10` (xem `SRS.md` §4.3)
→ **US** US-06, AC 3 nhánh (chính / biên / lỗi)
→ **TC** TC-30 … TC-42 (13 TC)
→ **evidence** [`docs/issues/43-game-pause.md`](../issues/43-game-pause.md) (Issue + DoD + ghi chú thiết kế
+ §5.1 chỗ phải sửa mô tả) · `tests/t43-game-pause.test.ts` (30 test) · `qa/game-pause.mjs` (12 bước, 0 lỗi)
· 3 ảnh · 2 phép ablation M3/M4, tất cả ở [`evidence/2026-11-02-KBT-ISSUE-43/`](../../evidence/README.md),
commit `675be7e`+`af2d56a`+`494cce2` trên nhánh `feature/43-game-pause`.

| US | AC nguồn | TC | Mắt cuối (bằng chứng) | Verdict |
|---|---|---|---|---|
| US-01 Chơi lại không farm Sao | FR-G04/FR-G07 · NFR-R04 (reward) | TC-11…15, TC-19…21, TC-25, TC-26, TC-29 | `evidence/2026-11-02-T41C/probe-t32-game-replay-evidence.json` + `mutation-M2-reward-claim-guard.txt` | Pass |
| US-02 Bấm hai lần không tính hai lượt | FR-R05 · NFR-R04 (evidence id) | TC-01…04, TC-16 | `tests/t41c-idempotency.test.ts:118` + `:319` | Pass |
| US-03 Một buổi đọc chỉ gập một lần | FR-R04 · NFR-R04 (completion) | TC-05…07 | `mutation-M1-session-guard.txt` (guard `readingEngine.ts:320`) | Pass |
| US-04 Máy hết chỗ không làm streak nhảy | FR-M05 · NFR-R01 · NFR-R04 | TC-08…10, TC-17, TC-18 | `tests/t41c-idempotency.test.ts:198` | Pass |
| US-05 Ba mẹ tắt thưởng ⇒ không hứa Sao | FR-P01 · NFR-M04 | TC-22…24, TC-27, TC-29 | `evidence/2026-11-02-T41C/game-rewards-off.png` + `probe-parent-controls.json` | Pass |
| US-06 Bé bấm tạm dừng giữa màn đếm giờ | **Issue KBT-ISSUE-43** (chưa có FR) · FR-G08 · NFR-A03/A05 | TC-30…42 | `evidence/2026-11-02-KBT-ISSUE-43/probe-game-pause.json` + `mutation-M3-clock-decision.txt` + `b3-dang-tam-dung.png` | Pass |

**Phần còn lại chưa liền mạch — ghi rõ, không tô hồng:** ngoài các FR đã nêu ở hai lát cắt trên,
toàn bộ FR còn lại vẫn dừng ở cấp FR (§2). **Không ghi một con số tuyệt đối** ("còn 83 FR…") ở đây:
tổng FR mà tài liệu này khai ("88 FR") đang lệch với số dòng FR thật trong `SRS.md` (89) — xem §9 rule 5;
khi nào đối chiếu xong mới được viết lại số. Lý do và điều kiện chuyển sang chuỗi đầy đủ ghi ở
`TEST_CASES.md` §5; trạng thái tổng của 6 pha ghi ở [`docs/lifecycle/README.md`](../lifecycle/README.md).

