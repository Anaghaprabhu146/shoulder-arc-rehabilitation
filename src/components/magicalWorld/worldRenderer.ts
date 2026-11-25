import type { WorldCaches, WorldStageParams } from "./types";

export function createWorldCaches(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): WorldCaches {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, "#1a236e");
  skyGrad.addColorStop(0.42, "#3563d8");
  skyGrad.addColorStop(0.78, "#67c6f7");
  skyGrad.addColorStop(1, "#c7f0fe");

  const sunX = width * 0.78;
  const sunY = height * 0.22;
  const sunGlowGrad = ctx.createRadialGradient(
    sunX,
    sunY,
    12,
    sunX,
    sunY,
    Math.max(width, height) * 0.36,
  );
  sunGlowGrad.addColorStop(0, "rgba(254, 240, 138, 0.5)");
  sunGlowGrad.addColorStop(0.35, "rgba(253, 224, 71, 0.16)");
  sunGlowGrad.addColorStop(1, "rgba(253, 224, 71, 0)");

  const farHillGrad = ctx.createLinearGradient(0, height * 0.56, 0, height);
  farHillGrad.addColorStop(0, "#5b5bd6");
  farHillGrad.addColorStop(1, "#3730a3");

  const midHillGrad = ctx.createLinearGradient(0, height * 0.68, 0, height);
  midHillGrad.addColorStop(0, "#22c55e");
  midHillGrad.addColorStop(1, "#15803d");

  const groundGrad = ctx.createLinearGradient(0, height * 0.85, 0, height);
  groundGrad.addColorStop(0, "#16a34a");
  groundGrad.addColorStop(1, "#14532d");

  return {
    width,
    height,
    skyGrad,
    sunGlowGrad,
    farHillGrad,
    midHillGrad,
    groundGrad,
  };
}

function drawPuffyCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(199, 210, 254, 0.72)";
  ctx.beginPath();
  ctx.ellipse(32, 12, 46, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
  ctx.beginPath();
  ctx.arc(0, 4, 22, 0, Math.PI * 2);
  ctx.arc(24, -10, 29, 0, Math.PI * 2);
  ctx.arc(54, -4, 24, 0, Math.PI * 2);
  ctx.arc(70, 6, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawStorybookCastle(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number,
  time: number,
): void {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#6366f1";
  ctx.beginPath();
  ctx.roundRect(-34, -52, 68, 56, 4);
  ctx.fill();

  ctx.fillStyle = "#4f46e5";
  ctx.beginPath();
  ctx.roundRect(-48, -74, 22, 78, 3);
  ctx.roundRect(26, -74, 22, 78, 3);
  ctx.fill();

  ctx.fillStyle = "#818cf8";
  ctx.beginPath();
  ctx.roundRect(-14, -96, 28, 100, 3);
  ctx.fill();

  ctx.fillStyle = "#ec4899";
  const drawRoof = (rx: number, ry: number, rw: number, rh: number) => {
    ctx.beginPath();
    ctx.moveTo(rx - rw, ry);
    ctx.lineTo(rx, ry - rh);
    ctx.lineTo(rx + rw, ry);
    ctx.closePath();
    ctx.fill();
  };
  drawRoof(-37, -74, 15, 26);
  drawRoof(37, -74, 15, 26);
  drawRoof(0, -96, 19, 34);

  const wave = Math.sin(time * 3.5 + x * 0.02) * 3;
  ctx.fillStyle = "#fde047";
  ctx.beginPath();
  ctx.moveTo(0, -130);
  ctx.lineTo(18, -125 + wave);
  ctx.lineTo(0, -120);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.arc(0, -68, 4.5, 0, Math.PI * 2);
  ctx.arc(-37, -50, 3.5, 0, Math.PI * 2);
  ctx.arc(37, -50, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

const TREE_FOLIAGE_EVEN = ["#059669", "#10b981", "#34d399"] as const;
const TREE_FOLIAGE_ODD = ["#0d9488", "#14b8a6", "#5eead4"] as const;

function drawGlowingTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  scale: number,
  variant: number,
  time: number,
): void {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#78350f";
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.quadraticCurveTo(-7, -38, -5, -62);
  ctx.lineTo(6, -62);
  ctx.quadraticCurveTo(8, -38, 12, 0);
  ctx.closePath();
  ctx.fill();

  const foliageColors = variant % 2 === 0 ? TREE_FOLIAGE_EVEN : TREE_FOLIAGE_ODD;

  ctx.fillStyle = foliageColors[0];
  ctx.beginPath();
  ctx.arc(-20, -68, 24, 0, Math.PI * 2);
  ctx.arc(20, -66, 22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = foliageColors[1];
  ctx.beginPath();
  ctx.arc(0, -86, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = foliageColors[2];
  ctx.beginPath();
  ctx.arc(-6, -94, 15, 0, Math.PI * 2);
  ctx.fill();

  const pulse = 0.65 + 0.35 * Math.sin(time * 2.8 + variant * 1.9);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = variant % 2 === 0 ? "#fde047" : "#f9a8d4";
  ctx.beginPath();
  ctx.arc(-16, -72, 4, 0, Math.PI * 2);
  ctx.arc(14, -76, 4.5, 0, Math.PI * 2);
  ctx.arc(2, -96, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawFloatingIsland(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  const bob = Math.sin(time * 1.6 + x * 0.01) * 4;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#6d28d9";
  ctx.beginPath();
  ctx.moveTo(-54, 0);
  ctx.lineTo(54, 0);
  ctx.lineTo(30, 28);
  ctx.lineTo(4, 42);
  ctx.lineTo(-28, 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#8b5cf6";
  ctx.beginPath();
  ctx.moveTo(-26, 0);
  ctx.lineTo(14, 0);
  ctx.lineTo(4, 42);
  ctx.lineTo(-28, 24);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#4ade80";
  ctx.beginPath();
  ctx.roundRect(-60, -10, 120, 16, 8);
  ctx.fill();

  ctx.fillStyle = "rgba(186, 230, 253, 0.72)";
  ctx.beginPath();
  ctx.roundRect(14, 4, 10, 52, 5);
  ctx.fill();

  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(-28, -12, 11, 0, Math.PI * 2);
  ctx.arc(-16, -15, 13, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws the interactive 90° Cloud Gate arch centered in the hero's vertical lane.
 */
function drawCloudGate(
  ctx: CanvasRenderingContext2D,
  gateX: number,
  y90: number,
  width: number,
  timeSec: number,
  stage: WorldStageParams,
): void {
  const isHolding90 = stage.holdStage === 90;
  const isStageCleared =
    stage.holdStage === 120 || stage.repState === "lowering";
  const progress = isHolding90
    ? Math.min(Math.max(stage.holdProgressPercent / 100, 0), 1)
    : isStageCleared
      ? 1
      : 0;
  const pulse = isHolding90 ? 1 + Math.sin(timeSec * 6.5) * 0.045 : 1;

  // Subtle horizontal altitude guide line across the sky
  ctx.save();
  ctx.setLineDash([8, 10]);
  ctx.lineWidth = isHolding90 ? 2.5 : 1.5;
  ctx.strokeStyle = isHolding90
    ? "rgba(103, 232, 249, 0.7)"
    : isStageCleared
      ? "rgba(74, 222, 128, 0.45)"
      : "rgba(255, 255, 255, 0.22)";
  ctx.beginPath();
  ctx.moveTo(22, y90);
  ctx.lineTo(width - 22, y90);
  ctx.stroke();
  ctx.restore();

  // Cartoon Cloud Archway around hero lane
  ctx.save();
  ctx.translate(gateX, y90);
  ctx.scale(pulse, pulse);

  // Outer aura when holding 90° or cleared
  if (isHolding90 || isStageCleared) {
    ctx.fillStyle = isHolding90
      ? "rgba(103, 232, 249, 0.2)"
      : "rgba(74, 222, 128, 0.16)";
    ctx.beginPath();
    ctx.arc(0, 0, 62, Math.PI, 0);
    ctx.lineTo(62, 16);
    ctx.lineTo(-62, 16);
    ctx.closePath();
    ctx.fill();
  }

  // Base glowing portal arch
  ctx.strokeStyle = isStageCleared
    ? "rgba(134, 239, 172, 0.8)"
    : "rgba(186, 230, 253, 0.55)";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 6, 48, Math.PI, 0);
  ctx.stroke();

  // Hold-progress illuminated arch overlay (truth from ShoulderArcTracker)
  if (progress > 0) {
    ctx.strokeStyle = isStageCleared ? "#4ade80" : "#22d3ee";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(0, 6, 48, Math.PI, Math.PI + Math.PI * progress);
    ctx.stroke();
  }

  // Fluffy Left & Right Cloud Pillars
  const drawGatePuff = (px: number, py: number) => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = isHolding90 ? "#22d3ee" : "#93c5fd";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(px - 10, py + 2, 11, 0, Math.PI * 2);
    ctx.arc(px + 10, py + 2, 11, 0, Math.PI * 2);
    ctx.arc(px, py - 5, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  drawGatePuff(-48, 8);
  drawGatePuff(48, 8);

  // Orbiting mini sparkles when active
  if (isHolding90) {
    for (let i = 0; i < 4; i += 1) {
      const a = Math.PI + ((timeSec * 1.4 + i * 0.25) % 1) * Math.PI;
      const sx = Math.cos(a) * 48;
      const sy = 6 + Math.sin(a) * 48;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  // Clean Cloud Gate Label
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillStyle = isHolding90
    ? "#a5f3fc"
    : isStageCleared
      ? "#86efac"
      : "rgba(255, 255, 255, 0.85)";
  ctx.fillText(
    isStageCleared ? "90° Cloud Gate ✓" : "90° Cloud Gate",
    24,
    y90 - 8,
  );
}

/**
 * Draws the interactive 120° Star Canopy ribbon and twinkling canopy stars.
 */
function drawStarCanopy(
  ctx: CanvasRenderingContext2D,
  y120: number,
  width: number,
  timeSec: number,
  stage: WorldStageParams,
): void {
  const isHolding120 = stage.holdStage === 120;
  const isLowering = stage.repState === "lowering";

  // Soft canopy glow band
  if (isHolding120 || isLowering) {
    ctx.fillStyle = isHolding120
      ? "rgba(253, 224, 71, 0.14)"
      : "rgba(253, 224, 71, 0.08)";
    ctx.fillRect(0, y120 - 18, width, 36);
  }

  // Gentle scalloped star-canopy ribbon
  ctx.save();
  ctx.strokeStyle = isHolding120
    ? "rgba(253, 224, 71, 0.92)"
    : "rgba(254, 240, 138, 0.42)";
  ctx.lineWidth = isHolding120 ? 3 : 2;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(22, y120);
  ctx.lineTo(width - 22, y120);
  ctx.stroke();
  ctx.restore();

  // Twinkling canopy star charms along the upper sky line
  const charmCount = 6;
  for (let i = 0; i < charmCount; i += 1) {
    const cx = 140 + ((width - 200) * i) / Math.max(1, charmCount - 1);
    const cy = y120 + Math.sin(timeSec * 2.5 + i * 1.4) * 4;
    const radius = isHolding120 ? 5.2 : 3.6;
    ctx.globalAlpha = isHolding120
      ? 0.95
      : 0.45 + 0.35 * Math.sin(timeSec * 3 + i);
    ctx.fillStyle = "#fde047";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillStyle = isHolding120 ? "#fef08a" : "rgba(255, 255, 255, 0.88)";
  ctx.fillText("120° Star Canopy", 24, y120 - 8);
}

export function drawStorybookWorld(
  ctx: CanvasRenderingContext2D,
  caches: WorldCaches,
  scrollDistance: number,
  timeSec: number,
  stage: WorldStageParams,
): { groundY: number; minY: number; maxY: number; y90: number; y120: number } {
  const { width, height } = caches;

  // 1. Sky backdrop & warm fantasy sun glow
  ctx.fillStyle = caches.skyGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = caches.sunGlowGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(254, 249, 195, 0.85)";
  ctx.beginPath();
  ctx.arc(width * 0.78, height * 0.22, 28, 0, Math.PI * 2);
  ctx.fill();

  // 2. Twinkling upper-sky stars (uses globalAlpha to avoid string allocations)
  ctx.fillStyle = "#ffffe0";
  for (let i = 0; i < 20; i += 1) {
    const sx = ((i * 191 - scrollDistance * 0.05) % width + width) % width;
    const sy = 26 + ((i * 59) % Math.max(70, height * 0.34));
    ctx.globalAlpha = 0.28 + 0.55 * Math.sin(timeSec * 2.1 + i * 1.3);
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5 + (i % 2), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 3. Distant Mountain Silhouettes
  const mountainBase = height * 0.72;
  ctx.fillStyle = "rgba(99, 102, 241, 0.42)";
  ctx.beginPath();
  ctx.moveTo(0, height);
  const mountainSpan = width + 420;
  for (let i = -1; i <= 5; i += 1) {
    const peakX =
      ((i * (mountainSpan / 5) - scrollDistance * 0.14) % mountainSpan +
        mountainSpan) %
        mountainSpan -
      140;
    const peakH = 110 + (Math.abs(i) % 3) * 42;
    ctx.lineTo(peakX - 130, mountainBase);
    ctx.lineTo(peakX, mountainBase - peakH);
    ctx.lineTo(peakX + 130, mountainBase);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // 4. Distant Storybook Castles
  const castleSpan = width + 520;
  for (let i = 0; i < 2; i += 1) {
    const cx =
      ((i * (castleSpan / 2) + 180 - scrollDistance * 0.2) % castleSpan +
        castleSpan) %
        castleSpan -
      120;
    drawStorybookCastle(ctx, cx, height * 0.69, 0.82 + i * 0.14, timeSec);
  }

  // 5. Drifting Puffy Magical Clouds
  const cloudSpan = width + 320;
  for (let i = 0; i < 5; i += 1) {
    const cx =
      ((i * (cloudSpan / 5) - scrollDistance * 0.26) % cloudSpan + cloudSpan) %
        cloudSpan -
      160;
    const cy = height * (0.16 + (i % 3) * 0.11);
    drawPuffyCloud(ctx, cx, cy, 0.75 + (i % 2) * 0.25);
  }

  // 6. Floating Enchanted Islands
  const islandSpan = width + 440;
  for (let i = 0; i < 3; i += 1) {
    const ix =
      ((i * (islandSpan / 3) + 120 - scrollDistance * 0.45) % islandSpan +
        islandSpan) %
        islandSpan -
      140;
    const iy = height * (0.43 + (i % 2) * 0.12);
    drawFloatingIsland(ctx, ix, iy, 0.72 + (i % 2) * 0.16, timeSec);
  }

  // 7. Far Rolling Forest Hills
  const farHillY = height * 0.72;
  ctx.fillStyle = caches.farHillGrad;
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width + 36; x += 36) {
    const wave = Math.sin((x + scrollDistance * 0.38) * 0.007) * 28;
    ctx.lineTo(x, farHillY + wave);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // 8. Midground Storybook Trees & Emerald Hills
  const midHillY = height * 0.79;
  const treeSpan = width + 300;
  for (let i = 0; i < 6; i += 1) {
    const tx =
      ((i * (treeSpan / 6) - scrollDistance * 0.62) % treeSpan + treeSpan) %
        treeSpan -
      90;
    const ty = midHillY + Math.sin((tx + scrollDistance * 0.62) * 0.011 + 1.1) * 14;
    drawGlowingTree(ctx, tx, ty + 14, 0.8 + (i % 3) * 0.18, i, timeSec);
  }

  ctx.fillStyle = caches.midHillGrad;
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x <= width + 32; x += 32) {
    const wave = Math.sin((x + scrollDistance * 0.65) * 0.011 + 1.1) * 20;
    ctx.lineTo(x, midHillY + wave);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // 9. Foreground Meadow Path & Flora
  const groundY = height * 0.87;
  ctx.fillStyle = caches.groundGrad;
  ctx.fillRect(0, groundY, width, height - groundY);

  ctx.fillStyle = "#86efac";
  ctx.fillRect(0, groundY, width, 6);

  const propSpan = width + 220;
  for (let i = 0; i < 8; i += 1) {
    const fx =
      ((i * (propSpan / 8) - scrollDistance * 1.15) % propSpan + propSpan) %
        propSpan -
      80;

    if (i % 3 === 0) {
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.arc(fx, groundY + 4, 15, Math.PI, 0);
      ctx.arc(fx + 16, groundY + 4, 11, Math.PI, 0);
      ctx.fill();
    } else if (i % 3 === 1) {
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(fx - 3, groundY + 12, 6, 12);
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(fx, groundY + 12, 10, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(fx - 3, groundY + 7, 2, 0, Math.PI * 2);
      ctx.arc(fx + 3, groundY + 9, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const fy = groundY + 18;
      ctx.strokeStyle = "#166534";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(fx, fy + 10);
      ctx.lineTo(fx, fy - 3);
      ctx.stroke();
      ctx.fillStyle = i % 2 === 0 ? "#fde047" : "#f472b6";
      ctx.beginPath();
      ctx.arc(fx, fy - 5, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(fx, fy - 5, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 10. Interactive 90° Cloud Gate & 120° Star Canopy
  const minY = groundY - 40;
  const maxY = Math.max(96, height * 0.18);
  const yForAngle = (deg: number) =>
    minY - Math.min(Math.max(deg / stage.maxVisualAngle, 0), 1) * (minY - maxY);

  const y90 = yForAngle(90);
  const y120 = yForAngle(120);

  drawCloudGate(ctx, stage.heroX, y90, width, timeSec, stage);
  drawStarCanopy(ctx, y120, width, timeSec, stage);

  return { groundY, minY, maxY, y90, y120 };
}
