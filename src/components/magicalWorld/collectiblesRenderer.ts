import type { ShoulderHoldStage } from "../types";

export function drawStarShape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fill: string,
  stroke: string,
  rotation = 0,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? outerR : innerR;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();
}

export function drawMagneticBeam(
  ctx: CanvasRenderingContext2D,
  heroX: number,
  heroY: number,
  starX: number,
  starY: number,
  time: number,
  progress: number,
): void {
  ctx.save();
  ctx.strokeStyle = "rgba(253, 224, 71, 0.55)";
  ctx.lineWidth = 3 + progress * 3;
  ctx.setLineDash([8, 10]);
  ctx.lineDashOffset = -time * 90;
  ctx.beginPath();
  ctx.moveTo(heroX + 12, heroY - 12);
  ctx.lineTo(starX, starY);
  ctx.stroke();
  ctx.restore();
}

export function drawMagicalStarCollectible(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
  holdStage: ShoulderHoldStage,
  holdProgressPercent: number,
  scaleMultiplier = 1,
  alpha = 1,
): void {
  if (alpha <= 0.01) return;

  const pulse = (1 + Math.sin(time * 4.2) * 0.08) * scaleMultiplier;
  const isChargingFinal = holdStage === 120;
  const glowRadius = isChargingFinal
    ? 48 + (holdProgressPercent / 100) * 18
    : 40;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);

  // Warm Outer Halo
  ctx.fillStyle = isChargingFinal
    ? "rgba(253, 224, 71, 0.38)"
    : "rgba(254, 240, 138, 0.22)";
  ctx.beginPath();
  ctx.arc(0, 0, glowRadius * scaleMultiplier, 0, Math.PI * 2);
  ctx.fill();

  // Dashed Magic Orbit Ring
  ctx.save();
  ctx.scale(scaleMultiplier, scaleMultiplier);
  ctx.rotate(time * (isChargingFinal ? 1.8 : 0.8));
  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = isChargingFinal
    ? "rgba(253, 224, 71, 0.95)"
    : "rgba(255, 255, 255, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 31, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Orbiting Mini Sparkles
  for (let i = 0; i < 3; i += 1) {
    const orbitAngle =
      time * (isChargingFinal ? 3.5 : 2.2) + (i * Math.PI * 2) / 3;
    const ox = Math.cos(orbitAngle) * 31 * scaleMultiplier;
    const oy = Math.sin(orbitAngle) * 31 * scaleMultiplier;
    ctx.fillStyle = i === 0 ? "#ffffff" : "#fef08a";
    ctx.beginPath();
    ctx.arc(ox, oy, 3 * scaleMultiplier, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main Faceted Cartoon Star
  ctx.scale(pulse, pulse);
  drawStarShape(
    ctx,
    0,
    0,
    24,
    11,
    "#fde047",
    "#b45309",
    Math.sin(time * 1.8) * 0.12,
  );

  // Inner Bright Highlight Star
  drawStarShape(
    ctx,
    -1.5,
    -2,
    12,
    5.5,
    "#fef9c3",
    "rgba(254, 249, 195, 0)",
    Math.sin(time * 1.8) * 0.12,
  );

  // Cute Shiny Eye-Dot Pair
  ctx.fillStyle = "#92400e";
  ctx.beginPath();
  ctx.arc(-4.5, -1, 1.8, 0, Math.PI * 2);
  ctx.arc(4.5, -1, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

interface PoolParticle {
  active: boolean;
  kind: "burst" | "trail" | "firefly";
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface ShockwaveRing {
  active: boolean;
  x: number;
  y: number;
  life: number;
  maxLife: number;
  maxRadius: number;
  color: string;
}

const MAX_PARTICLES = 120;
const MAX_RINGS = 4;
const BURST_COLORS = ["#fde047", "#38bdf8", "#f472b6", "#4ade80", "#ffffff"];

/**
 * Fixed-capacity particle & shockwave pool to avoid per-frame allocations.
 */
export class MagicalEffectPool {
  private particles: PoolParticle[];
  private rings: ShockwaveRing[];
  private firefliesSeeded = false;

  constructor() {
    this.particles = Array.from({ length: MAX_PARTICLES }, () => ({
      active: false,
      kind: "burst",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1,
      size: 4,
      color: "#fde047",
    }));

    this.rings = Array.from({ length: MAX_RINGS }, () => ({
      active: false,
      x: 0,
      y: 0,
      life: 0,
      maxLife: 0.7,
      maxRadius: 90,
      color: "#fde047",
    }));
  }

  private allocParticle(): PoolParticle | null {
    for (let i = 0; i < this.particles.length; i += 1) {
      if (!this.particles[i].active) return this.particles[i];
    }
    return null;
  }

  seedFireflies(width: number, height: number): void {
    if (this.firefliesSeeded) return;
    this.firefliesSeeded = true;
    for (let i = 0; i < 14; i += 1) {
      const p = this.allocParticle();
      if (!p) break;
      p.active = true;
      p.kind = "firefly";
      p.x = (i * 97) % Math.max(100, width);
      p.y = height * 0.45 + ((i * 53) % Math.max(80, height * 0.4));
      p.vx = -18 - (i % 4) * 6;
      p.vy = Math.sin(i) * 10;
      p.life = (i * 0.4) % 4;
      p.maxLife = 9999;
      p.size = 2.5 + (i % 3);
      p.color = i % 2 === 0 ? "#fef08a" : "#a5f3fc";
    }
  }

  spawnTrailSparkle(x: number, y: number, color = "#bae6fd"): void {
    const p = this.allocParticle();
    if (!p) return;
    p.active = true;
    p.kind = "trail";
    p.x = x;
    p.y = y + (Math.random() - 0.5) * 14;
    p.vx = -55 - Math.random() * 35;
    p.vy = (Math.random() - 0.5) * 24;
    p.life = 0;
    p.maxLife = 0.55;
    p.size = 3 + Math.random() * 2.5;
    p.color = color;
  }

  spawnGateSparkle(x: number, y: number): void {
    const p = this.allocParticle();
    if (!p) return;
    p.active = true;
    p.kind = "trail";
    p.x = x + (Math.random() - 0.5) * 76;
    p.y = y + (Math.random() - 0.5) * 28;
    p.vx = (Math.random() - 0.5) * 32;
    p.vy = -25 - Math.random() * 30;
    p.life = 0;
    p.maxLife = 0.6;
    p.size = 3.2 + Math.random() * 2;
    p.color = Math.random() > 0.4 ? "#67e8f9" : "#ffffff";
  }

  spawnCollectionBurst(x: number, y: number, count = 24): void {
    for (let i = 0; i < this.rings.length; i += 1) {
      const ring = this.rings[i];
      if (!ring.active) {
        ring.active = true;
        ring.x = x;
        ring.y = y;
        ring.life = 0;
        ring.maxLife = 0.75;
        ring.maxRadius = count > 16 ? 115 : 64;
        ring.color = "#fde047";
        break;
      }
    }

    for (let i = 0; i < count; i += 1) {
      const p = this.allocParticle();
      if (!p) break;
      const angle = (Math.PI * 2 * i) / count;
      const speed = (count > 16 ? 110 : 65) + (i % 5) * 36;
      p.active = true;
      p.kind = "burst";
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 35;
      p.life = 0;
      p.maxLife = count > 16 ? 0.95 : 0.65;
      p.size = (count > 16 ? 7 : 5) + (i % 3) * 2;
      p.color = BURST_COLORS[i % BURST_COLORS.length];
    }
  }

  updateAndDraw(
    ctx: CanvasRenderingContext2D,
    dt: number,
    width: number,
    height: number,
    timeSec: number,
    isPaused: boolean,
  ): void {
    for (let i = 0; i < this.rings.length; i += 1) {
      const r = this.rings[i];
      if (!r.active) continue;
      r.life += dt;
      if (r.life >= r.maxLife) {
        r.active = false;
        continue;
      }
      const t = r.life / r.maxLife;
      const radius = 20 + r.maxRadius * t;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 5 * (1 - t);
      ctx.beginPath();
      ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i];
      if (!p.active) continue;

      if (p.kind === "firefly") {
        if (!isPaused) {
          p.x += p.vx * dt;
          p.y += Math.sin(timeSec * 2 + i) * 14 * dt;
          if (p.x < -12) p.x = width + 12;
          if (p.y < height * 0.25) p.y = height * 0.8;
        }
        const glow = 0.35 + 0.45 * Math.sin(timeSec * 3.5 + i * 1.7);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.15, glow);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        continue;
      }

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === "burst") {
        p.vy += 190 * dt;
      }

      const alpha = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (p.kind === "burst") {
        drawStarShape(
          ctx,
          p.x,
          p.y,
          p.size,
          p.size * 0.45,
          p.color,
          "#1e1b4b",
          p.life * 4.5,
        );
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.4 + alpha * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
