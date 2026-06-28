"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Users, Activity, Home } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

type Estadisticas = {
  total_pacientes: number;
  total_centros: number;
  condiciones: { name: string; value: number }[];
  hospitales: { name: string; pacientes: number }[];
};

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"];

export default function Dashboard() {
  const [stats, setStats] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/estadisticas`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} className="mr-1" />
        Volver al inicio
      </Link>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Dashboard de Impacto
        </h1>
        <p className="text-slate-400 text-lg">
          Métricas en tiempo real de los pacientes y centros de salud registrados en la plataforma.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
        </div>
      ) : (
        stats && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-2xl p-6 flex items-center">
                <div className="p-4 bg-blue-500/20 rounded-xl mr-4">
                  <Users className="text-blue-400" size={32} />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Total Pacientes</p>
                  <p className="text-3xl font-bold text-white">{stats.total_pacientes}</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6 flex items-center">
                <div className="p-4 bg-yellow-500/20 rounded-xl mr-4">
                  <Activity className="text-yellow-400" size={32} />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Condiciones Activas</p>
                  <p className="text-3xl font-bold text-white">{stats.condiciones.length}</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6 flex items-center">
                <div className="p-4 bg-purple-500/20 rounded-xl mr-4">
                  <Home className="text-purple-400" size={32} />
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Centros/Refugios</p>
                  <p className="text-3xl font-bold text-white">{stats.total_centros}</p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bar Chart: Top Hospitals */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Top 5 Centros con más pacientes</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.hospitales} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" fontSize={12} tickFormatter={(val) => val.substring(0, 15) + "..."} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Bar dataKey="pacientes" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart: Status Breakdown */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Estado Actual (Distribución)</h3>
                <div className="h-80 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.condiciones}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.condiciones.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 flex-wrap mt-2">
                  {stats.condiciones.map((c, i) => (
                    <div key={c.name} className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-sm text-slate-300">{c.name}: {c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </main>
  );
}
