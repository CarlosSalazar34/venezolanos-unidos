"use client";

import React from "react";
import { ReactLenis } from "lenis/react";
const SectionScroll = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <ReactLenis
      options={{
        prevent: (node) => node.classList.contains("scrollable"),
      }}
      className={`relative h-dvh overflow-y-auto scrollbar-thin scrollbar-thumb-foreground scrollbar-track-background bg-background ${className ?? ""}`}
    >
      {children}
    </ReactLenis>
  );
};

export default SectionScroll;
