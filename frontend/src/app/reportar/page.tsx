"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, CheckCircle } from "lucide-react";

export default function ReportarPage() {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    cedula: "",
    edad: "",
    hospital: "",
    condicion: "Ingresado",
    procedencia: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pacientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          edad: formData.edad ? parseInt(formData.edad) : null,
        }),
      });
      
      if (res.ok) {
        setSuccess(true);
        setFormData({
          nombres: "",
          apellidos: "",
          cedula: "",
          edad: "",
          hospital: "",
          condicion: "Ingresado",
          procedencia: "",
        });
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un error al registrar el paciente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <main className="min-h-screen pt-24 pb-24 px-4 sm:px-6 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-3xl p-10 max-w-lg text-center">
          <CheckCircle className="mx-auto h-20 w-20 text-green-400 mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Registro Exitoso</h2>
          <p className="text-slate-300 mb-8">
            El paciente ha sido registrado en la base de datos nacional y ya está disponible en el buscador.
          </p>
          <button onClick={() => setSuccess(false)} className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors w-full">
            Registrar otro paciente
          </button>
          <Link href="/buscar" className="block mt-4 text-yellow-400 hover:text-yellow-300">
            Ir al Buscador
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" />
        Volver al inicio
      </Link>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-4">
          Reportar Familiar o Paciente
        </h1>
        <p className="text-slate-400 text-lg">
          Ingresa los datos de una persona ingresada en un centro de salud o refugio para que otros puedan encontrarla.
        </p>
      </motion.div>

      <motion.form 
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-6 sm:p-10 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Nombres *</label>
            <input required type="text" name="nombres" value={formData.nombres} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none" placeholder="Ej. Juan Carlos" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Apellidos *</label>
            <input required type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none" placeholder="Ej. Pérez" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cédula de Identidad *</label>
            <input required type="text" name="cedula" value={formData.cedula} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none" placeholder="Ej. V12345678" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Edad (Opcional)</label>
            <input type="number" name="edad" value={formData.edad} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none" placeholder="Ej. 35" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Hospital o Refugio *</label>
            <input required type="text" name="hospital" value={formData.hospital} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none" placeholder="Ej. Hospital Militar" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Estado / Condición</label>
            <select name="condicion" value={formData.condicion} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none">
              <option value="Ingresado">Ingresado</option>
              <option value="Alta">De Alta</option>
              <option value="Fallecido">Fallecido</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Procedencia o Zona (Opcional)</label>
          <input type="text" name="procedencia" value={formData.procedencia} onChange={handleChange} className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none" placeholder="Ej. Catia, La Guaira..." />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-lg py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Registro"}
        </button>
      </motion.form>
    </main>
  );
}
