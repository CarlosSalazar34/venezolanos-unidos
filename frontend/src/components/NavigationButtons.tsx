"use client";

import { AnimateOnView } from "@/components/AnimateOnView";
import React from "react";

type RouteButton = {
  label: string;
  href: string;
  isExternal?: boolean;
  icon?: React.ReactNode;
};

interface NavigationButtonsProps {
  routes: RouteButton[];
}

export function NavigationButtons({ routes }: NavigationButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-5 justify-center max-w-5xl w-full">
      {routes.map((route, idx) => (
        <AnimateOnView
          key={idx}
          animation="slideUp"
          delay={0.3 + idx * 0.1}
          duration={0.6}
          className="w-full"
        >
          <a
            href={route.href}
            target={route.isExternal ? "_blank" : undefined}
            rel={route.isExternal ? "noopener noreferrer" : undefined}
            className="md:px-8 md:py-4 px-2 py-4 rounded-2xl font-bold transition-all! duration-300! hover:border-blue-400! border-transparen! border! text-foreground bg-foreground/10 md:text-sm text-center text-xs w-full h-full justify-center items-center flex glass-card gap-2!"
          >
            {route.label}
            {route.icon && route.icon}
          </a>
        </AnimateOnView>
      ))}
    </div>
  );
}
