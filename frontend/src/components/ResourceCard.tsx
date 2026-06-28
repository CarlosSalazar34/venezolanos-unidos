import { ExternalLink, Users, ShieldAlert, Home, HeartPulse, Building2, MapPin, Bone } from "lucide-react";

type ResourceProps = {
  category: string;
  name: string;
  url: string;
  description: string;
};

const getCategoryIcon = (category: string) => {
  if (category.includes("desaparecidas")) return <Users className="text-blue-400" />;
  if (category.includes("Rescate")) return <ShieldAlert className="text-red-500" />;
  if (category.includes("estructurales")) return <Building2 className="text-yellow-500" />;
  if (category.includes("Habitabilidad")) return <Home className="text-green-400" />;
  if (category.includes("acopio")) return <MapPin className="text-purple-400" />;
  if (category.includes("Alimentación")) return <Home className="text-orange-400" />;
  if (category.includes("médico")) return <HeartPulse className="text-pink-400" />;
  if (category.includes("Mascotas")) return <Bone className="text-yellow-600" />;
  return <ExternalLink className="text-slate-400" />;
};

export default function ResourceCard({ resource }: { resource: ResourceProps }) {
  return (
    <a 
      href={resource.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="glass-card glass-card-hover block p-6 rounded-2xl h-full flex flex-col group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-900/50 rounded-xl">
          {getCategoryIcon(resource.category)}
        </div>
        <div className="bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-300">
            {resource.category}
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
        {resource.name}
      </h3>
      <p className="text-slate-400 text-sm flex-1 leading-relaxed">
        {resource.description}
      </p>
      
      <div className="mt-6 flex items-center text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
        Visitar sitio web
        <ExternalLink size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
      </div>
    </a>
  );
}
