import React, { useEffect, useRef } from 'react';

const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        // Center the 280px glow on the cursor
        const x = e.clientX - 140;
        const y = e.clientY - 140;
        glowRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[280px] h-[280px] rounded-full pointer-events-none z-[4] mix-blend-screen"
      style={{
        // Updated to Gold/Warm tone
        background: 'radial-gradient(circle, rgba(252, 211, 77, 0.15), transparent 60%)',
        filter: 'blur(80px)',
        // Initial off-screen position to prevent flash
        transform: 'translate(-9999px, -9999px)' 
      }}
    />
  );
};

export default CursorGlow;