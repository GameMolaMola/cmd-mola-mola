
import { useRef } from "react";

export interface FreeBrasilenaController {
  trigger: (ammo: number, platforms: any[], canvasHeight: number, spawn: (position: {x:number, y:number}) => void) => void;
  onPickup: () => void;
  cleanup: () => void;
  reset: () => void; // <--- добавлено
}

/**
 * Controls spawning a free Brasilena bottle after running out of ammo.
 * Usage:
 *   const freeBrasilena = useFreeBrasilena();
 *   freeBrasilena.trigger(ammo, platforms, canvasHeight, spawnFn)
 *   freeBrasilena.onPickup()
 *   freeBrasilena.cleanup()
 *   freeBrasilena.reset()
 */
export function useFreeBrasilena(): FreeBrasilenaController {
  const timeoutRef = useRef<number | null>(null);
  const activeRef = useRef<boolean>(false);

  // Call whenever ammo reaches 0
  const trigger = (ammo: number, platforms: any[], canvasHeight: number, spawn: (pos: {x:number,y:number}) => void) => {
    if (ammo > 0 || activeRef.current || timeoutRef.current !== null) return;

    timeoutRef.current = window.setTimeout(() => {
      // Find a platform above the sand to spawn on (exclude lowest)
      const candidates = platforms.filter((p:any) => p.y < canvasHeight - 41);
      const platform = candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : platforms[0];
      spawn({
        x: platform.x + platform.width / 2 - 16 + Math.random() * 12,
        y: platform.y - 18,
      });
      activeRef.current = true;
      timeoutRef.current = null;
    }, 5000);
  };

  // Call when player picks up a free Brasilena
  const onPickup = () => {
    if (activeRef.current) {
      activeRef.current = false;
    }
  }

  // Always call on engine/game stop to clear timeouts
  const cleanup = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    activeRef.current = false;
  }

  // call every time a new level starts or game restarts
  const reset = () => {
    cleanup();
  }

  return { trigger, onPickup, cleanup, reset };
}
