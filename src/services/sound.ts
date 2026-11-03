/**
 * Sound Service using Web Audio API & Web Speech API.
 * 100% self-contained, no external audio files needed!
 */

import { toSpeechText } from './speechText';

export type VoicePersonaId =
  | 'narrator'
  | 'teacher'
  | 'uncle'
  | 'grandma'
  | 'kid_girl'
  | 'kid_boy';

export interface VoicePersona {
  id: VoicePersonaId;
  /** Tên hiển thị cho phụ huynh (chọn trong Dashboard). */
  label: string;
  gender: 'female' | 'male';
  isChild: boolean;
  /** Pitch tuyệt đối trong khoảng cho phép của Web Speech [0, 2]. */
  pitch: number;
  /** Hệ số nhân tốc độ đọc so với tốc độ cơ sở của ngôn ngữ. */
  rate: number;
}

export const VOICE_PERSONAS: Record<VoicePersonaId, VoicePersona> = {
  narrator: { id: 'narrator', label: 'Người dẫn chuyện', gender: 'female', isChild: false, pitch: 1.1, rate: 1 },
  teacher: { id: 'teacher', label: 'Cô giáo hiền', gender: 'female', isChild: false, pitch: 1.0, rate: 1 },
  uncle: { id: 'uncle', label: 'Chú vui vẻ', gender: 'male', isChild: false, pitch: 0.8, rate: 1.02 },
  grandma: { id: 'grandma', label: 'Bà ấm áp', gender: 'female', isChild: false, pitch: 1.12, rate: 0.82 },
  kid_girl: { id: 'kid_girl', label: 'Bạn nhỏ nữ', gender: 'female', isChild: true, pitch: 1.5, rate: 1.04 },
  kid_boy: { id: 'kid_boy', label: 'Bạn nhỏ nam', gender: 'male', isChild: true, pitch: 1.32, rate: 1.06 },
};

/** Các persona luân phiên khi khen ngợi: 2 giọng trẻ em + 3 giọng người lớn. */
export const PRAISE_PERSONA_ROTATION: VoicePersonaId[] = [
  'teacher',
  'kid_girl',
  'uncle',
  'kid_boy',
  'grandma',
];

const FEMALE_VOICE_HINTS =
  /\bfemale\b|\bwomen\b|\bgirl\b|nữ|hoai\s*my|zira|hazel|susan|samantha|victoria|karen|moira|tessa|fiona|amanda|linh|mai\b|lan\b|nga\b|thao\b|huong\b/i;

const MALE_VOICE_HINTS =
  /\bmale\b|\bmen\b|\bboy\b|nam\b|minh\b|david|mark|daniel|alex\b|tom\b|fred\b|george|oliver|diego|jiang|duc\b|hung\b|tuan\b|hoang\b/i;

function hashPersonaId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clampSpeechRange(value: number): number {
  return Math.min(2, Math.max(0.1, value));
}

