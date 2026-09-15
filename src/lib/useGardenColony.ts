import { useCallback, useEffect, useRef, useState } from 'react';
import { STEP_S, advanceGardenLife } from './gardenLife.ts';
import {
  catchUpColony,
  clearColony,
  freshColony,
  readColony,
  toColonySave,
  writeColony,
  type ColonyRuntime,
} from './gardenColony.ts';

function browserStore(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function useGardenColony() {
  const [runtime, setRuntime] = useState<ColonyRuntime>(() => readColony(browserStore(), Date.now()));
  const runtimeRef = useRef(runtime);
  runtimeRef.current = runtime;

  const persist = useCallback((value: ColonyRuntime) => {
    writeColony(browserStore(), value);
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = Date.now();
    const tick = () => {
      const now = Date.now();
      const dt = Math.min(0.25, Math.max(0, (now - last) / 1000));
      last = now;
      setRuntime(previous => {
        if (document.hidden) return { ...previous, wallMs: now };
        if (previous.paused) return { ...previous, wallMs: now, lastSimTimestamp: now };
        if (dt <= 0) return { ...previous, wallMs: now };
        const life = advanceGardenLife(previous.life, previous.life.colonyTime, previous.life.colonyTime + dt, STEP_S);
        return { life, paused: false, lastSimTimestamp: now, wallMs: now };
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => persist(runtimeRef.current), 2000);
    const onHide = () => {
      const now = Date.now();
      if (document.hidden) {
        persist(runtimeRef.current);
        return;
      }
      setRuntime(previous => catchUpColony(toColonySave(previous), now));
    };
    const onUnload = () => persist(runtimeRef.current);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onUnload);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onUnload);
      persist(runtimeRef.current);
    };
  }, [persist]);

  const pauseColony = useCallback(() => {
    setRuntime(previous => {
      const next = { ...previous, paused: true, lastSimTimestamp: Date.now(), wallMs: Date.now() };
      persist(next);
      return next;
    });
  }, [persist]);

  const resumeColony = useCallback(() => {
    setRuntime(previous => {
      const now = Date.now();
      const next = { ...previous, paused: false, lastSimTimestamp: now, wallMs: now };
      persist(next);
      return next;
    });
  }, [persist]);

  const resetColony = useCallback(() => {
    const store = browserStore();
    clearColony(store);
    const next = freshColony(Date.now());
    persist(next);
    setRuntime(next);
  }, [persist]);

  return { ...runtime, pauseColony, resumeColony, resetColony };
}
