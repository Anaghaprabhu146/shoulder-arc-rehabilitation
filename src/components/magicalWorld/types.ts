import type { ShoulderHoldStage, ShoulderRepState } from "../types";

export interface HeroRenderParams {
  x: number;
  y: number;
  time: number;
  liftRatio: number;
  verticalVelocity: number;
  isGirl: boolean;
  repState: ShoulderRepState;
  holdStage: ShoulderHoldStage;
  holdProgressPercent: number;
}

export interface WorldCaches {
  width: number;
  height: number;
  skyGrad: CanvasGradient;
  sunGlowGrad: CanvasGradient;
  farHillGrad: CanvasGradient;
  midHillGrad: CanvasGradient;
  groundGrad: CanvasGradient;
}

export interface WorldStageParams {
  heroX: number;
  holdStage: ShoulderHoldStage;
  holdProgressPercent: number;
  repState: ShoulderRepState;
  maxVisualAngle: number;
}
