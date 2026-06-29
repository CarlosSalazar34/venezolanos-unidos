"use client";

import { HandHeart } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import { AnimateOnView } from "@/components/AnimateOnView";

type ResourceProps = {
  category: string;
  name: string;
  url: string;
  description: string;
};

interface ResourcesGridProps {
  resources: ResourceProps[];
}

export function ResourcesGrid({ resources }: ResourcesGridProps) {
  return (
    <div className="max-w-5xl px-4 sm:px-6 lg:px-8">
      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, idx) => (
            <AnimateOnView
              key={`${resource.url}-${idx}`}
              animation="slideUp"
              delay={idx * 0.1}
              duration={0.6}
              threshold={0.1}
              triggerOnce={true}
            >
              <ResourceCard resource={resource} />
            </AnimateOnView>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <HandHeart className="mx-auto h-12 w-12 text-foreground/50 mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">
            No se encontraron recursos
          </h3>
          <p className="text-foreground/70">
            Intenta mas tarde o verifica la conexion.
          </p>
        </div>
      )}
    </div>
  );
}
