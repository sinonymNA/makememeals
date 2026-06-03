import { useCallback, useRef, useState } from 'react';

// Tiny WebAudio sound kit for the demo — no asset files, synthesised on the fly.
// Muted by default (mobile autoplay policies + good manners); the demo shows a
// speaker toggle so a tap can enable it. Each cue is a short, soft blip.
export default function useDemoSound() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = useCallback((freq, dur = 0.12, type = 'sine', gain = 0.06, slideTo = null) => {
    if (!enabled) return;
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
  }, [enabled, getCtx]);

  const playAdd = useCallback(() => {
    tone(523.25, 0.1, 'sine', 0.07);
    setTimeout(() => tone(783.99, 0.14, 'sine', 0.06), 70);
  }, [tone]);

  const playSkip = useCallback(() => tone(220, 0.12, 'triangle', 0.04, 160), [tone]);

  const playCoupon = useCallback(() => tone(880, 0.07, 'square', 0.035, 1320), [tone]);

  const playSave = useCallback(() => {
    tone(659.25, 0.1, 'sine', 0.06);
    setTimeout(() => tone(523.25, 0.14, 'sine', 0.05), 80);
  }, [tone]);

  const playWin = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      setTimeout(() => tone(f, 0.18, 'sine', 0.06), i * 90)
    );
  }, [tone]);

  const toggle = useCallback(() => {
    // Prime the audio context inside the user gesture so later cues can fire.
    getCtx();
    setEnabled((e) => !e);
  }, [getCtx]);

  return { enabled, toggle, playAdd, playSkip, playCoupon, playSave, playWin };
}
