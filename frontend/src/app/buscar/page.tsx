import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnimateOnView } from "@/components/AnimateOnView";
import { BuscarPersonasContent } from "@/components/BuscarPersonasContent";

export default function BuscarPersonasPage() {
  return (
    <main className="min-h-screen bg-background text-foreground pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center text-foreground/70 hover:text-foreground mb-8 transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" />
        Volver al inicio
      </Link>

      <AnimateOnView animation="slideUp" duration={0.5} className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Buscador de Personas y Pacientes
        </h1>
        <p className="text-foreground/70 text-lg">
          Busca a familiares o amigos en nuestra base de datos consolidada de
          hospitales, refugios y centros de salud.
        </p>
      </AnimateOnView>

      <Suspense>
        <BuscarPersonasContent />
      </Suspense>
    </main>
  );
}
