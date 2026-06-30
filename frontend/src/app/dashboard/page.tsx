import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnimateOnView } from "@/components/AnimateOnView";
import { DashboardContent } from "@/components/DashboardContent";
import SectionScroll from "@/components/templates/SectionScroll";
import { getStats } from "@/lib/api/estadisticas";

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <SectionScroll>
      <main className="min-h-screen bg-background text-foreground pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-foreground/70 hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft size={20} className="mr-1" />
          Volver al inicio
        </Link>

        <AnimateOnView animation="slideUp" duration={0.5} className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Dashboard de Impacto
          </h1>
          <p className="text-foreground/70 text-lg">
            Metricas de pacientes y centros de salud registrados en la
            plataforma.
          </p>
        </AnimateOnView>

        <DashboardContent stats={stats} />
      </main>
    </SectionScroll>
  );
}
