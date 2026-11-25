import { drawStarShape } from "./collectiblesRenderer";
import type { HeroRenderParams } from "./types";

const OUTLINE = "#1e1b4b";

const GIRL_HERO_PALETTE = {
  tunic: "#a855f7",
  tunicShade: "#7e22ce",
  cape: "#f43f5e",
  hat: "#ec4899",
  trim: "#fde047",
  boots: "#db2777",
} as const;

const BOY_HERO_PALETTE = {
  tunic: "#3b82f6",
  tunicShade: "#1d4ed8",
  cape: "#f97316",
  hat: "#2563eb",
  trim: "#fde047",
  boots: "#0284c7",
} as const;

export function drawMagicalHero(
  ctx: CanvasRenderingContext2D,
  params: HeroRenderParams,
): void {
  const {
    x,
    y,
    time,
    liftRatio,
    verticalVelocity,
    isGirl,
    repState,
    holdStage,
    holdProgressPercent,
  } = params;

  const isResting = repState === "resting" && liftRatio < 0.12;
  const isReaching =
    repState === "raising" || repState === "holding" || liftRatio > 0.25;

  // Smooth idle breathing vs gentle airborne hover bob
  const bobOffset = isResting
    ? Math.sin(time * 3.1) * 3
    : Math.sin(time * 4.6) * 5;

  // Subtle squash & stretch driven by vertical motion
  const velClamp = Math.max(-1, Math.min(1, verticalVelocity * 0.004));
  const scaleY = 1 + Math.abs(velClamp) * 0.08 + (isResting ? Math.sin(time * 3.1) * 0.025 : 0);
  const scaleX = 1 / Math.sqrt(scaleY);

  // Tilt smoothly into upward flight or downward swoop
  const tilt = isResting ? 0 : -liftRatio * 0.16 - velClamp * 0.12;

  const palette = isGirl ? GIRL_HERO_PALETTE : BOY_HERO_PALETTE;

  ctx.save();
  ctx.translate(x, y + bobOffset);

  // Hold-stage magic casting ring around hero (driven strictly by analytics holdProgressPercent)
  if (holdStage !== null) {
    const progress = Math.min(Math.max(holdProgressPercent / 100, 0), 1);
    const pulse = 50 + Math.sin(time * 6) * 2.5;

    ctx.beginPath();
    ctx.arc(0, -4, pulse, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -4, pulse, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.strokeStyle = holdStage === 120 ? "#fde047" : "#67e8f9";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  ctx.rotate(tilt);
  ctx.scale(scaleX, scaleY);

  // 1. Magic Star-Cloud Cushion beneath feet
  ctx.save();
  const cloudPulse = 1 + Math.sin(time * 5) * 0.04;
  ctx.scale(cloudPulse, 1);
  ctx.fillStyle = "rgba(186, 230, 253, 0.5)";
  ctx.beginPath();
  ctx.ellipse(0, 32, 31, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#60a5fa";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(-15, 29, 9, 0, Math.PI * 2);
  ctx.arc(0, 27, 12, 0, Math.PI * 2);
  ctx.arc(15, 29, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. Flowing Multi-Segment Magical Cape
  const capeLift = isResting ? 2 : 10 + liftRatio * 8;
  const capeWave = Math.sin(time * 7.5) * (isResting ? 3 : 6);
  ctx.fillStyle = palette.cape;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.bezierCurveTo(
    -28,
    -2 + capeWave * 0.5,
    -44,
    8 + capeLift * 0.5 + capeWave,
    -46,
    22 + capeLift + capeWave,
  );
  ctx.quadraticCurveTo(-24, 20 + capeLift * 0.3, -8, 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Little Cartoon Boots (dangling gently in flight)
  const legSwing = isResting ? 0 : Math.sin(time * 7) * 3.5;
  ctx.fillStyle = palette.boots;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(-7, 21 + legSwing * 0.4, 7, 5.5, 0.1, 0, Math.PI * 2);
  ctx.ellipse(8, 21 - legSwing * 0.4, 7, 5.5, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 4. Back Arm (reaching or gliding)
  ctx.save();
  const backArmAngle = isReaching
    ? -1.25 - Math.sin(time * 5) * 0.08
    : 0.35 + Math.sin(time * 3.1) * 0.1;
  ctx.translate(11, 3);
  ctx.rotate(backArmAngle);
  ctx.fillStyle = palette.tunic;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(0, -4.5, 16, 9, 4.5);
  ctx.fill();
  ctx.stroke();
  // Cute mitten hand
  ctx.fillStyle = "#fde68a";
  ctx.beginPath();
  ctx.arc(16, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5. Rounded Tunic Body & Golden Belt Trim
  ctx.fillStyle = palette.tunic;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.roundRect(-17, -6, 34, 26, 13);
  ctx.fill();
  ctx.stroke();

  // Collar / Scarf Accent
  ctx.fillStyle = palette.trim;
  ctx.beginPath();
  ctx.roundRect(-14, -6, 28, 7, 3.5);
  ctx.fill();
  ctx.stroke();

  // Tunic Belt
  ctx.fillStyle = palette.tunicShade;
  ctx.fillRect(-15, 11, 30, 5);
  ctx.fillStyle = palette.trim;
  ctx.beginPath();
  ctx.roundRect(-4, 10, 8, 7, 2);
  ctx.fill();

  // 6. Expressive Cartoon Head
  ctx.fillStyle = "#fef3c7";
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(2, -17, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Soft Rosy Cheeks
  ctx.fillStyle = "rgba(244, 114, 182, 0.45)";
  ctx.beginPath();
  ctx.ellipse(-4, -13, 3.6, 2.2, 0, 0, Math.PI * 2);
  ctx.ellipse(13, -13, 3.6, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Natural Blink Cycle (~every 3.4s)
  const blinkCycle = time % 3.4;
  const isBlinking = blinkCycle > 3.22;

  if (isBlinking) {
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-2, -18);
    ctx.lineTo(3, -18);
    ctx.moveTo(9, -18);
    ctx.lineTo(14, -18);
    ctx.stroke();
  } else {
    // Large Clear Glossy Cartoon Eyes
    ctx.fillStyle = OUTLINE;
    ctx.beginPath();
    ctx.ellipse(0.5, -18.5, 3.4, 4.4, 0, 0, Math.PI * 2);
    ctx.ellipse(11, -18.5, 3.4, 4.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye Specular Sparkles
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(1.6, -20.2, 1.4, 0, Math.PI * 2);
    ctx.arc(12.1, -20.2, 1.4, 0, Math.PI * 2);
    ctx.arc(-0.3, -17.2, 0.7, 0, Math.PI * 2);
    ctx.arc(10.2, -17.2, 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheerful Mouth (excited open smile when holding/reaching, gentle smile at rest)
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.1;
  ctx.lineCap = "round";
  if (holdStage !== null || isReaching) {
    ctx.fillStyle = "#fb7185";
    ctx.beginPath();
    ctx.arc(6, -12, 4, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(6, -13, 3.8, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  // 7. Pointed Fantasy Explorer Hat with Floppy Tip & Star Crest
  const hatBounce = Math.sin(time * 5.2) * 2;
  ctx.fillStyle = palette.hat;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.6;

  // Hat Brim
  ctx.beginPath();
  ctx.ellipse(1, -29, 20, 5.5, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Hat Cone
  ctx.beginPath();
  ctx.moveTo(-13, -30);
  ctx.quadraticCurveTo(-8, -51, -20, -45 + hatBounce);
  ctx.quadraticCurveTo(4, -55, 14, -30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Star Badge on Hat
  drawStarShape(ctx, 2, -37, 6, 2.8, "#fde047", OUTLINE, 0);

  // 8. Front Arm (smoothly reaches upward during raise/hold)
  ctx.save();
  const frontArmAngle = isReaching
    ? -1.42 + Math.sin(time * 6) * 0.08
    : 0.48 - Math.sin(time * 3.1) * 0.08;
  ctx.translate(-9, 3);
  ctx.rotate(frontArmAngle);
  ctx.fillStyle = palette.tunic;
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(-2, -4.5, 16, 9, 4.5);
  ctx.fill();
  ctx.stroke();

  // Front Mitten Hand
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.arc(14, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}
