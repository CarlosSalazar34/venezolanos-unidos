import { Heart, MessageCircle } from "lucide-react";
import Chatbot from "@/components/Chatbot";
import { HeroSection } from "@/components/HeroSection";
import { NavigationButtons } from "@/components/NavigationButtons";
import { ResourcesGrid } from "@/components/ResourcesGrid";
import React from "react";
import { FaWhatsapp } from "react-icons/fa6";
import SectionScroll from "@/components/templates/SectionScroll";
import { getResources } from "@/lib/api/resources";

type RouteButton = {
  label: string;
  href: string;
  isExternal?: boolean;
  icon?: React.ReactNode;
};

const routes: RouteButton[] = [
  { label: "Buscar Personas", href: "/buscar" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Reportar Paciente", href: "/reportar" },
  { label: "Red de Traductores", href: "/traductores" },
  {
    label: "Grupo de Difusión",
    href: "https://chat.whatsapp.com/KERFsSNPLuPHHDBU0Q7uvV?s=cl&p=i&mlu=4",
    isExternal: true,
    icon: <FaWhatsapp size={18} />,
  },
];

export default async function Home() {
  const resources = await getResources();

  return (
    <SectionScroll>
      <main className="min-h-screen bg-background flex flex-col justify-center items-center gap-10 p-3 sm:p-10">
        <HeroSection />
        <NavigationButtons routes={routes} />

        <ResourcesGrid resources={resources} />

        {/* Chatbot Component */}
        <Chatbot />

        {/* Footer */}
        <footer className="border-t border-white/10 py-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
            <p className="flex items-center gap-1">
              Creado con <Heart size={14} className="text-red-500" /> por y para
              los venezolanos.
            </p>
            <p>Fuerza Venezuela 💛💙❤️</p>
          </div>
        </footer>
      </main>
    </SectionScroll>
  );
}