class SoundService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceEnabled: boolean = true;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private pendingSpeech: number[] = [];

  private bgMusicEnabled: boolean = false;
  private bgMusicContext: AudioContext | null = null;
  private bgMusicGain: GainNode | null = null;
  private bgMusicOscillators: OscillatorNode[] = [];
  private bgMusicNextTimer: number | null = null;
  private bgMusicVolume: number = 0.1; // Low volume by default

  constructor() {
    // Voiceless/broken platforms must never crash the app at import time: the
    // key can exist while the object is unusable, so every touch is guarded.
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.cachedVoices = window.speechSynthesis.getVoices() ?? [];
        window.speechSynthesis.onvoiceschanged = () => {
          try {
            this.cachedVoices = window.speechSynthesis.getVoices() ?? [];
          } catch {
            this.cachedVoices = [];
          }
        };
      }
    } catch {
      this.cachedVoices = [];
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
  }

  public getVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  // Cute bubble click sound
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Ignore audio error
    }
  }

  // Joyful chime for correct answer
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Gentle soft boing for wrong attempt (encouraging, never harsh)
  public playWrong() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // Ignore audio error
    }
  }

  // Sparkling star twinkle
  public playStar() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [880, 1174.66, 1318.51, 1760]; // A5, D6, E6, A6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.36);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Victory fanfare on lesson/game completion
  public playLevelUp() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const chordNotes = [
        { f: 523.25, t: 0 },
        { f: 659.25, t: 0.1 },
        { f: 783.99, t: 0.2 },
        { f: 1046.5, t: 0.35 },
        { f: 1046.5, t: 0.55 },
        { f: 1318.51, t: 0.75 },
      ];

      chordNotes.forEach(({ f, t }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + t);

        gain.gain.setValueAtTime(0, ctx.currentTime + t);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.45);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Pop balloon effect
  public playPop() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Âm thanh di chuyển quân cờ tướng: tiếng quân cờ gỗ gõ xuống mặt bàn cờ ("cộp!" chắc nịch)
   */
  public playCotuongMove(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // 1. Tiếng va đập gỗ sắc nét (attack click)
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(820, now);
      clickOsc.frequency.exponentialRampToValueAtTime(160, now + 0.035);
      clickGain.gain.setValueAtTime(0.48, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.045);

      // 2. Thân gỗ vang trầm ("thock" gỗ hương đặc)
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = 'sine';
      bodyOsc.frequency.setValueAtTime(280, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
      bodyGain.gain.setValueAtTime(0.38, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.09);
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Âm thanh ăn quân cờ tướng: hai đĩa gỗ đập vào nhau rồi gõ xuống bàn ("chát-cộp!" uy lực)
   */
  public playCotuongCapture(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Cú đập 1: Hai quân cờ chạm nhau tạo tiếng đanh ("chát")
      const clashOsc = ctx.createOscillator();
      const clashGain = ctx.createGain();
      clashOsc.type = 'sawtooth';
      clashOsc.frequency.setValueAtTime(1300, now);
      clashOsc.frequency.exponentialRampToValueAtTime(320, now + 0.032);
      clashGain.gain.setValueAtTime(0.4, now);
      clashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
      clashOsc.connect(clashGain);
      clashGain.connect(ctx.destination);
      clashOsc.start(now);
      clashOsc.stop(now + 0.042);

      // Cú đập 2: Quân cờ cắm xuống mặt bàn cờ cách 18ms ("cộp" trầm uy lực)
      const strikeTime = now + 0.018;
      const strikeOsc = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(420, strikeTime);
      strikeOsc.frequency.exponentialRampToValueAtTime(90, strikeTime + 0.12);
      strikeGain.gain.setValueAtTime(0.65, strikeTime);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.13);
      strikeOsc.connect(strikeGain);
      strikeGain.connect(ctx.destination);
      strikeOsc.start(strikeTime);
      strikeOsc.stop(strikeTime + 0.14);

      // Độ cộng hưởng mặt bàn gỗ
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(170, strikeTime);
      subOsc.frequency.exponentialRampToValueAtTime(60, strikeTime + 0.14);
      subGain.gain.setValueAtTime(0.42, strikeTime);
      subGain.gain.exponentialRampToValueAtTime(0.001, strikeTime + 0.15);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(strikeTime);
      subOsc.stop(strikeTime + 0.16);
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Âm thanh chiếu tướng kịch tính: chuỗi hợp âm chiêng đồng ngân vang cảnh báo + phát âm "Chiếu tướng!"
   */
  public playCotuongCheck(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (ctx) {
      try {
        const now = ctx.currentTime;
        // Chuỗi hài âm chiêng đồng báo động (quãng 5 và bát độ)
        const freqs = [330, 495, 660, 990];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.96, now + 0.55);

          gain.gain.setValueAtTime(0.24 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.58);
        });
      } catch {
        // Ignore audio error
      }
    }
    // Lời nhắc giọng nói dõng dạc
    this.speak('Chiếu tướng!');
  }

  /**
   * Âm thanh nhấc / chọn quân cờ gỗ
   */
  public playCotuongSelect(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.038);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignore audio error
    }
  }

  // Text to speech (Vietnamese & English)
  public speak(
    text: string,
    lang: 'vi-VN' | 'en-US' | 'en-GB' = 'vi-VN',
    options?: { personaId?: VoicePersonaId }
  ) {
    if (this.isMuted || !this.voiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel(); // Stop any pending utterances
      const utterance = new SpeechSynthesisUtterance(toSpeechText(text, lang));
      utterance.lang = lang;
      const baseRate = lang === 'vi-VN' ? 0.9 : 0.85;
      utterance.rate = clampSpeechRange(baseRate * (options?.personaId ? VOICE_PERSONAS[options.personaId].rate : 1));
      utterance.pitch = clampSpeechRange(options?.personaId ? VOICE_PERSONAS[options.personaId].pitch : 1.1);

      const matchingVoice =
        options?.personaId !== undefined
          ? this.pickPersonaVoice(options.personaId, lang)
          : this.pickVoice(lang);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis error handled quietly without crashing
    }
  }

  /**
   * Voice selection chain (§7):
   *   1. exact locale match ('en-GB')
   *   2. regional variant of the same locale ('en-GB-SCT')
   *   3. any voice sharing the base language ('en-*')
   * Returns null when the platform offers nothing usable, so the caller can
   * fall back to text/captions instead of pretending an audio happened.
   */
  public pickVoice(lang: 'vi-VN' | 'en-US' | 'en-GB'): SpeechSynthesisVoice | null {
    return this.voiceCandidates(lang)[0] ?? null;
  }

  /** All platform voices matching the locale chain (exact → regional → base). */
  private voiceCandidates(lang: 'vi-VN' | 'en-US' | 'en-GB'): SpeechSynthesisVoice[] {
    const allVoices = this.cachedVoices.length > 0 ? this.cachedVoices : this.getVoices();
    if (allVoices.length === 0) return [];

    const base = lang.split('-')[0];
    const exact = allVoices.filter((v) => v.lang === lang || v.lang.replace('_', '-') === lang);
    if (exact.length > 0) return exact;

    const regional = allVoices.filter((v) => v.lang.replace('_', '-').startsWith(`${lang}-`));
    if (regional.length > 0) return regional;

    return allVoices.filter((v) => v.lang.replace('_', '-').startsWith(base));
  }

  /**
   * Voice chosen for a persona: prefer a platform voice whose name hints at
   * the persona's gender (so different personas sound like different people
   * when the device offers several voices), otherwise rotate deterministically
   * through the locale pool. Pitch/rate still apply on top.
   */
  public pickPersonaVoice(personaId: VoicePersonaId, lang: 'vi-VN' | 'en-US' | 'en-GB'): SpeechSynthesisVoice | null {
    const candidates = this.voiceCandidates(lang);
    if (candidates.length === 0) return null;
    const persona = VOICE_PERSONAS[personaId];
    const hints = persona.gender === 'female' ? FEMALE_VOICE_HINTS : MALE_VOICE_HINTS;
    const gendered = candidates.filter((v) => hints.test(v.name));
    const pool = gendered.length > 0 ? gendered : candidates;
    const index = hashPersonaId(personaId) % pool.length;
    return pool[index] ?? null;
  }

  /** Re-reads the platform voice list (populated asynchronously on load). */
  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) this.cachedVoices = voices;
      return this.cachedVoices;
    } catch {
      return this.cachedVoices;
    }
  }

  /** True when a voice for this exact locale exists on the device. */
  public hasVoiceFor(lang: 'vi-VN' | 'en-US' | 'en-GB'): boolean {
    return this.getVoices().some((v) => v.lang === lang || v.lang.replace('_', '-') === lang);
  }


  /**
   * Đọc lời thoại sau một độ trễ (lời khen nối tiếp tiếng "đúng rồi") — cùng thứ
   * tự tham số với speak(), chỉ thêm delayMs ở cuối.
   * Qua speakLater thì lời này nằm trong sổ hẹn giờ và stopSpeaking() cắt được
   * khi bé đóng trò chơi — nếu không gấu vẫn khen vang lên ở màn hình khác.
   */
  public speakLater(
    text: string,
    lang: 'vi-VN' | 'en-US' | 'en-GB' = 'vi-VN',
    delayMs = 300
  ) {
    if (typeof window === 'undefined') return;
    const id = window.setTimeout(() => {
      this.pendingSpeech = this.pendingSpeech.filter((t) => t !== id);
      this.speak(text, lang);
    }, delayMs);
    this.pendingSpeech.push(id);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined') {
      this.pendingSpeech.forEach((id) => window.clearTimeout(id));
    }
    this.pendingSpeech = [];
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // ------------------------------
  // Background music
  // ------------------------------

  /** Set background music enabled state. */
  public setBgMusicEnabled(enabled: boolean): void {
    this.bgMusicEnabled = enabled;
    if (enabled) {
      this.startBgMusic();
    } else {
      this.stopBgMusic();
    }
  }

  /** Get background music enabled state. */
  public getBgMusicEnabled(): boolean {
    return this.bgMusicEnabled;
  }

  /** Start background music with initial delay. */
  private startBgMusic(): void {
    if (typeof window === 'undefined') return;
    if (this.bgMusicContext) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.bgMusicContext = new AudioCtx();
        this.bgMusicGain = this.bgMusicContext.createGain();
        this.bgMusicGain.gain.value = this.bgMusicVolume;
        this.bgMusicGain.connect(this.bgMusicContext.destination);

        // Schedule first loop after user interaction guarantee
        this.playBgMusicLoop();
      }
    } catch {
      this.bgMusicContext = null;
      this.bgMusicGain = null;
    }
  }

  /** Stop background music. */
  private stopBgMusic(): void {
    if (this.bgMusicNextTimer !== null) {
      window.clearTimeout(this.bgMusicNextTimer);
      this.bgMusicNextTimer = null;
    }
    if (this.bgMusicContext) {
      this.stopBgMusicInner();
      try {
        // close() giải phóng hardware context; suspend() chỉ tạm dừng nên bật
        // tắt vài lần là đụng trần ~6 context/tab của Chrome và nhạc nền chết
        // vĩnh viễn (khối try ở trên nuốt lỗi).
        void this.bgMusicContext.close();
      } catch {
        // ignore
      }
      this.bgMusicContext = null;
      this.bgMusicGain = null;
    }
  }

  /** Play background music loop (home/map gentle sequence). */
  private playBgMusicLoop(): void {
    if (!this.bgMusicEnabled || !this.bgMusicContext) return;

    // Cancel any existing oscillators
    this.stopBgMusicInner();

    // Home/Map music pattern: gentle, ascending/descending sequences
    const pattern = this.getHomeMusicPattern();

    // Create oscillators for the pattern
    this.bgMusicOscillators = [];
    const startAt = this.bgMusicContext.currentTime;
    let cursor = startAt;
    for (let i = 0; i < pattern.length; i++) {
      const note = pattern[i];
      const osc = this.bgMusicContext!.createOscillator();
      const gain = this.bgMusicContext!.createGain();

      // Mỗi nốt phải nối tiếp nhau. Trước đây tất cả đều start(currentTime) nên
      // vòng lặp dưới (chạy mỗi frame) luôn restart cùng một nốt G4 — thành một
      // tiếng rè liên tục thay vì giai điệu.
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, cursor);

      gain.gain.setValueAtTime(this.bgMusicVolume, cursor);
      gain.gain.exponentialRampToValueAtTime(
        this.bgMusicVolume * 0.8,
        cursor + note.duration,
      );

      osc.connect(gain);
      gain.connect(this.bgMusicGain!);

      osc.start(cursor);
      osc.stop(cursor + note.duration);

      this.bgMusicOscillators.push(osc);
      cursor += note.duration;
    }

    // Schedule next loop khi chuỗi nốt kết thúc (không phải mỗi frame).
    const loopMs = Math.max(0, (cursor - startAt) * 1000);
    this.bgMusicNextTimer = window.setTimeout(() => {
      this.bgMusicNextTimer = null;
      this.playBgMusicLoop();
    }, loopMs);
  }

  /** Home/Map music pattern: gentle, ascending/descending sequences. */
  private getHomeMusicPattern(): Array<{ freq: number; duration: number }> {
    return [
      { freq: 392, duration: 1.5 }, // G4
      { freq: 329.63, duration: 1.5 }, // E5
      { freq: 349.23, duration: 1.5 }, // F5
      { freq: 392, duration: 2.0 }, // G4
      { freq: 261.63, duration: 2.0 }, // C5
      { freq: 329.63, duration: 2.5 }, // E5
    ];
  }

  private stopBgMusicInner(): void {
    this.bgMusicOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {
        // ignore
      }
    });
    this.bgMusicOscillators = [];
    if (this.bgMusicGain) {
      try {
        this.bgMusicGain.disconnect();
      } catch {
        // ignore
      }
    }
  }

  // ------------------------------
  // New sound effects
  // ------------------------------

  /** Play combo sound (rising pitch for correct streak). */
  public playCombo(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq * (1 + idx * 0.1), ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } catch {
      // Ignore audio error
    }
  }

  /** Play chest opening sound. */
  public playChestOpen(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Ignore audio error
    }
  }

  /** Play sticker pickup sound. */
  public playStickerPickup(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(440, ctx.currentTime);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(523.25, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
    } catch {
      // Ignore audio error
    }
  }

  /** Play soft button tick sound. */
  public playButtonTick(): void {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(261.63, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Ignore audio error
    }
  }
}

export const sound = new SoundService();