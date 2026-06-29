"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { AnimateOnView } from "@/components/AnimateOnView";

const inputClassName =
  "w-full bg-background/50 border border-foreground/20 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/50 focus:ring-2 focus:ring-foreground focus:outline-none";
const labelClassName = "block text-sm font-medium text-foreground/75 mb-2";

export function ReportarForm() {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/pacientes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            edad: formData.edad ? parseInt(formData.edad) : null,
          }),
        },
      );

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

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  if (success) {
    return (
      <AnimateOnView animation="scale" duration={0.4}>
        <section className="glass-card rounded-3xl p-10 text-center">
          <CheckCircle className="mx-auto h-20 w-20 text-foreground mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Registro Exitoso
          </h2>
          <p className="text-foreground/70 mb-8">
            El paciente ha sido registrado y ya esta disponible en el buscador.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-3 bg-foreground text-background rounded-xl font-medium transition-colors hover:bg-foreground/80 w-full"
          >
            Registrar otro paciente
          </button>
          <Link
            href="/buscar"
            className="block mt-4 text-foreground/70 hover:text-foreground"
          >
            Ir al Buscador
          </Link>
        </section>
      </AnimateOnView>
    );
  }

  return (
    <AnimateOnView animation="slideUp" delay={0.1} duration={0.5}>
      <form
        onSubmit={handleSubmit}
        className="glass-card rounded-3xl p-6 sm:p-10 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClassName}>Nombres *</label>
            <input
              required
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Ej. Juan Carlos"
            />
          </div>
          <div>
            <label className={labelClassName}>Apellidos *</label>
            <input
              required
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Ej. Perez"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClassName}>Cedula de Identidad *</label>
            <input
              required
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Ej. V12345678"
            />
          </div>
          <div>
            <label className={labelClassName}>Edad (Opcional)</label>
            <input
              type="number"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Ej. 35"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClassName}>Hospital o Refugio *</label>
            <input
              required
              type="text"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Ej. Hospital Militar"
            />
          </div>
          <div>
            <label className={labelClassName}>Estado / Condicion</label>
            <select
              name="condicion"
              value={formData.condicion}
              onChange={handleChange}
              className={inputClassName}
            >
              <option value="Ingresado">Ingresado</option>
              <option value="Alta">De Alta</option>
              <option value="Fallecido">Fallecido</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClassName}>Procedencia o Zona (Opcional)</label>
          <input
            type="text"
            name="procedencia"
            value={formData.procedencia}
            onChange={handleChange}
            className={inputClassName}
            placeholder="Ej. Catia, La Guaira..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 bg-foreground text-background font-bold text-lg py-4 rounded-xl transition-colors hover:bg-foreground/80 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Registro"}
        </button>
      </form>
    </AnimateOnView>
  );
}
