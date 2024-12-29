'use client';

import { useEffect, useRef } from 'react';

export const MouseRipple = () => {
  const rippleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!rippleRef.current) return;
      
      // Update custom properties for mouse position
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
      
      // Add ripple effect class
      rippleRef.current.style.left = `${e.clientX}px`;
      rippleRef.current.style.top = `${e.clientY}px`;
      rippleRef.current.classList.add('ripple-active');
      
      // Remove the active class after animation
      setTimeout(() => {
        if (rippleRef.current) {
          rippleRef.current.classList.remove('ripple-active');
        }
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <div ref={rippleRef} className="mouse-ripple" />;
}; 