"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimateOnView } from "@/components/AnimateOnView";

export function HeroSection() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    router.push(`/buscar?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative  text-center max-w-5xl flex flex-col justify-center items-center gap-10 w-full">
      <AnimateOnView animation="fadeIn" duration={0.6} className="inline-flex">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card md:text-sm text-foreground font-medium text-[10px]">
          <AlertCircle size={16} />
          <span>Información de Emergencia del terremoto de en Venezuela</span>
        </div>
      </AnimateOnView>

      <div className="">
        <AnimateOnView
          animation="slideUp"
          delay={0.1}
          duration={0.7}
          className="block"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            Venezolanos Unidos
          </h1>
        </AnimateOnView>
        <AnimateOnView
          animation="slideUp"
          delay={0.2}
          duration={0.7}
          className="block"
        >
          <p className="text-foreground/70 max-w-3xl mx-auto leading-relaxed text-sm md:text-base">
            Plataforma centralizada de recursos, apoyo y asistencia tras el
            reciente sismo. Encuentra centros de acopio, reportes de
            desaparecidos y evaluación estructural.
          </p>
        </AnimateOnView>
      </div>

      {/* Search Bar */}
      <AnimateOnView
        animation="scale"
        delay={0.3}
        duration={0.6}
        className="relative mx-auto w-full"
      >
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 rounded-2xl bg-foreground/10 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring! focus:ring-blue-400! transition-shadow md:text-lg  glass-card"
            placeholder="Buscar refugios, hospitales, rescatistas..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </form>
      </AnimateOnView>
    </div>
  );
}
