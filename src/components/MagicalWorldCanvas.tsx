import { useEffect, useRef, type RefObject } from "react";
import {
  drawMagicalStarCollectible,
  drawMagneticBeam,
  drawStarShape,
  MagicalEffectPool,
} from "./magicalWorld/collectiblesRenderer";
import { drawMagicalHero } from "./magicalWorld/heroRenderer";
import type { WorldCaches } from "./magicalWorld/types";
import {
  createWorldCaches,
  drawStorybookWorld,
} from "./magicalWorld/worldRenderer";
import type { ShoulderHoldStage, ShoulderRepState } from "./types";

interface MagicalWorldCanvasProps {
  liveAngleRef: RefObject<number>;
  repCount: number;
  targetReps?: number;
  repState: ShoulderRepState;
  holdStage: ShoulderHoldStage;
  holdProgressPercent: number;
  selectedCharacter: string | null;
  isPaused: boolean;
  isPlaying: boolean;
}

interface FlyingStarFlight {
  active: boolean;
  elapsed: number;
  duration: number;
  startX: number;
  startY: number;
  ctrlX: number;
  ctrlY: number;
  endX: number;
  endY: number;
}

const MAX_VISUAL_ANGLE = 135;

export default function MagicalWorldCanvas({
  liveAngleRef,
  repCount,
  targetReps = 10,
  repState,
  holdStage,
  holdProgressPercent,
  selectedCharacter,
  isPaused,
  isPlaying,
}: MagicalWorldCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poolRef = useRef<MagicalEffectPool | null>(null);
  if (!poolRef.current) poolRef.current = new MagicalEffectPool();

  const isQuestComplete = targetReps > 0 && repCount >= targetReps;
  const shouldAnimate = isPlaying && !isPaused && !isQuestComplete;

  const stateRef = useRef({
    repCount,
    repState,
    holdStage,
    holdProgressPercent,
    selectedCharacter,
    isPaused,
    isPlaying,
    shouldAnimate,
  });

  stateRef.current = {
    repCount,
    repState,
    holdStage,
    holdProgressPercent,
    selectedCharacter,
    isPaused,
    isPlaying,
    shouldAnimate,
  };

  const prevRepCountRef = useRef(repCount);
  const starPosRef = useRef({ x: 480, y: 180, initialized: false });
  const respawnTimerRef = useRef(1);
  const flyingStarRef = useRef<FlyingStarFlight>({
    active: false,
    elapsed: 0,
    duration: 0.72,
    startX: 0,
    startY: 0,
    ctrlX: 0,
    ctrlY: 0,
    endX: 72,
    endY: 36,
  });

  const syncLoopRef = useRef<(() => void) | null>(null);

  // Launch star-to-HUD flight and burst ONLY when ShoulderArcTracker confirms a completed rep
  useEffect(() => {
    if (repCount === 0) {
      prevRepCountRef.current = 0;
      flyingStarRef.current.active = false;
      respawnTimerRef.current = 1;
      return;
    }

    if (repCount > prevRepCountRef.current) {
      const origin = starPosRef.current;
      poolRef.current?.spawnCollectionBurst(origin.x, origin.y, 24);

      const flight = flyingStarRef.current;
      flight.active = true;
      flight.elapsed = 0;
      flight.duration = 0.72;
      flight.startX = origin.x;
      flight.startY = origin.y;
      flight.endX = 72;
      flight.endY = 36;
      flight.ctrlX = (origin.x + 72) * 0.5;
      flight.ctrlY = Math.min(origin.y, 36) - 65;

      starPosRef.current.initialized = false;
      respawnTimerRef.current = -0.35;
    }

    prevRepCountRef.current = repCount;
  }, [repCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const pool = poolRef.current;
    if (!canvas || !pool) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let frozenTime = lastTime;
    let scrollDistance = 0;
    let smoothedAngle = liveAngleRef.current;
    let prevHeroY = 0;
    let trailAccumulator = 0;
    let gateSparkleAccumulator = 0;
    let flightTrailAccumulator = 0;
    let caches: WorldCaches | null = null;

    const renderFrame = (now: number, advanceSimulation: boolean) => {
      if (!caches) return;

      const dt = advanceSimulation
        ? Math.min((now - lastTime) / 1000, 0.05)
        : 0;
      lastTime = now;
      if (advanceSimulation) {
        frozenTime = now;
      }

      const { width, height } = caches;
      const timeSec = frozenTime / 1000;
      const snapshot = stateRef.current;
      const heroX = Math.max(96, width * 0.26);

      if (advanceSimulation && snapshot.isPlaying && !snapshot.isPaused) {
        scrollDistance += dt * 115;
      }

      if (advanceSimulation && !snapshot.isPaused) {
        const targetAngle = liveAngleRef.current;
        smoothedAngle += (targetAngle - smoothedAngle) * Math.min(1, dt * 11);
      }

      const liftRatio = Math.min(
        Math.max(smoothedAngle / MAX_VISUAL_ANGLE, 0),
        1,
      );

      // 1. Storybook Forest, Interactive 90° Cloud Gate & 120° Star Canopy
      const { minY, maxY, y90, y120 } = drawStorybookWorld(
        ctx,
        caches,
        scrollDistance,
        timeSec,
        {
          heroX,
          holdStage: snapshot.holdStage,
          holdProgressPercent: snapshot.holdProgressPercent,
          repState: snapshot.repState,
          maxVisualAngle: MAX_VISUAL_ANGLE,
        },
      );

      if (
        advanceSimulation &&
        snapshot.isPlaying &&
        !snapshot.isPaused &&
        snapshot.holdStage === 90
      ) {
        gateSparkleAccumulator += dt;
        if (gateSparkleAccumulator >= 0.09) {
          gateSparkleAccumulator = 0;
          pool.spawnGateSparkle(heroX, y90);
        }
      }

      // 2. Hero Position
      const heroY = minY - liftRatio * (minY - maxY);
      const verticalVelocity =
        !advanceSimulation || prevHeroY === 0 || dt <= 0
          ? 0
          : (heroY - prevHeroY) / dt;
      if (advanceSimulation) {
        prevHeroY = heroY;
      }
      const isGirl = snapshot.selectedCharacter === "super-girl";

      if (
        advanceSimulation &&
        snapshot.isPlaying &&
        !snapshot.isPaused &&
        (liftRatio > 0.14 || snapshot.holdStage !== null)
      ) {
        trailAccumulator += dt;
        if (trailAccumulator >= 0.055) {
          trailAccumulator = 0;
          pool.spawnTrailSparkle(
            heroX - 18,
            heroY + 18,
            isGirl ? "#f9a8d4" : "#bae6fd",
          );
        }
      }

      // 3. Collectible Magical Star
      const baseStarX = Math.min(width * 0.62, width - 84);
      const baseStarY = y120 + Math.sin(timeSec * 3.1) * 7;

      let desiredStarX = baseStarX;
      let desiredStarY = baseStarY;

      if (snapshot.holdStage === 120) {
        const pull = Math.min(Math.max(snapshot.holdProgressPercent / 100, 0), 1);
        const pullWeight = 0.35 + pull * 0.65;
        desiredStarX = baseStarX + (heroX + 54 - baseStarX) * pullWeight;
        desiredStarY = baseStarY + (heroY - 14 - baseStarY) * pullWeight;
      }

      if (!starPosRef.current.initialized) {
        starPosRef.current.x = baseStarX;
        starPosRef.current.y = baseStarY;
        starPosRef.current.initialized = true;
      } else if (advanceSimulation) {
        const followRate = Math.min(1, dt * 8);
        starPosRef.current.x += (desiredStarX - starPosRef.current.x) * followRate;
        starPosRef.current.y += (desiredStarY - starPosRef.current.y) * followRate;
      }

      if (advanceSimulation && respawnTimerRef.current < 1) {
        respawnTimerRef.current = Math.min(1, respawnTimerRef.current + dt * 1.8);
      }

      const starAlpha = Math.max(0, Math.min(1, respawnTimerRef.current));
      const starScale = starAlpha > 0 ? 0.45 + 0.55 * starAlpha : 0;

      if (snapshot.holdStage === 120 && starAlpha > 0.2) {
        drawMagneticBeam(
          ctx,
          heroX,
          heroY,
          starPosRef.current.x,
          starPosRef.current.y,
          timeSec,
          Math.min(Math.max(snapshot.holdProgressPercent / 100, 0), 1),
        );
      }

      drawMagicalStarCollectible(
        ctx,
        starPosRef.current.x,
        starPosRef.current.y,
        timeSec,
        snapshot.holdStage,
        snapshot.holdProgressPercent,
        starScale,
        starAlpha,
      );

      // 4. Original Cartoon Hero
      drawMagicalHero(ctx, {
        x: heroX,
        y: heroY,
        time: timeSec,
        liftRatio,
        verticalVelocity,
        isGirl,
        repState: snapshot.repState,
        holdStage: snapshot.holdStage,
        holdProgressPercent: snapshot.holdProgressPercent,
      });

      // 5. Flying Earned Star Animation
      const flight = flyingStarRef.current;
      if (flight.active) {
        if (advanceSimulation) {
          flight.elapsed += dt;
        }
        const t = Math.min(1, flight.elapsed / flight.duration);
        const inv = 1 - t;
        const fx =
          inv * inv * flight.startX +
          2 * inv * t * flight.ctrlX +
          t * t * flight.endX;
        const fy =
          inv * inv * flight.startY +
          2 * inv * t * flight.ctrlY +
          t * t * flight.endY;

        if (advanceSimulation) {
          flightTrailAccumulator += dt;
          if (flightTrailAccumulator >= 0.03) {
            flightTrailAccumulator = 0;
            pool.spawnTrailSparkle(fx, fy, "#fde047");
          }
        }

        const flyScale = 1.05 - 0.5 * t;
        ctx.save();
        ctx.translate(fx, fy);
        ctx.scale(flyScale, flyScale);
        drawStarShape(ctx, 0, 0, 22, 10, "#fde047", "#b45309", t * Math.PI * 3);
        ctx.restore();

        if (advanceSimulation && t >= 1) {
          flight.active = false;
          pool.spawnCollectionBurst(flight.endX, flight.endY, 12);
        }
      }

      // 6. Pooled Ambient Fireflies, Sparkles & Bursts
      pool.updateAndDraw(
        ctx,
        dt,
        width,
        height,
        timeSec,
        !advanceSimulation || snapshot.isPaused,
      );
    };

    const tick = (now: number) => {
      if (disposed || !stateRef.current.shouldAnimate) {
        rafId = 0;
        return;
      }
      renderFrame(now, true);
      rafId = requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const syncLoop = () => {
      if (disposed) return;
      if (stateRef.current.shouldAnimate) {
        if (rafId === 0) {
          lastTime = performance.now();
          rafId = requestAnimationFrame(tick);
        }
      } else {
        stopLoop();
        renderFrame(performance.now(), false);
      }
    };

    syncLoopRef.current = syncLoop;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = parent.getBoundingClientRect();
      const cssWidth = Math.max(1, Math.floor(rect.width));
      const cssHeight = Math.max(1, Math.floor(rect.height));

      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      caches = createWorldCaches(ctx, cssWidth, cssHeight);
      pool.seedFireflies(cssWidth, cssHeight);

      if (!stateRef.current.shouldAnimate) {
        renderFrame(performance.now(), false);
      }
    };

    resize();
    syncLoop();

    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    return () => {
      disposed = true;
      syncLoopRef.current = null;
      stopLoop();
      observer.disconnect();
    };
  }, [liveAngleRef]);

  useEffect(() => {
    syncLoopRef.current?.();
  }, [shouldAnimate, selectedCharacter]);

  return <canvas ref={canvasRef} className="magical-world-canvas" />;
}
