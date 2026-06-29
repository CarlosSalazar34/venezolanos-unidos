"use client";

import { FormEvent, useEffect, useState } from "react";
import { Activity, MapPin, Search, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AnimateOnView } from "@/components/AnimateOnView";

type Paciente = {
  id: string;
  nombres: string;
  apellidos: string;
  cedula: string;
  edad: number | null;
  condicion: string | null;
  procedencia: string | null;
  fecha_reporte: string | null;
  centro_nombre: string;
  centro_zona: string;
};

export function BuscarPersonasContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [search, setSearch] = useState(initialQuery);
  const [results, setResults] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const runSearch = async (query: string) => {
    if (!query.trim() || query.length < 3) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pacientes/buscar?q=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      setResults(data.pacientes || []);
    } catch (error) {
      console.error("Error buscando:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery.length >= 3) {
      runSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(search);
  };

  return (
    <>
      <form onSubmit={handleSearch} className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-foreground/60" />
        </div>
        <input
          type="text"
          className="block w-full pl-14 pr-32 py-5 rounded-2xl bg-foreground/10 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-1! focus:ring-blue-400! transition-shadow text-xl glass-card"
          placeholder="Ej. Juan Perez o 12345678"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button
          type="submit"
          disabled={loading || search.length < 3}
          className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-foreground text-background font-bold transition-colors hover:bg-foreground/80 disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      <div>
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground" />
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-20 glass-card rounded-3xl">
            <User className="mx-auto h-16 w-16 text-foreground/50 mb-4" />
            <h3 className="text-2xl font-medium text-foreground mb-2">
              Sin resultados
            </h3>
            <p className="text-foreground/70 max-w-md mx-auto">
              No encontramos registros exactos para &quot;{search}&quot;.
              Intenta usar solo el primer nombre y apellido, o verifica la
              cedula de identidad.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((paciente, idx) => (
              <AnimateOnView
                key={paciente.id}
                animation="scale"
                delay={idx * 0.05}
                duration={0.4}
              >
                <article className="glass-card rounded-2xl p-6">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-foreground capitalize">
                        {paciente.nombres.toLowerCase()}{" "}
                        {paciente.apellidos.toLowerCase()}
                      </h3>
                      <p className="text-foreground/60 text-sm font-mono mt-1">
                        C.I: {paciente.cedula}
                      </p>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-foreground/10 text-foreground">
                      {paciente.condicion || "INGRESADO"}
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <div className="flex items-center text-foreground/75">
                      <MapPin className="text-foreground/50 mr-3" size={18} />
                      <span>
                        <strong className="text-foreground">Ubicacion:</strong>{" "}
                        {paciente.centro_nombre} ({paciente.centro_zona})
                      </span>
                    </div>
                    {paciente.procedencia && (
                      <div className="flex items-center text-foreground/75">
                        <User className="text-foreground/50 mr-3" size={18} />
                        <span>
                          <strong className="text-foreground">
                            Procedencia:
                          </strong>{" "}
                          {paciente.procedencia}
                        </span>
                      </div>
                    )}
                    {paciente.edad && (
                      <div className="flex items-center text-foreground/75">
                        <Activity
                          className="text-foreground/50 mr-3"
                          size={18}
                        />
                        <span>
                          <strong className="text-foreground">Edad:</strong>{" "}
                          {paciente.edad} anos
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              </AnimateOnView>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
