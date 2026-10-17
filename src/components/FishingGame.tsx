import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface FishingGameProps {
  onClose: () => void;
}

const FISH = ["🐟", "🐠", "🐡", "🦈", "🐙", "🦑", "🦀", "🐢"];
const TRACK = 360;
const BAR = 90;
const FISH_SIZE = 28;

const FishingGame: React.FC<FishingGameProps> = ({ onClose }) => {
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [view, setView] = useState({ bar: 0, fish: 200, progress: 30 });
  const [caught, setCaught] = useState<string[]>([]);
  const [currentFish, setCurrentFish] = useState(FISH[0]);

  const s = useRef({
    bar: 0,
    vel: 0,
    fish: 200,
    fishTarget: 200,
    progress: 30,
    holding: false,
    speed: 1,
  });
  const raf = useRef(0);

  const start = useCallback(() => {
    const fish = FISH[Math.floor(Math.random() * FISH.length)];
    setCurrentFish(fish);
    s.current = {
      bar: 0,
      vel: 0,
      fish: 200,
      fishTarget: 200,
      progress: 30,
      holding: false,
      speed: 0.8 + Math.random() * 1.2,
    };
    setStatus("playing");
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    let last = performance.now();
    let retarget = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      const g = s.current;

      retarget -= dt;
      if (retarget <= 0) {
        g.fishTarget = Math.random() * (TRACK - FISH_SIZE);
        retarget = 30 + Math.random() * 50 / g.speed;
      }
      g.fish += (g.fishTarget - g.fish) * 0.04 * g.speed * dt;

      g.vel += (g.holding ? 0.45 : -0.4) * dt;
      g.vel = Math.max(-8, Math.min(8, g.vel));
      g.bar += g.vel * dt;
      if (g.bar < 0) {
        g.bar = 0;
        g.vel = g.holding ? 0 : Math.abs(g.vel) * 0.4;
      }
      if (g.bar > TRACK - BAR) {
        g.bar = TRACK - BAR;
        g.vel = 0;
      }

      const fishCenter = g.fish + FISH_SIZE / 2;
      const inside = fishCenter >= g.bar && fishCenter <= g.bar + BAR;
      g.progress += (inside ? 0.28 : -0.22) * dt;

      setView({ bar: g.bar, fish: g.fish, progress: g.progress });

      if (g.progress >= 100) {
        setCaught((c) => [...c, currentFish]);
        setStatus("won");
        return;
      }
      if (g.progress <= 0) {
        setStatus("lost");
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [status, currentFish]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        s.current.holding = true;
      }
      if (e.code === "Escape") onClose();
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") s.current.holding = false;
    };
    const release = () => (s.current.holding = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("mouseup", release);
    window.addEventListener("touchend", release);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("mouseup", release);
      window.removeEventListener("touchend", release);
    };
  }, [onClose]);

  const hold = (v: boolean) => () => {
    s.current.holding = v;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="underwater-card relative w-full max-w-sm p-6 text-center bg-background rounded-xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-xl text-muted-foreground hover:text-foreground"
          aria-label="Закрыть"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-1">🎣 Рыбалка</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Зажимай мышь, экран или пробел — зелёная полоса поднимается. Держи рыбу внутри неё!
        </p>

        <div
          className="mx-auto flex items-end justify-center gap-3 select-none touch-none cursor-pointer"
          style={{ height: TRACK }}
          onMouseDown={hold(true)}
          onTouchStart={hold(true)}
        >
          <div
            className="relative w-16 rounded-md border-4 border-amber-900 bg-sky-300/40 overflow-hidden"
            style={{ height: TRACK }}
          >
            <div
              className="absolute left-0 right-0 bg-green-500/70 border-y-2 border-green-700 rounded"
              style={{ height: BAR, bottom: view.bar }}
            />
            <div
              className="absolute left-0 right-0 text-center leading-none"
              style={{ bottom: view.fish, fontSize: FISH_SIZE - 4, height: FISH_SIZE }}
            >
              {currentFish}
            </div>
          </div>

          <div
            className="relative w-5 rounded-md border-4 border-amber-900 bg-muted overflow-hidden"
            style={{ height: TRACK }}
          >
            <div
              className="absolute bottom-0 left-0 right-0 transition-colors"
              style={{
                height: `${Math.max(0, Math.min(100, view.progress))}%`,
                background:
                  view.progress > 66 ? "#22c55e" : view.progress > 33 ? "#eab308" : "#ef4444",
              }}
            />
          </div>
        </div>

        {status !== "playing" && (
          <div className="mt-4">
            <p className="text-lg font-bold mb-2">
              {status === "won" ? `Поймал ${currentFish}!` : "Рыба сорвалась..."}
            </p>
            <Button onClick={start} className="ocean-button">
              {status === "won" ? "Ещё раз" : "Попробовать снова"}
            </Button>
          </div>
        )}

        {caught.length > 0 && (
          <p className="mt-3 text-sm">
            Улов ({caught.length}): <span className="text-xl">{caught.join(" ")}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default FishingGame;