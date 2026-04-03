"use client";

import { useEffect, useState } from "react";

export default function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button') || target.closest('input')) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };
    const down = () => setClicked(true);
    const up = () => setClicked(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '8px', height: '8px',
          backgroundColor: hovered ? 'var(--nothing-red)' : '#ffffff',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10001,
          transform: `translate(${pos.x - 4}px, ${pos.y - 4}px) scale(${clicked ? 0.5 : 1})`,
          transition: 'transform 0.1s ease-out, background-color 0.2s',
          mixBlendMode: 'difference'
        }}
      />
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '40px', height: '40px',
          border: `1px solid ${hovered ? 'var(--nothing-red)' : 'rgba(255, 255, 255, 0.4)'}`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10000,
          transform: `translate(${pos.x - 20}px, ${pos.y - 20}px) scale(${hovered ? 1.5 : 1})`,
          transition: 'transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), border-color 0.2s',
        }}
      />
    </>
  );
}
