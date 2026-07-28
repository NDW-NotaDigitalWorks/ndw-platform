"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useState } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  routeId: string;
  stopId: string;
  label?: string;
  completedLabel?: string;
};

const COMPLETE_THRESHOLD = 88;

const formStyle: CSSProperties = { width: "100%" };

const trackStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  minHeight: 72,
  overflow: "hidden",
  borderRadius: 22,
  border: "1px solid rgba(74,222,128,0.32)",
  background:
    "linear-gradient(180deg,rgba(15,23,42,0.98) 0%,rgba(2,6,23,0.98) 100%)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 40px rgba(0,0,0,0.28)",
  touchAction: "none",
  userSelect: "none",
};

const fillBaseStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  transformOrigin: "left center",
  background:
    "linear-gradient(90deg,rgba(34,197,94,0.2) 0%,rgba(34,197,94,0.88) 100%)",
  pointerEvents: "none",
};

const labelStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 76px",
  color: "#f8fafc",
  fontSize: "clamp(14px, 3.8vw, 17px)",
  lineHeight: 1.15,
  fontWeight: 950,
  letterSpacing: "0.01em",
  textAlign: "center",
  pointerEvents: "none",
};

const thumbBaseStyle: CSSProperties = {
  position: "absolute",
  top: 7,
  left: 7,
  width: 58,
  height: 58,
  border: 0,
  borderRadius: 18,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(145deg,#4ade80 0%,#16a34a 100%)",
  color: "#052e16",
  fontSize: 26,
  fontWeight: 950,
  boxShadow:
    "0 10px 24px rgba(34,197,94,0.34), inset 0 1px 0 rgba(255,255,255,0.5)",
  cursor: "grab",
  touchAction: "none",
};

const helperStyle: CSSProperties = {
  margin: "9px 0 0",
  color: "#94a3b8",
  fontSize: 11,
  lineHeight: 1.4,
  fontWeight: 750,
  textAlign: "center",
};

export function RouteProCompleteSlider({
  action,
  routeId,
  stopId,
  label = "Scorri per completare lo stop",
  completedLabel = "Stop completato",
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pointerStartXRef = useRef(0);
  const dragStartProgressRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const resetOnResize = () => {
      if (!isSubmitting) {
        setProgress(0);
        setIsCompleted(false);
      }
    };

    window.addEventListener("resize", resetOnResize);
    return () => window.removeEventListener("resize", resetOnResize);
  }, [isSubmitting]);

  function getMaxTravel(): number {
    const track = trackRef.current;
    if (!track) return 1;
    return Math.max(track.clientWidth - 72, 1);
  }

  function submitCompletion() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsCompleted(true);
    setProgress(100);

    if ("vibrate" in navigator) {
      navigator.vibrate([35, 30, 70]);
    }

    window.setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 260);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>) {
    if (isSubmitting) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStartXRef.current = event.clientX;
    dragStartProgressRef.current = progress;
    setIsDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!isDragging || isSubmitting) return;

    const deltaX = event.clientX - pointerStartXRef.current;
    const progressDelta = (deltaX / getMaxTravel()) * 100;
    const nextProgress = Math.min(
      100,
      Math.max(0, dragStartProgressRef.current + progressDelta),
    );

    setProgress(nextProgress);
  }

  function finishDrag() {
    if (!isDragging || isSubmitting) return;

    setIsDragging(false);

    if (progress >= COMPLETE_THRESHOLD) {
      submitCompletion();
      return;
    }

    setProgress(0);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (isSubmitting) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      submitCompletion();
    }
  }

  const displayLabel = isSubmitting
    ? completedLabel
    : progress >= COMPLETE_THRESHOLD
      ? "Rilascia per completare"
      : label;

  return (
    <form ref={formRef} action={action} style={formStyle}>
      <input type="hidden" name="route_id" value={routeId} />
      <input type="hidden" name="stop_id" value={stopId} />

      <div
        ref={trackRef}
        style={{ ...trackStyle, opacity: isSubmitting ? 0.92 : 1 }}
        role="group"
        aria-label="Conferma completamento stop"
      >
        <div
          aria-hidden="true"
          style={{
            ...fillBaseStyle,
            transform: `scaleX(${Math.max(progress, 2) / 100})`,
            transition: isDragging ? "none" : "transform 220ms ease",
          }}
        />

        <div style={labelStyle}>
          {isSubmitting ? "✓ " : ""}
          {displayLabel}
        </div>

        <button
          type="button"
          aria-label="Trascina verso destra per completare lo stop"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          disabled={isSubmitting}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          onKeyDown={handleKeyDown}
          style={{
            ...thumbBaseStyle,
            transform: `translateX(${(progress / 100) * getMaxTravel()}px)`,
            transition: isDragging ? "none" : "transform 220ms ease",
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          {isCompleted ? "✓" : "›"}
        </button>
      </div>

      <p style={helperStyle}>
        Trascina completamente verso destra. Da tastiera premi Invio.
      </p>

      <button type="submit" hidden aria-hidden="true" tabIndex={-1}>
        Completa stop
      </button>
    </form>
  );
}