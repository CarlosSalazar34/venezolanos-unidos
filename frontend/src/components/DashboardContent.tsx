"use client";

import type { ReactNode } from "react";
import { Activity, Home, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnimateOnView } from "@/components/AnimateOnView";

export type Estadisticas = {
  total_pacientes: number;
  total_centros: number;
  condiciones: { name: string; value: number }[];
  hospitales: { name: string; pacientes: number }[];
};

const chartOpacities = [1, 0.8, 0.6, 0.45, 0.3];

interface DashboardContentProps {
  stats: Estadisticas | null;
}

export function DashboardContent({ stats }: DashboardContentProps) {
  if (!stats) {
    return (
      <div className="text-center py-20 glass-card rounded-3xl">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          No hay metricas disponibles
        </h2>
        <p className="text-foreground/70">
          Intenta nuevamente cuando el servicio de datos este disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={<Users size={32} />}
          label="Total Pacientes"
          value={stats.total_pacientes}
        />
        <MetricCard
          icon={<Activity size={32} />}
          label="Condiciones Activas"
          value={stats.condiciones.length}
        />
        <MetricCard
          icon={<Home size={32} />}
          label="Centros/Refugios"
          value={stats.total_centros}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimateOnView animation="slideUp" duration={0.5}>
          <section className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">
              Top 5 Centros con mas pacientes
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.hospitales}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--foreground)"
                    opacity={0.15}
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    stroke="var(--foreground)"
                    opacity={0.7}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    stroke="var(--foreground)"
                    opacity={0.7}
                    fontSize={12}
                    tickFormatter={(value) => `${value.substring(0, 15)}...`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid color-mix(in srgb, var(--foreground) 20%, transparent)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                  />
                  <Bar dataKey="pacientes" fill="var(--foreground)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </AnimateOnView>

        <AnimateOnView animation="slideUp" delay={0.1} duration={0.5}>
          <section className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-6">
              Estado Actual
            </h3>
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
                      <Cell
                        key={`cell-${entry.name}`}
                        fill="var(--foreground)"
                        opacity={chartOpacities[index % chartOpacities.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid color-mix(in srgb, var(--foreground) 20%, transparent)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 flex-wrap mt-2">
              {stats.condiciones.map((condition, index) => (
                <div key={condition.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2 bg-foreground"
                    style={{
                      opacity: chartOpacities[index % chartOpacities.length],
                    }}
                  />
                  <span className="text-sm text-foreground/75">
                    {condition.name}: {condition.value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </AnimateOnView>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <AnimateOnView animation="scale" duration={0.4}>
      <article className="glass-card rounded-2xl p-6 flex items-center">
        <div className="p-4 bg-foreground/10 text-foreground rounded-xl mr-4">
          {icon}
        </div>
        <div>
          <p className="text-foreground/70 font-medium">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
        </div>
      </article>
    </AnimateOnView>
  );
}
