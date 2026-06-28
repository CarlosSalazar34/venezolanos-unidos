"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, CheckCircle, Shield } from "lucide-react";

export default function RegistroTraductorPage() {
  const [formData, setFormData] = useState({
    nombres: "",
    idiomas: "",
    telefono: "",
    zona: "",
    disponibilidad: "",
    pin_seguridad: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/traductores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setSuccess(true);
      } else {
        alert("Hubo un error al registrarte.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <main className="min-h-screen pt-24 pb-24 px-4 sm:px-6 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-3xl p-10 max-w-lg text-center">
          <CheckCircle className="mx-auto h-20 w-20 text-blue-400 mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">¡Gracias por ser Voluntario!</h2>
          <p className="text-slate-300 mb-8">
            Tu perfil ahora está visible en la Red de Traductores. Guarda bien tu PIN de seguridad por si necesitas eliminar tu registro.
          </p>
          <Link href="/traductores" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors w-full block">
            Ver Directorio
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Link href="/traductores" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" />
        Volver al directorio
      </Link>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">
          Únete a la Red de Traductores
        </h1>
        <p className="text-slate-400 text-lg">
          Tu habilidad para hablar otros idiomas puede salvar vidas conectando equipos internacionales con víctimas locales.
        </p>
      </motion.div>

      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-6 sm:p-10 space-y-6 border border-blue-900/30"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tu Nombre *</label>
            <input required type="text" name="nombres" value={formData.nombres} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ej. Ana Suárez" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Idiomas que Dominas *</label>
            <input required type="text" name="idiomas" value={formData.idiomas} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ej. Inglés, Francés nativo" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono / WhatsApp *</label>
            <input required type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ej. +584141234567" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Disponibilidad</label>
            <input type="text" name="disponibilidad" value={formData.disponibilidad} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ej. 24/7, Solo Tardes" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Zona Horaria o Ubicación</label>
          <input type="text" name="zona" value={formData.zona} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ej. Caracas (UTC-4) o España" />
        </div>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
          <div className="flex items-center text-yellow-400 mb-2">
            <Shield size={18} className="mr-2" />
            <span className="font-semibold text-sm">PIN de Seguridad *</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">Ingresa 4 números que usarás más adelante si deseas eliminar tu registro de la plataforma.</p>
          <input 
            required 
            type="password" 
            maxLength={4}
            pattern="\d{4}"
            name="pin_seguridad" 
            value={formData.pin_seguridad} 
            onChange={handleChange} 
            className="w-full md:w-1/2 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none" 
            placeholder="Ej. 1234" 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Inscribirme como Traductor"}
        </button>
      </motion.form>
    </main>
  );
}
