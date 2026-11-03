import { useCallback, useEffect, useRef, useState } from 'react';
import { sound, VOICE_PERSONAS, type VoicePersonaId } from '../services/sound';
import { toSpeechText } from '../services/speechText';

/**
 * useSpeak — truthful text-to-speech button state (§20–22).
 *
 * Every question-audio button in the Grade-1 app must show what is actually
 * happening, because `sound.speak()` itself is fire-and-forget:
 *
 *   idle        — nothing spoken yet (or stopped); safe to press
 *   playing     — the utterance is on the platform queue / sounding
 *   played      — the utterance finished; pressing replays from idle
 *   unavailable — this device cannot speak; the button says so instead of
 *                 pretending audio happened (AUDIO_UNAVAILABLE)
 *
 * Guarantees:
 *   - pressing while playing cancels the old utterance first: repeated taps
 *     never stack uncontrolled playback;
 *   - unmount cancels any pending utterance (no ghost audio after navigation);
 *   - `speak()` returns whether audio actually started, and moves to
 *     `unavailable` when the platform refuses;
 *   - `onerror` never reports `played`: an error is evidence that nothing was
 *     heard. Recoverable reasons (channel taken/deferred) go back to `idle` so
 *     the child can press again; refusals say `unavailable` out loud.
 */

export type SpeakState = 'idle' | 'playing' | 'played' | 'unavailable';

/**
 * Lý do `onerror` mà **không** có nghĩa là thiết bị hết nói được: kênh bị một bên khác giành
 * hoặc hoãn (`cancel()` của chính app, giọng khác xen, hàng đợi bận). Những lý do còn lại
 * (`synthesis-failed`, `not-allowed`, `network`, `audio-hardware`, `voice-unavailable`…) là từ
 * chối thật ⇒ nút phải báo `unavailable`.
 * Kiểu để `string` chứ không dùng `SpeechSynthesisErrorCode` vì bộ lib DOM không liệt kê đủ
 * `rejected` / `audio-busy` mà Chromium thật vẫn bắn.
 */
const SPEAK_INTERRUPT_REASONS: ReadonlySet<string> = new Set([
  'canceled',
  'interrupted',
  'rejected',
  'audio-busy',
]);

function synthesisAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.speechSynthesis?.speak === 'function'
  );
}

export function useSpeak() {
  const [state, setState] = useState<SpeakState>(() => (synthesisAvailable() ? 'idle' : 'unavailable'));
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    utteranceRef.current = null;
    try {
      if (synthesisAvailable()) window.speechSynthesis.cancel();
    } catch {
      /* Stopping must never throw. */
    }
    setState((prev) => (prev === 'unavailable' ? 'unavailable' : 'idle'));
  }, []);

  // No ghost audio after the question/modal unmounts.
  useEffect(() => {
    return () => {
      utteranceRef.current = null;
      try {
        if (synthesisAvailable()) window.speechSynthesis.cancel();
      } catch {
        /* Unmount cleanup must never throw. */
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, lang: 'vi-VN' | 'en-US' | 'en-GB' = 'vi-VN', personaId?: VoicePersonaId): boolean => {
      if (!synthesisAvailable()) {
        setState('unavailable');
        return false;
      }
      if (sound.getMuted() || !sound.getVoiceEnabled()) {
        // The parent silenced the app. That is a deliberate setting, not a
        // device failure — report idle so the button stays pressable for later.
        return false;
      }
      try {
        window.speechSynthesis.cancel(); // never stack utterances
        // `toSpeechText` chỉ đổi cách ĐỌC (6 + 4 → "6 cộng 4"); text hiển thị và
        // canonical text mà questionAudio assert vẫn là nguyên văn đề bài.
        const utterance = new SpeechSynthesisUtterance(toSpeechText(text, lang));
        utterance.lang = lang;
        const baseRate = lang === 'vi-VN' ? 0.9 : 0.85;
        utterance.rate = Math.min(2, Math.max(0.1, baseRate * (personaId ? VOICE_PERSONAS[personaId].rate : 1)));
        utterance.pitch = Math.min(2, Math.max(0, personaId ? VOICE_PERSONAS[personaId].pitch : 1.1));
        const voice = personaId !== undefined ? sound.pickPersonaVoice(personaId, lang) : sound.pickVoice(lang);
        if (voice) utterance.voice = voice;
        utteranceRef.current = utterance;
        utterance.onend = () => {
          if (utteranceRef.current === utterance) {
            utteranceRef.current = null;
            setState('played');
          }
        };
        utterance.onerror = (event) => {
          if (utteranceRef.current !== utterance) return;
          utteranceRef.current = null;
          // T48A — `onerror` là bằng chứng **không có tiếng**, ngược hẳn `onend`, nên không được
          // để lại `played`: nhãn của state đó là "Đã đọc xong, chạm để nghe lại", tức bé vừa
          // không nghe thấy gì vừa được mời bấm lại một thứ chưa từng phát. Chia theo lý do:
          // kênh bị giành/hoãn thì thiết bị vẫn nói được (về `idle` cho bấm lại), còn thiết bị
          // từ chối thì phải báo thẳng `unavailable` — đúng nhãn "đọc cùng ba mẹ nhé".
          if (SPEAK_INTERRUPT_REASONS.has(event.error)) {
            setState('idle');
          } else {
            setState('unavailable');
          }
        };
        setState('playing');
        window.speechSynthesis.speak(utterance);
        return true;
      } catch {
        utteranceRef.current = null;
        setState('unavailable');
        return false;
      }
    },
    []
  );

  return { state, speak, stop };
}
