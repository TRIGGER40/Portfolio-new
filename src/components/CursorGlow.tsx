import { useState, useEffect } from "react";
import styles from "./CursorGlow.module.css";

export function CursorGlow() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    const handleLeave = () => setPos(null);
    window.addEventListener("mousemove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  if (!pos) return null;

  return (
    <div
      className={styles.cursorGrid}
      style={{
        maskImage: `radial-gradient(circle 200px at ${pos.x}px ${pos.y}px, black 0%, transparent 70%)`,
        WebkitMaskImage: `radial-gradient(circle 200px at ${pos.x}px ${pos.y}px, black 0%, transparent 70%)`,
      }}
      aria-hidden="true"
    />
  );
}
