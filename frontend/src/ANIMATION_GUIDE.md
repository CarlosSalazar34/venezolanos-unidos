// GUÍA DE USO: Sistema de Animaciones con Jotai

// ============================================
// 1. USANDO EL COMPONENTE AnimateOnView (Más Simple)
// ============================================

import { AnimateOnView } from "@/components/AnimateOnView";

export function ExampleWithComponent() {
return (

<div>
<AnimateOnView animation="fadeIn" delay={0.1}>
<h1>Este título se desvanecerá cuando entre en vista</h1>
</AnimateOnView>

      <AnimateOnView animation="slideUp" delay={0.2}>
        <p>Este párrafo subirá cuando entre en vista</p>
      </AnimateOnView>

      <AnimateOnView animation="scale" triggerOnce={true}>
        <div className="card">Esta tarjeta se escalará cuando entre en vista</div>
      </AnimateOnView>
    </div>

);
}

// ============================================
// 2. USANDO EL HOOK useAnimationVisible (Más Control)
// ============================================

"use client";

import { useAnimationVisible } from "@/hooks/useAnimationVisible";

export function ExampleWithHook() {
const { ref, isVisible } = useAnimationVisible({
threshold: 0.2,
triggerOnce: true,
});

return (

<div
ref={ref}
style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }} >
<h2>Control manual de animación</h2>
<p>Puedes usar el estado isVisible para cualquier lógica personalizada</p>
</div>
);
}

// ============================================
// 3. CON FRAMER MOTION (Combinado)
// ============================================

"use client";

import { motion } from "framer-motion";
import { useAnimationVisible } from "@/hooks/useAnimationVisible";

export function ExampleWithFramerMotion() {
const { ref, isVisible } = useAnimationVisible({ triggerOnce: true });

return (
<motion.div
ref={ref}
initial={{ opacity: 0, y: 20 }}
animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
transition={{ duration: 0.6 }} >

<h2>Con Framer Motion</h2>
</motion.div>
);
}

// ============================================
// OPCIONES DE AnimateOnView
// ============================================

interface AnimateOnViewProps {
children: ReactNode;
className?: string;
delay?: number; // Delay en segundos (default: 0)
duration?: number; // Duración en segundos (default: 0.6)
threshold?: number | number[]; // % visible para activar (default: 0.1)
rootMargin?: string; // Margen para IntersectionObserver (default: "0px")
triggerOnce?: boolean; // Animar solo una vez (default: true)
animation?: "fadeIn" | "slideUp" | "slideDown" | "scale" | "custom";
customStyle?: React.CSSProperties; // Para animación "custom"
}

// Ejemplos de uso:
// <AnimateOnView animation="fadeIn">Desvanecerse</AnimateOnView>
// <AnimateOnView animation="slideUp" delay={0.2}>Subir</AnimateOnView>
// <AnimateOnView animation="scale" duration={0.8}>Escalar</AnimateOnView>
// <AnimateOnView
// animation="custom"
// customStyle={{ opacity: 0, color: "red" }}
// >
// Personalizado
// </AnimateOnView>

// ============================================
// OPCIONES DE useAnimationVisible
// ============================================

interface UseAnimationVisibleOptions {
threshold?: number | number[]; // default: 0.1
rootMargin?: string; // default: "0px"
triggerOnce?: boolean; // default: false
}

// El hook retorna:
// - ref: Para asignar al elemento DOM
// - isVisible: boolean indicando si el elemento está visible
