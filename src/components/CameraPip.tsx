import { memo, useState, type RefObject } from "react";
import type { UseCamera } from "../hooks/useCamera";
import type { ShoulderSide } from "./types";

interface CameraPipProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  camera: UseCamera;
  selectedSide: ShoulderSide;
  onSelectSide: (side: ShoulderSide) => void;
  isPaused: boolean;
  visible: boolean;
}

function areCameraPipPropsEqual(
  prev: CameraPipProps,
  next: CameraPipProps,
): boolean {
  return (
    prev.videoRef === next.videoRef &&
    prev.canvasRef === next.canvasRef &&
    prev.selectedSide === next.selectedSide &&
    prev.onSelectSide === next.onSelectSide &&
    prev.isPaused === next.isPaused &&
    prev.visible === next.visible &&
    prev.camera.status === next.camera.status &&
    prev.camera.error === next.camera.error &&
    prev.camera.start === next.camera.start
  );
}

function CameraPip({
  videoRef,
  canvasRef,
  camera,
  selectedSide,
  onSelectSide,
  isPaused,
  visible,
}: CameraPipProps) {
  const [collapsed, setCollapsed] = useState(false);

  const rootClass = [
    "camera-pip",
    !visible ? "is-prestart" : "",
    collapsed ? "is-collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={rootClass} aria-label="Camera tracking status">
      <div className="camera-pip-header">
        <span className="camera-pip-status">
          <span className={`camera-status-dot ${camera.status}`} />
          {camera.status === "active" ? "Tracking" : camera.status}
        </span>

        <button
          type="button"
          className="camera-pip-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? "Show Cam" : "Hide"}
        </button>
      </div>

      <div className="camera-pip-viewport">
        <video ref={videoRef} autoPlay muted playsInline />
        <canvas ref={canvasRef} />
      </div>

      {!collapsed && (
        <>
          <div className="camera-pip-sides">
            <button
              type="button"
              className={`camera-side-btn ${selectedSide === "left" ? "active" : ""}`}
              onClick={() => onSelectSide("left")}
              disabled={isPaused}
            >
              Left Arm
            </button>
            <button
              type="button"
              className={`camera-side-btn ${selectedSide === "right" ? "active" : ""}`}
              onClick={() => onSelectSide("right")}
              disabled={isPaused}
            >
              Right Arm
            </button>
          </div>

          {camera.status !== "active" && (
            <button
              type="button"
              className="camera-retry-btn"
              onClick={() => camera.start()}
              disabled={camera.status === "starting"}
            >
              {camera.status === "starting" ? "Starting..." : "Retry Camera"}
            </button>
          )}

          {camera.error && (
            <p className="camera-pip-error">{camera.error.message}</p>
          )}
        </>
      )}
    </aside>
  );
}

export default memo(CameraPip, areCameraPipPropsEqual);
