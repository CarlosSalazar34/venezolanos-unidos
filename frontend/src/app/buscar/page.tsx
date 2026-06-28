"use client";

import { useState } from "react";
import { Search, MapPin, Activity, User, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

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

export default function BuscarPersonas() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim() || search.length < 3) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pacientes/buscar?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setResults(data.pacientes || []);
    } catch (error) {
      console.error("Error buscando:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" />
        Volver al inicio
      </Link>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Buscador de Personas y Pacientes
        </h1>
        <p className="text-slate-400 text-lg">
          Busca a familiares o amigos en nuestra base de datos consolidada de hospitales, refugios y centros de salud (escribe al menos 3 letras o números).
        </p>
      </motion.div>

      <form onSubmit={handleSearch} className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-14 pr-32 py-5 rounded-2xl glass-card text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-shadow text-xl"
          placeholder="Ej. Juan Pérez o 12345678"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || search.length < 3}
          className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold transition-colors disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-400"
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {/* Results */}
      <div>
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-20 glass-card rounded-3xl">
            <User className="mx-auto h-16 w-16 text-slate-500 mb-4" />
            <h3 className="text-2xl font-medium text-white mb-2">Sin resultados</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              No encontramos registros exactos para &quot;{search}&quot;. Intenta usar solo el primer nombre y apellido, o verifica la cédula de identidad.
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((paciente, idx) => (
              <motion.div
                key={paciente.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white capitalize">
                      {paciente.nombres.toLowerCase()} {paciente.apellidos.toLowerCase()}
                    </h3>
                    <p className="text-slate-400 text-sm font-mono mt-1">C.I: {paciente.cedula}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${paciente.condicion?.toLowerCase().includes("fallecido") ? "bg-red-500/20 text-red-400" :
                      paciente.condicion?.toLowerCase().includes("alta") ? "bg-green-500/20 text-green-400" :
                        "bg-blue-500/20 text-blue-400"
                    }`}>
                    {paciente.condicion || "INGRESADO"}
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center text-slate-300">
                    <MapPin className="text-slate-500 mr-3" size={18} />
                    <span>
                      <strong className="text-white">Ubicación:</strong> {paciente.centro_nombre} ({paciente.centro_zona})
                    </span>
                  </div>
                  {paciente.procedencia && (
                    <div className="flex items-center text-slate-300">
                      <User className="text-slate-500 mr-3" size={18} />
                      <span>
                        <strong className="text-white">Procedencia:</strong> {paciente.procedencia}
                      </span>
                    </div>
                  )}
                  {paciente.edad && (
                    <div className="flex items-center text-slate-300">
                      <Activity className="text-slate-500 mr-3" size={18} />
                      <span>
                        <strong className="text-white">Edad:</strong> {paciente.edad} años
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
