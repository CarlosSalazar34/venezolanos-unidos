"use client";

import { useState, useEffect } from "react";
import { Search, Globe, Phone, MapPin, Clock, ChevronLeft, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type Traductor = {
  id: string;
  nombres: string;
  idiomas: string;
  telefono: string;
  zona: string | null;
  disponibilidad: string | null;
  fecha_registro: string;
};

export default function TraductoresPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Traductor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTraductores = async (q: string = "") => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/traductores${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const data = await res.json();
      setResults(data.traductores || []);
    } catch (error) {
      console.error("Error buscando traductores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraductores();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTraductores(search);
  };

  const handleDelete = async (id: string) => {
    const pin = prompt("Para eliminar tu registro, por favor ingresa tu PIN de seguridad (4 dígitos):");
    if (!pin) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/traductores/${id}?pin_seguridad=${encodeURIComponent(pin)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Registro eliminado exitosamente.");
        fetchTraductores(search);
      } else {
        alert("PIN incorrecto o hubo un error al eliminar.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión.");
    }
  };

  const formatWhatsAppUrl = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return `https://wa.me/${cleaned}`;
  };

  return (
    <main className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" />
        Volver al inicio
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Red de Traductores
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Voluntarios bilingües y multilingües dispuestos a ayudar en la comunicación entre rescatistas internacionales y víctimas extranjeras.
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Link href="/traductores/registro" className="inline-flex items-center px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1">
            <Plus size={20} className="mr-2" />
            Quiero Ayudar
          </Link>
        </motion.div>
      </div>

      <form onSubmit={handleSearch} className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-14 pr-32 py-5 rounded-2xl glass-card text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-xl"
          placeholder="Busca por idioma (Ej. Inglés, Mandarín, Francés)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Results */}
      <div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl">
            <Globe className="mx-auto h-16 w-16 text-slate-500 mb-4" />
            <h3 className="text-2xl font-medium text-white mb-2">No hay traductores disponibles</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              No encontramos traductores registrados para tu búsqueda. ¡Sé el primero en registrarte si dominas otro idioma!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-card rounded-2xl p-6 relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Globe size={100} />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-white capitalize">
                      {t.nombres}
                    </h3>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-2"
                      title="Eliminar registro"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 font-medium mb-6">
                    {t.idiomas}
                  </div>

                  <div className="space-y-3 mb-8">
                    {t.zona && (
                      <div className="flex items-center text-slate-300">
                        <MapPin className="text-slate-500 mr-3" size={18} />
                        <span>{t.zona}</span>
                      </div>
                    )}
                    {t.disponibilidad && (
                      <div className="flex items-center text-slate-300">
                        <Clock className="text-slate-500 mr-3" size={18} />
                        <span>{t.disponibilidad}</span>
                      </div>
                    )}
                  </div>

                  <a 
                    href={formatWhatsAppUrl(t.telefono)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-3 px-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold transition-colors"
                  >
                    <Phone size={20} className="mr-2" />
                    Contactar por WhatsApp
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
