import { atom } from "jotai";

export type AnimatedElement = {
  id: string;
  isVisible: boolean;
  isAnimated: boolean;
};

// Atom global que gestiona cuáles elementos están visibles/animados
export const animatedElementsAtom = atom<Map<string, AnimatedElement>>(
  new Map(),
);

// Función auxiliar para generar IDs únicos
export const generateElementId = (): string => {
  return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
