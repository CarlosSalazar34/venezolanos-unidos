import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnimateOnView } from "@/components/AnimateOnView";
import {
  DashboardContent,
  type Estadisticas,
} from "@/components/DashboardContent";

async function getStats(): Promise<Estadisticas | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/estadisticas`,
      { next: { revalidate: 60 } },
    );

    if (!response.ok) return null;

    return response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
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
  );
}
