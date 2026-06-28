"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Search, Heart, HandHeart } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import Chatbot from "@/components/Chatbot";
import { motion } from "framer-motion";

type ResourceProps = {
  category: string;
  name: string;
  url: string;
  description: string;
};

export default function Home() {
  const [resources, setResources] = useState<ResourceProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/resources`)
      .then((res) => res.json())
      .then((data) => {
        if (data.resources) setResources(data.resources);
      })
      .catch((err) => console.error("Error fetching resources:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = Array.from(new Set(resources.map((r) => r.category)));

  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? r.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-yellow-400 font-medium mb-8"
        >
          <AlertCircle size={16} />
          <span>Información Oficial de Emergencia</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-white to-blue-400"
        >
          Venezolanos Unidos
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Plataforma centralizada de recursos, apoyo y asistencia tras el reciente sismo. 
          Encuentra centros de acopio, reportes de desaparecidos y evaluación estructural.
        </motion.p>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-2xl mx-auto"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 rounded-2xl glass-card text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-lg"
            placeholder="Buscar refugios, hospitales, rescatistas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </motion.div>
        {/* Navigation Buttons */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-4 justify-center items-center mt-10"
        >
          <a
            href="/buscar"
            className="px-8 py-4 rounded-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-lg shadow-lg shadow-yellow-500/20 transition-all hover:-translate-y-1"
          >
            Buscar Personas/Pacientes
          </a>
          <a
            href="/reportar"
            className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg border border-white/20 transition-all hover:-translate-y-1"
          >
            Reportar Paciente
          </a>
          <a
            href="/dashboard"
            className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg border border-white/20 transition-all hover:-translate-y-1"
          >
            Dashboard
          </a>
          <a
            href="/traductores"
            className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
          >
            Red de Traductores
          </a>
        </motion.div>
      </div>

      {/* Category Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null 
                ? "bg-white text-slate-900 shadow-lg" 
                : "glass-card text-slate-300 hover:text-white hover:bg-slate-800"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "glass-card text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredResources.map((resource, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <ResourceCard resource={resource} />
              </motion.div>
            ))}
          </motion.div>
        )}
        {!loading && filteredResources.length === 0 && (
          <div className="text-center py-20">
            <HandHeart className="mx-auto h-12 w-12 text-slate-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No se encontraron recursos</h3>
            <p className="text-slate-400">Intenta buscar con otros términos o cambia la categoría.</p>
          </div>
        )}
      </div>

      {/* Chatbot Component */}
      <Chatbot />
      
      {/* Footer */}
      <footer className="mt-24 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
          <p className="flex items-center gap-1">
            Creado con <Heart size={14} className="text-red-500" /> por y para los venezolanos.
          </p>
          <p>Fuerza Venezuela 💛💙❤️</p>
        </div>
      </footer>
    </main>
  );
}
