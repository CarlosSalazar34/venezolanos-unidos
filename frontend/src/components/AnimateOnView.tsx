"use client";

import React, { ReactNode } from "react";
import { useAnimationVisible } from "@/hooks/useAnimationVisible";

interface AnimateOnViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
  animation?: "fadeIn" | "slideUp" | "slideDown" | "scale" | "custom";
  customStyle?: React.CSSProperties;
}

/**
 * Componente que anima su contenido cuando entra en el viewport
 * Utiliza el hook useAnimationVisible internamente
 */
export function AnimateOnView({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  rootMargin = "0px",
  triggerOnce = true,
  animation = "fadeIn",
  customStyle,
}: AnimateOnViewProps) {
  const { ref, isVisible } = useAnimationVisible({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const getAnimationStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      transition: `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
      transitionDelay: `${delay}s`,
    };

    const animationStyles = {
      fadeIn: {
        opacity: isVisible ? 1 : 0,
      },
      slideUp: {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
      },
      slideDown: {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(-20px)",
      },
      scale: {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.95)",
      },
      custom: customStyle || {},
    };

    return {
      ...baseStyle,
      ...animationStyles[animation],
    };
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={getAnimationStyle()}
    >
      {children}
    </div>
  );
}
