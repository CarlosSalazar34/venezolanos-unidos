"use client";

import { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import {
  animatedElementsAtom,
  generateElementId,
} from "@/components/atoms/animations";

interface UseAnimationVisibleOptions {
  threshold?: number | number[];
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useAnimationVisible(options: UseAnimationVisibleOptions = {}) {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = false } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [animatedElements, setAnimatedElements] = useAtom(animatedElementsAtom);
  const elementIdRef = useRef<string>(generateElementId());

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const elementId = elementIdRef.current;

    // Inicializar el elemento en el atom
    setAnimatedElements((prev) => {
      const newMap = new Map(prev);
      if (!newMap.has(elementId)) {
        newMap.set(elementId, {
          id: elementId,
          isVisible: false,
          isAnimated: false,
        });
      }
      return newMap;
    });

    // Crear el IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAnimatedElements((prev) => {
          const newMap = new Map(prev);
          const current = newMap.get(elementId);

          if (entry.isIntersecting) {
            // Elemento es visible
            newMap.set(elementId, {
              ...current!,
              isVisible: true,
              isAnimated: true,
            });

            // Si triggerOnce es true, parar de observar
            if (triggerOnce) {
              observer.unobserve(element);
            }
          } else if (!triggerOnce) {
            // Elemento no es visible (solo si triggerOnce es false)
            newMap.set(elementId, {
              ...current!,
              isVisible: false,
              isAnimated: false,
            });
          }

          return newMap;
        });
      },
      {
        threshold,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      // Limpiar del atom al desmontar
      setAnimatedElements((prev) => {
        const newMap = new Map(prev);
        newMap.delete(elementId);
        return newMap;
      });
    };
  }, [threshold, rootMargin, triggerOnce, setAnimatedElements]);

  // Retornar el estado visible del elemento
  const isVisible =
    animatedElements.get(elementIdRef.current)?.isVisible ?? false;

  return {
    ref: elementRef,
    isVisible,
  };
}
